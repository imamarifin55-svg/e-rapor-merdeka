import React from 'react';

interface LogoProps {
  customSrc?: string;
  className?: string;
  alt?: string;
}

/**
 * Official Logo Lambang Pemerintah Daerah Kabupaten Tulang Bawang Barat
 * Menampilkan gambar custom jika telah diupload, atau lambang perisai daerah resmi Tubaba (Lampung)
 */
export const PemdaLogo: React.FC<LogoProps> = ({ customSrc, className = 'w-16 h-16', alt = 'Logo Pemda Tulang Bawang Barat' }) => {
  if (customSrc && customSrc.trim() !== '') {
    return (
      <img
        src={customSrc}
        alt={alt}
        className={`${className} object-contain shrink-0`}
      />
    );
  }

  // Official Seal Vector of Kabupaten Tulang Bawang Barat (Lampung)
  return (
    <div className={`${className} shrink-0 flex items-center justify-center`} title="Lambang Resmi Pemkab Tulang Bawang Barat">
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield Outer Golden & Green border */}
        <path
          d="M50 4 C75 4 92 14 94 38 C96 68 76 98 50 116 C24 98 4 68 6 38 C8 14 25 4 50 4 Z"
          fill="#065f46"
          stroke="#eab308"
          strokeWidth="3.5"
        />
        {/* Inner Shield */}
        <path
          d="M50 10 C71 10 86 18 87 39 C89 65 72 91 50 108 C28 91 11 65 13 39 C14 18 29 10 50 10 Z"
          fill="#047857"
        />
        {/* Siger Lampung Crown at Top */}
        <path
          d="M28 36 C34 22 42 32 50 20 C58 32 66 22 72 36 C64 34 56 38 50 34 C44 38 36 34 28 36 Z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="1.2"
        />
        {/* Golden 5-Pointed Star */}
        <polygon
          points="50,38 53,46 62,46 55,51 58,59 50,54 42,59 45,51 38,46 47,46"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="0.8"
        />
        {/* Traditional House / Payung Adat & Keris */}
        <path
          d="M34 68 L50 56 L66 68 L62 82 L38 82 Z"
          fill="#b91c1c"
          stroke="#fef08a"
          strokeWidth="1"
        />
        <rect x="46" y="66" width="8" height="16" fill="#facc15" />
        {/* Water wave stripes (Tulang Bawang river) */}
        <path
          d="M25 88 Q37 84 50 88 T75 88"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M27 94 Q38 90 50 94 T73 94"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Banner Ribbon Tubaba */}
        <path
          d="M18 98 Q50 105 82 98 L80 106 Q50 114 20 106 Z"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="1"
        />
        <text
          x="50"
          y="104.5"
          textAnchor="middle"
          fontSize="5.2"
          fontWeight="900"
          fill="#0f172a"
          letterSpacing="0.4"
          fontFamily="sans-serif"
        >
          TUBABA
        </text>
      </svg>
    </div>
  );
};

/**
 * Official Logo Sekolah / Lambang Kemendikbudristek Tut Wuri Handayani
 * Menampilkan gambar custom jika telah diupload, atau lambang resmi Tut Wuri Handayani
 */
export const SchoolLogo: React.FC<LogoProps> = ({ customSrc, className = 'w-16 h-16', alt = 'Logo SMPN 14 Tulang Bawang Barat' }) => {
  if (customSrc && customSrc.trim() !== '') {
    return (
      <img
        src={customSrc}
        alt={alt}
        className={`${className} object-contain shrink-0`}
      />
    );
  }

  // Official Kemendikbud Tut Wuri Handayani Vector Emblem
  return (
    <div className={`${className} shrink-0 flex items-center justify-center`} title="Lambang Tut Wuri Handayani / Sekolah">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Circular Rim */}
        <circle cx="50" cy="50" r="47" fill="#1e3a8a" stroke="#facc15" strokeWidth="3" />
        <circle cx="50" cy="50" r="42" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
        
        {/* Fire / Api Semangat Pancasila (3 Lidah Api) */}
        <path
          d="M50 18 C52 25 57 28 59 34 C61 41 57 45 50 48 C43 45 39 41 41 34 C43 28 48 25 50 18 Z"
          fill="#dc2626"
          stroke="#fef08a"
          strokeWidth="1"
        />
        <path
          d="M50 24 C51 28 54 30 55 35 C56 39 53 42 50 44 C47 42 44 39 45 35 C46 30 49 28 50 24 Z"
          fill="#f59e0b"
        />

        {/* Belanga / Wadah Api */}
        <path
          d="M40 47 C44 49 56 49 60 47 L62 52 C58 54 42 54 38 52 Z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="0.8"
        />

        {/* Garuda Wings / Sayap Tut Wuri Handayani */}
        <path
          d="M50 52 C32 50 18 60 14 74 C26 73 37 68 50 63 C63 68 74 73 86 74 C82 60 68 50 50 52 Z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="1.2"
        />
        {/* Feather details */}
        <path
          d="M20 72 C30 70 40 66 50 62 M80 72 C70 70 60 66 50 62"
          stroke="#854d0e"
          strokeWidth="0.8"
        />

        {/* Open Book (Buku Terbuka Pengetahuan) */}
        <path
          d="M50 64 C42 61 30 63 22 68 L22 79 C30 74 42 72 50 75 C58 72 70 74 78 79 L78 68 C70 63 58 61 50 64 Z"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth="1.2"
        />
        <line x1="50" y1="64" x2="50" y2="75" stroke="#0f172a" strokeWidth="1.2" />

        {/* Bottom Banner Ribbon with text TUT WURI HANDAYANI */}
        <path
          d="M16 82 Q50 90 84 82 L82 89 Q50 97 18 89 Z"
          fill="#ffffff"
          stroke="#facc15"
          strokeWidth="1"
        />
        <text
          x="50"
          y="87.5"
          textAnchor="middle"
          fontSize="4.8"
          fontWeight="900"
          fill="#1e3a8a"
          letterSpacing="0.4"
          fontFamily="sans-serif"
        >
          SMPN 14 TUBABA
        </text>
      </svg>
    </div>
  );
};
