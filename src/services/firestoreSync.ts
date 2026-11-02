import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseInstances } from './firebase';
import { SystemBackupData, SchoolProfile } from '../types/erapor';

const STATE_DOC_PATH = 'erapor_main_state';
const STATE_COLLECTION = 'school_data';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path,
  };
  console.warn('Firestore Sync Note: ', JSON.stringify(errInfo));
}

let isLocalMutation = false;

/**
 * Save full or partial state to Firestore
 */
export async function pushStateToFirestore(data: Partial<SystemBackupData>): Promise<boolean> {
  const { db } = getFirebaseInstances();
  if (!db) {
    console.warn('Firestore db instance not available');
    return false;
  }

  isLocalMutation = true;
  try {
    const docRef = doc(db, STATE_COLLECTION, STATE_DOC_PATH);
    await setDoc(docRef, {
      ...data,
      lastUpdatedAt: new Date().toISOString(),
      updatedFrom: 'erapor-web-client',
    }, { merge: true });
    
    setTimeout(() => {
      isLocalMutation = false;
    }, 500);
    return true;
  } catch (error) {
    isLocalMutation = false;
    handleFirestoreError(error, OperationType.WRITE, `${STATE_COLLECTION}/${STATE_DOC_PATH}`);
    return false;
  }
}

/**
 * Save SchoolProfile specifically to Firestore
 */
export async function pushSchoolProfileToFirestore(profile: SchoolProfile): Promise<boolean> {
  const { db } = getFirebaseInstances();
  if (!db) return false;

  try {
    const profileRef = doc(db, 'schoolProfile', profile.id || 'school-1');
    await setDoc(profileRef, {
      ...profile,
      lastUpdatedAt: new Date().toISOString(),
    }, { merge: true });

    // Also sync to main document so onSnapshot fires across all devices
    await pushStateToFirestore({ schoolProfile: profile });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'schoolProfile');
    return false;
  }
}

/**
 * Subscribe to realtime updates from Firestore across all browsers/devices
 */
export function subscribeToFirestoreState(
  onStateReceived: (remoteData: Partial<SystemBackupData>) => void,
  onSyncStatusChange?: (status: 'connected' | 'syncing' | 'offline' | 'error') => void
): () => void {
  const { db } = getFirebaseInstances();
  if (!db) {
    if (onSyncStatusChange) onSyncStatusChange('offline');
    return () => {};
  }

  if (onSyncStatusChange) onSyncStatusChange('syncing');

  const docRef = doc(db, STATE_COLLECTION, STATE_DOC_PATH);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data() as Partial<SystemBackupData>;
        if (onSyncStatusChange) onSyncStatusChange('connected');

        // Only update local state if this change originated from another browser/client
        if (!isLocalMutation) {
          onStateReceived(remoteData);
        }
      } else {
        if (onSyncStatusChange) onSyncStatusChange('connected');
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${STATE_COLLECTION}/${STATE_DOC_PATH}`);
      if (onSyncStatusChange) onSyncStatusChange('error');
    }
  );

  return unsubscribe;
}
