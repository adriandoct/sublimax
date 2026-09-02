import React from 'react';

export interface ProductPreviewProps {
  imageDataUrl: string | null;
  title: string;
  tipo3D?: 'playera' | 'vaso' | 'termo' | 'gorra' | 'taza';
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  imageDataUrl,
  title,
  tipo3D = 'playera',
}) => (
  <div className="relative flex items-center justify-center select-none w-full">
    {tipo3D === 'playera' && (
      <svg viewBox="0 0 200 220" className="w-full max-w-[260px] drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <path d="M60 30 L20 70 L45 80 L40 200 L160 200 L155 80 L180 70 L140 30 Q120 45 100 45 Q80 45 60 30Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        {/* Sleeves */}
        <path d="M60 30 Q50 35 40 50 L20 70 L45 80 Q50 60 55 45Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <path d="M140 30 Q150 35 160 50 L180 70 L155 80 Q150 60 145 45Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        {/* Collar */}
        <path d="M80 30 Q100 55 120 30" fill="none" stroke="#475569" strokeWidth="2" />

        {/* Print area */}
        {imageDataUrl ? (
          <image href={imageDataUrl} x="65" y="70" width="70" height="80" clipPath="url(#chest-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <g>
            <rect x="65" y="70" width="70" height="80" rx="4" fill="#0f172a" stroke="#334155" strokeDasharray="4 3" />
            <text x="100" y="110" textAnchor="middle" fontSize="7" fill="#475569" fontFamily="sans-serif">Vista previa</text>
            <text x="100" y="120" textAnchor="middle" fontSize="7" fill="#475569" fontFamily="sans-serif">Playera / Camisa</text>
          </g>
        )}
        <clipPath id="chest-clip">
          <rect x="65" y="70" width="70" height="80" rx="4" />
        </clipPath>
        <text x="100" y="194" textAnchor="middle" fontSize="5.5" fill="#334155" fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
      </svg>
    )}

    {tipo3D === 'vaso' && (
      <svg viewBox="0 0 200 220" className="w-full max-w-[260px] drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        {/* Glass Straw */}
        <line x1="108" y1="12" x2="102" y2="40" stroke="#cbd5e1" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
        {/* Bamboo Lid */}
        <rect x="65" y="32" width="70" height="14" rx="4" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
        <line x1="68" y1="39" x2="132" y2="39" stroke="#b45309" strokeWidth="1" strokeDasharray="6 3" />
        {/* Glass Can Body */}
        <rect x="67" y="46" width="66" height="145" rx="14" fill="#0f172a" fillOpacity="0.75" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M72 52 L72 184" stroke="#e0f2fe" strokeWidth="2.5" opacity="0.25" strokeLinecap="round" />

        {/* Print Area */}
        {imageDataUrl ? (
          <image href={imageDataUrl} x="70" y="60" width="60" height="115" clipPath="url(#vaso-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <g>
            <rect x="70" y="60" width="60" height="115" rx="6" fill="#0284c7" fillOpacity="0.1" stroke="#0284c7" strokeDasharray="4 3" />
            <text x="100" y="115" textAnchor="middle" fontSize="7" fill="#38bdf8" fontFamily="sans-serif">Vista previa</text>
            <text x="100" y="125" textAnchor="middle" fontSize="7" fill="#38bdf8" fontFamily="sans-serif">Vaso de Vidrio</text>
          </g>
        )}
        <clipPath id="vaso-clip">
          <rect x="70" y="60" width="60" height="115" rx="6" />
        </clipPath>
        <text x="100" y="185" textAnchor="middle" fontSize="5.5" fill="#38bdf8" opacity="0.6" fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
      </svg>
    )}

    {tipo3D === 'termo' && (
      <svg viewBox="0 0 200 220" className="w-full max-w-[260px] drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        {/* Metallic Cap */}
        <path d="M92 20 C92 10 108 10 108 20 Z" fill="none" stroke="#64748b" strokeWidth="3" />
        <rect x="75" y="24" width="50" height="14" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5" />
        <rect x="80" y="38" width="40" height="10" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        {/* Body */}
        <path d="M72 48 L128 48 L128 190 Q128 198 120 198 L80 198 Q72 198 72 190 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <path d="M78 52 L78 194" stroke="#94a3b8" strokeWidth="3" opacity="0.3" strokeLinecap="round" />

        {/* Print Area */}
        {imageDataUrl ? (
          <image href={imageDataUrl} x="75" y="65" width="50" height="115" clipPath="url(#termo-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <g>
            <rect x="75" y="65" width="50" height="115" rx="4" fill="#0f172a" stroke="#475569" strokeDasharray="4 3" />
            <text x="100" y="118" textAnchor="middle" fontSize="7" fill="#64748b" fontFamily="sans-serif">Vista previa</text>
            <text x="100" y="128" textAnchor="middle" fontSize="7" fill="#64748b" fontFamily="sans-serif">Termo Acero</text>
          </g>
        )}
        <clipPath id="termo-clip">
          <rect x="75" y="65" width="50" height="115" rx="4" />
        </clipPath>
        <text x="100" y="190" textAnchor="middle" fontSize="5.5" fill="#475569" fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
      </svg>
    )}

    {tipo3D === 'gorra' && (
      <svg viewBox="0 0 200 220" className="w-full max-w-[260px] drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="55" r="4" fill="#475569" stroke="#1e293b" strokeWidth="1" />
        <path d="M45 130 C45 75 155 75 155 130 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <path d="M125 90 Q145 105 150 130" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        <path d="M75 90 Q55 105 50 130" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        <path d="M30 130 Q100 160 170 130 L180 142 Q100 175 20 142 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

        {/* Print Area */}
        {imageDataUrl ? (
          <image href={imageDataUrl} x="70" y="80" width="60" height="42" clipPath="url(#gorra-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <g>
            <rect x="70" y="80" width="60" height="42" rx="4" fill="#0f172a" stroke="#475569" strokeDasharray="4 3" />
            <text x="100" y="100" textAnchor="middle" fontSize="6.5" fill="#64748b" fontFamily="sans-serif">Vista previa</text>
            <text x="100" y="108" textAnchor="middle" fontSize="6.5" fill="#64748b" fontFamily="sans-serif">Gorra</text>
          </g>
        )}
        <clipPath id="gorra-clip">
          <rect x="70" y="80" width="60" height="42" rx="4" />
        </clipPath>
        <text x="100" y="185" textAnchor="middle" fontSize="5.5" fill="#475569" fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
      </svg>
    )}

    {tipo3D === 'taza' && (
      <svg viewBox="0 0 200 220" className="w-full max-w-[260px] drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <path d="M140 75 Q180 75 180 120 Q180 165 140 165" fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
        <path d="M140 75 Q180 75 180 120 Q180 165 140 165" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
        <rect x="60" y="55" width="80" height="115" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <ellipse cx="100" cy="55" rx="40" ry="8" fill="#334155" stroke="#475569" strokeWidth="1" />
        <ellipse cx="100" cy="55" rx="36" ry="6" fill="#0f172a" />
        <path d="M66 68 L66 162" stroke="#64748b" strokeWidth="3" opacity="0.3" strokeLinecap="round" />

        {/* Print Area */}
        {imageDataUrl ? (
          <image href={imageDataUrl} x="68" y="70" width="64" height="85" clipPath="url(#taza-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <g>
            <rect x="68" y="70" width="64" height="85" rx="4" fill="#0f172a" stroke="#475569" strokeDasharray="4 3" />
            <text x="100" y="108" textAnchor="middle" fontSize="7" fill="#64748b" fontFamily="sans-serif">Vista previa</text>
            <text x="100" y="118" textAnchor="middle" fontSize="7" fill="#64748b" fontFamily="sans-serif">Taza Cerámica</text>
          </g>
        )}
        <clipPath id="taza-clip">
          <rect x="68" y="70" width="64" height="85" rx="4" />
        </clipPath>
        <text x="100" y="185" textAnchor="middle" fontSize="5.5" fill="#475569" fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
      </svg>
    )}

    {/* Floating label */}
    {title && (
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 whitespace-nowrap">
        {title}
      </span>
    )}
  </div>
);
