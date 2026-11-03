import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import autoConfig from '../../firebase-applet-config.json';

// Set Firestore log level to 'error' to avoid benign offline-fallback warnings in restricted network environments
try {
  setLogLevel('error');
} catch {
  // Ignore if already configured
}

export interface FirebaseConsoleConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
  databaseId?: string;
}

const FIREBASE_LOCAL_CONFIG_KEY = 'erapor_firebase_console_config_v1';

// Prioritizes provisioned autoConfig, then local overrides, then Vite env vars
export const getActiveFirebaseConfig = (): FirebaseConsoleConfig => {
  // 1. If provisioned firebase-applet-config.json has valid keys, use it!
  if (autoConfig && autoConfig.projectId && autoConfig.apiKey) {
    return {
      apiKey: autoConfig.apiKey,
      authDomain: autoConfig.authDomain,
      projectId: autoConfig.projectId,
      storageBucket: autoConfig.storageBucket,
      messagingSenderId: autoConfig.messagingSenderId,
      appId: autoConfig.appId,
      firestoreDatabaseId: autoConfig.firestoreDatabaseId,
    };
  }

  // 2. Check localStorage
  try {
    const saved = localStorage.getItem(FIREBASE_LOCAL_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore
  }

  // 3. Fallback to Vite env variables (Vercel)
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  return {
    apiKey: envApiKey || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: envProjectId || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)',
  };
};

export const saveFirebaseConsoleConfig = (config: FirebaseConsoleConfig) => {
  localStorage.setItem(FIREBASE_LOCAL_CONFIG_KEY, JSON.stringify(config));
};

export const clearFirebaseConsoleConfig = () => {
  localStorage.removeItem(FIREBASE_LOCAL_CONFIG_KEY);
};

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

export const getFirebaseInstances = () => {
  const config = getActiveFirebaseConfig();
  if (!config || !config.apiKey) return { app: null, db: null, auth: null };

  try {
    if (!getApps().length) {
      cachedApp = initializeApp(config);
    } else {
      cachedApp = getApp();
    }

    if (!cachedDb) {
      try {
        let cacheConfig;
        try {
          cacheConfig = persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          });
        } catch {
          // Fall back gracefully if IndexedDB is unavailable
          cacheConfig = undefined;
        }

        const targetDbId =
          config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
            ? config.firestoreDatabaseId
            : undefined;

        cachedDb = initializeFirestore(
          cachedApp,
          {
            experimentalAutoDetectLongPolling: true,
            localCache: cacheConfig,
          },
          targetDbId
        );
      } catch {
        // If Firestore was already initialized on this App instance
        cachedDb = config.firestoreDatabaseId
          ? getFirestore(cachedApp, config.firestoreDatabaseId)
          : getFirestore(cachedApp);
      }
    }

    if (!cachedAuth) {
      cachedAuth = getAuth(cachedApp);
    }

    return { app: cachedApp, db: cachedDb, auth: cachedAuth };
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
    return { app: null, db: null, auth: null };
  }
};

/**
 * Test connectivity to Firestore
 */
export const testFirestoreConnection = async (configOverride?: FirebaseConsoleConfig): Promise<{ success: boolean; message: string; latencyMs: number }> => {
  const startTime = Date.now();
  const config = configOverride || getActiveFirebaseConfig();

  if (!config || !config.projectId || !config.apiKey) {
    return {
      success: false,
      message: 'Konfigurasi Firebase belum terisi.',
      latencyMs: 0,
    };
  }

  try {
    const testAppName = `test-app-${Date.now()}`;
    const testApp = initializeApp(config, testAppName);
    const targetDbId =
      config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
        ? config.firestoreDatabaseId
        : undefined;

    const db = initializeFirestore(
      testApp,
      {
        experimentalAutoDetectLongPolling: true,
      },
      targetDbId
    );

    // Test write a health-check document with a 6-second timeout guarantee
    const testRef = doc(db, 'system_health', 'erapor_connection_test');
    const writePromise = setDoc(testRef, {
      lastCheck: new Date().toISOString(),
      appName: 'e-Rapor Merdeka',
      status: 'active',
      school: 'SMP Negeri 1 Merdeka Nusantara',
    }, { merge: true });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Waktu tunggu koneksi habis (timeout 6 detik)')), 6000)
    );

    await Promise.race([writePromise, timeoutPromise]);

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: `Berhasil terhubung ke Firebase Project [${config.projectId}]! Database: ${config.firestoreDatabaseId || '(default)'}. Latensi: ${latencyMs}ms.`,
      latencyMs,
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      message: `Status koneksi: ${error.message || error}`,
      latencyMs,
    };
  }
};
