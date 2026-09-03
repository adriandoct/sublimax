import React, { useState } from 'react';
import { Palette, Check, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export interface ProductPreviewProps {
  imageDataUrl: string | null;
  title: string;
  tipo3D?: 'playera' | 'vaso' | 'termo' | 'gorra' | 'taza';
  productColor?: string;
  onColorChange?: (color: string) => void;
  showColorPalette?: boolean;
  imageScale?: number;
  onImageScaleChange?: (scale: number) => void;
  showScaleControl?: boolean;
}

export const PRESET_COLORS = [
  { name: 'Negro Carbón', hex: '#1e293b' },
  { name: 'Blanco Puro', hex: '#ffffff' },
  { name: 'Azul Rey', hex: '#1e3a8a' },
  { name: 'Rojo Pasión', hex: '#b91c1c' },
  { name: 'Verde Esmeralda', hex: '#047857' },
  { name: 'Rosa Magenta', hex: '#be185d' },
  { name: 'Amarillo Miel', hex: '#d97706' },
  { name: 'Violeta Neón', hex: '#6b21a8' },
  { name: 'Gris Titanio', hex: '#475569' },
];

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  imageDataUrl,
  title,
  tipo3D = 'playera',
  productColor: externalColor,
  onColorChange,
  showColorPalette = true,
  imageScale: externalScale,
  onImageScaleChange,
  showScaleControl = true,
}) => {
  const [internalColor, setInternalColor] = useState('#ffffff');
  const [internalScale, setInternalScale] = useState(1.0);

  const currentColor = externalColor !== undefined ? externalColor : internalColor;
  const currentScale = externalScale !== undefined ? externalScale : internalScale;

  const handleSelectColor = (hex: string) => {
    setInternalColor(hex);
    if (onColorChange) {
      onColorChange(hex);
    }
  };

  const handleScaleChange = (scale: number) => {
    const clamped = Math.min(2.5, Math.max(0.5, parseFloat(scale.toFixed(2))));
    setInternalScale(clamped);
    if (onImageScaleChange) {
      onImageScaleChange(clamped);
    }
  };

  // Determine light vs dark color for contrast calculations
  const isLightColor = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return false;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 165;
  };

  const isLight = isLightColor(currentColor);
  const strokeColor = isLight ? '#64748b' : '#334155';
  const rimColor = isLight ? '#cbd5e1' : '#475569';
  const highlightOpacity = isLight ? 0.6 : 0.25;
  const innerMugColor = isLight ? '#334155' : '#0f172a';
  const brandingTextColor = isLight ? '#475569' : '#94a3b8';

  // Helper to compute scaled image dimensions and centered positions
  const getScaledImg = (baseW: number, baseH: number, centerX: number, centerY: number) => {
    const w = baseW * currentScale;
    const h = baseH * currentScale;
    const x = centerX - w / 2;
    const y = centerY - h / 2;
    return { x, y, w, h };
  };

  const playeraImg = getScaledImg(70, 80, 100, 110);
  const vasoImg = getScaledImg(60, 115, 100, 117.5);
  const termoImg = getScaledImg(50, 115, 100, 122.5);
  const gorraImg = getScaledImg(60, 42, 100, 101);
  const tazaImg = getScaledImg(64, 85, 100, 112.5);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 2D SVG Realistic Product Mockup */}
      <div className="relative flex items-center justify-center select-none w-full">
        {tipo3D === 'playera' && (
          <svg viewBox="0 0 200 220" className="w-full max-w-[260px] filter drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shirt-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
                <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Body */}
            <path d="M60 30 L20 70 L45 80 L40 200 L160 200 L155 80 L180 70 L140 30 Q120 45 100 45 Q80 45 60 30Z" fill={currentColor} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M60 30 L20 70 L45 80 L40 200 L160 200 L155 80 L180 70 L140 30 Q120 45 100 45 Q80 45 60 30Z" fill="url(#shirt-shadow)" />

            {/* Sleeves */}
            <path d="M60 30 Q50 35 40 50 L20 70 L45 80 Q50 60 55 45Z" fill={currentColor} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M140 30 Q150 35 160 50 L180 70 L155 80 Q150 60 145 45Z" fill={currentColor} stroke={strokeColor} strokeWidth="1.5" />

            {/* Collar seam */}
            <path d="M80 30 Q100 55 120 30" fill="none" stroke={strokeColor} strokeWidth="2.5" />

            {/* Print area */}
            {imageDataUrl ? (
              <image href={imageDataUrl} x={playeraImg.x} y={playeraImg.y} width={playeraImg.w} height={playeraImg.h} clipPath="url(#chest-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
            ) : (
              <g>
                <rect x="65" y="70" width="70" height="80" rx="4" fill={isLight ? '#f1f5f9' : '#0f172a'} stroke={strokeColor} strokeDasharray="4 3" />
                <text x="100" y="110" textAnchor="middle" fontSize="7" fill={brandingTextColor} fontFamily="sans-serif">Vista previa</text>
                <text x="100" y="120" textAnchor="middle" fontSize="7" fill={brandingTextColor} fontFamily="sans-serif">Playera / Camisa</text>
              </g>
            )}
            <clipPath id="chest-clip">
              <path d="M60 30 L20 70 L45 80 L40 200 L160 200 L155 80 L180 70 L140 30 Q120 45 100 45 Q80 45 60 30Z" />
            </clipPath>
            <text x="100" y="194" textAnchor="middle" fontSize="5.5" fill={brandingTextColor} fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
          </svg>
        )}

        {tipo3D === 'vaso' && (
          <svg viewBox="0 0 200 220" className="w-full max-w-[260px] filter drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Glass Body Light & Reflection Gradients */}
              <linearGradient id="glass-body-tint" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="12%" stopColor="#bae6fd" stopOpacity="0.2" />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="65%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="88%" stopColor="#bae6fd" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
              </linearGradient>

              <linearGradient id="glass-glare-vertical" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="bamboo-wood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="50%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>

              <linearGradient id="glass-straw-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Glass Straw */}
            <path d="M107 10 L107 24 Q107 34 102 44" fill="none" stroke="url(#glass-straw-grad)" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
            <path d="M108 10 L108 24 Q108 34 103 44" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

            {/* Bamboo Lid */}
            <g id="bamboo-lid-group">
              <rect x="67" y="44" width="66" height="5" rx="2" fill="#94a3b8" opacity="0.6" />
              <rect x="64" y="30" width="72" height="15" rx="4" fill="url(#bamboo-wood)" stroke="#713f12" strokeWidth="1.2" />
              <line x1="66" y1="35" x2="134" y2="35" stroke="#fef08a" strokeWidth="1" opacity="0.4" strokeDasharray="8 4 12 3" />
              <line x1="66" y1="40" x2="134" y2="40" stroke="#713f12" strokeWidth="0.8" opacity="0.5" strokeDasharray="14 3 6 4" />
              <ellipse cx="106" cy="30" rx="6" ry="2.5" fill="#713f12" opacity="0.7" />
              <ellipse cx="106" cy="30" rx="4.5" ry="1.8" fill="#422006" />
            </g>

            {/* Glass Can Body - Transparent Crystal Glass */}
            <rect x="67" y="46" width="66" height="145" rx="14" fill="url(#glass-body-tint)" stroke="#cbd5e1" strokeWidth="1.8" />

            {/* Thick Glass Bottom Base */}
            <path d="M67 176 Q67 191 81 191 L119 191 Q133 191 133 176 Z" fill="#e0f2fe" fillOpacity="0.25" stroke="#94a3b8" strokeWidth="1.2" />
            <ellipse cx="100" cy="186" rx="28" ry="4" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />

            {/* Glass Refraction Glare Highlights */}
            <path d="M71 52 L71 180" stroke="url(#glass-glare-vertical)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            <path d="M75 54 L75 178" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            <path d="M129 52 L129 180" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

            {/* Sublimation Print Layer inside Glass */}
            {imageDataUrl ? (
              <g>
                <image href={imageDataUrl} x={vasoImg.x} y={vasoImg.y} width={vasoImg.w} height={vasoImg.h} clipPath="url(#vaso-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" opacity="0.92" />
                <rect x="67" y="46" width="66" height="145" rx="14" fill="url(#glass-body-tint)" pointerEvents="none" opacity="0.5" />
              </g>
            ) : (
              <g>
                <rect x="70" y="60" width="60" height="115" rx="6" fill="#f0f9ff" fillOpacity="0.3" stroke="#38bdf8" strokeDasharray="4 3" />
                <text x="100" y="113" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0284c7" fontFamily="sans-serif">Vista Previa</text>
                <text x="100" y="124" textAnchor="middle" fontSize="6.5" fill="#0369a1" fontFamily="sans-serif">Vaso Cristal Transparente</text>
              </g>
            )}

            <clipPath id="vaso-clip">
              <rect x="67" y="46" width="66" height="145" rx="14" />
            </clipPath>

            <text x="100" y="186" textAnchor="middle" fontSize="5.5" fill="#475569" opacity="0.85" fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
          </svg>
        )}

        {tipo3D === 'termo' && (
          <svg viewBox="0 0 200 220" className="w-full max-w-[260px] filter drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="termo-glare" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="15%" stopColor="#ffffff" stopOpacity={highlightOpacity} />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="85%" stopColor="#000000" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Metallic Cap */}
            <path d="M92 20 C92 10 108 10 108 20 Z" fill="none" stroke="#64748b" strokeWidth="3" />
            <rect x="75" y="24" width="50" height="14" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            <rect x="80" y="38" width="40" height="10" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            
            {/* Body */}
            <path d="M72 48 L128 48 L128 190 Q128 198 120 198 L80 198 Q72 198 72 190 Z" fill={currentColor} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M72 48 L128 48 L128 190 Q128 198 120 198 L80 198 Q72 198 72 190 Z" fill="url(#termo-glare)" />
            <path d="M78 52 L78 194" stroke="#ffffff" strokeWidth="3" opacity={highlightOpacity} strokeLinecap="round" />

            {/* Print Area */}
            {imageDataUrl ? (
              <image href={imageDataUrl} x={termoImg.x} y={termoImg.y} width={termoImg.w} height={termoImg.h} clipPath="url(#termo-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
            ) : (
              <g>
                <rect x="75" y="65" width="50" height="115" rx="4" fill={isLight ? '#f1f5f9' : '#0f172a'} stroke={strokeColor} strokeDasharray="4 3" />
                <text x="100" y="118" textAnchor="middle" fontSize="7" fill={brandingTextColor} fontFamily="sans-serif">Vista previa</text>
                <text x="100" y="128" textAnchor="middle" fontSize="7" fill={brandingTextColor} fontFamily="sans-serif">Termo Acero</text>
              </g>
            )}
            <clipPath id="termo-clip">
              <path d="M72 48 L128 48 L128 190 Q128 198 120 198 L80 198 Q72 198 72 190 Z" />
            </clipPath>
            <text x="100" y="190" textAnchor="middle" fontSize="5.5" fill={brandingTextColor} fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
          </svg>
        )}

        {tipo3D === 'gorra' && (
          <svg viewBox="0 0 200 220" className="w-full max-w-[260px] filter drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="55" r="4" fill="#475569" stroke="#1e293b" strokeWidth="1" />
            {/* Crown */}
            <path d="M45 130 C45 75 155 75 155 130 Z" fill={currentColor} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M125 90 Q145 105 150 130" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" fill="none" />
            <path d="M75 90 Q55 105 50 130" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" fill="none" />
            {/* Visor / Brim */}
            <path d="M30 130 Q100 160 170 130 L180 142 Q100 175 20 142 Z" fill={currentColor} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M30 130 Q100 160 170 130 L180 142 Q100 175 20 142 Z" fill="#000000" fillOpacity="0.15" />

            {/* Print Area */}
            {imageDataUrl ? (
              <image href={imageDataUrl} x={gorraImg.x} y={gorraImg.y} width={gorraImg.w} height={gorraImg.h} clipPath="url(#gorra-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
            ) : (
              <g>
                <rect x="70" y="80" width="60" height="42" rx="4" fill={isLight ? '#f1f5f9' : '#0f172a'} stroke={strokeColor} strokeDasharray="4 3" />
                <text x="100" y="100" textAnchor="middle" fontSize="6.5" fill={brandingTextColor} fontFamily="sans-serif">Vista previa</text>
                <text x="100" y="108" textAnchor="middle" fontSize="6.5" fill={brandingTextColor} fontFamily="sans-serif">Gorra</text>
              </g>
            )}
            <clipPath id="gorra-clip">
              <path d="M45 130 C45 75 155 75 155 130 Z" />
            </clipPath>
            <text x="100" y="185" textAnchor="middle" fontSize="5.5" fill={brandingTextColor} fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
          </svg>
        )}

        {tipo3D === 'taza' && (
          <svg viewBox="0 0 200 220" className="w-full max-w-[260px] filter drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mug-specular" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={highlightOpacity} />
                <stop offset="20%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="80%" stopColor="#000000" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Handle */}
            <path d="M140 75 Q180 75 180 120 Q180 165 140 165" fill="none" stroke={strokeColor} strokeWidth="16" strokeLinecap="round" />
            <path d="M140 75 Q180 75 180 120 Q180 165 140 165" fill="none" stroke={currentColor} strokeWidth="10" strokeLinecap="round" />

            {/* Mug Body */}
            <rect x="60" y="55" width="80" height="115" rx="8" fill={currentColor} stroke={strokeColor} strokeWidth="1.5" />
            <rect x="60" y="55" width="80" height="115" rx="8" fill="url(#mug-specular)" />

            {/* Top Outer Rim */}
            <ellipse cx="100" cy="55" rx="40" ry="8" fill={rimColor} stroke={strokeColor} strokeWidth="1" />
            {/* Top Inner Hole */}
            <ellipse cx="100" cy="55" rx="36" ry="6" fill={innerMugColor} />

            {/* Gloss reflection line */}
            <path d="M66 68 L66 162" stroke="#ffffff" strokeWidth="3" opacity={highlightOpacity} strokeLinecap="round" />

            {/* Print Area */}
            {imageDataUrl ? (
              <image href={imageDataUrl} x={tazaImg.x} y={tazaImg.y} width={tazaImg.w} height={tazaImg.h} clipPath="url(#taza-clip)" style={{ objectFit: 'contain' }} preserveAspectRatio="xMidYMid meet" />
            ) : (
              <g>
                <rect x="68" y="70" width="64" height="85" rx="4" fill={isLight ? '#f1f5f9' : '#0f172a'} stroke={strokeColor} strokeDasharray="4 3" />
                <text x="100" y="108" textAnchor="middle" fontSize="7" fill={brandingTextColor} fontFamily="sans-serif">Vista previa</text>
                <text x="100" y="118" textAnchor="middle" fontSize="7" fill={brandingTextColor} fontFamily="sans-serif">Taza Cerámica</text>
              </g>
            )}
            <clipPath id="taza-clip">
              <rect x="60" y="55" width="80" height="115" rx="8" />
            </clipPath>
            <text x="100" y="185" textAnchor="middle" fontSize="5.5" fill={brandingTextColor} fontFamily="sans-serif" fontWeight="bold">SUBLIMAX STUDIO</text>
          </svg>
        )}

        {/* Floating title label */}
        {title && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 whitespace-nowrap shadow-md">
            {title}
          </span>
        )}
      </div>

      {/* Interactive Image Scale / Zoom Controls */}
      {showScaleControl && imageDataUrl && (
        <div className="w-full bg-slate-950/70 backdrop-blur-md rounded-2xl p-3 border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Maximize2 className="w-3.5 h-3.5" />
              Tamaño del Diseño (Zoom)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800/60 font-bold">
                {Math.round(currentScale * 100)}%
              </span>
              <button
                type="button"
                title="Restablecer tamaño (100%)"
                onClick={() => handleScaleChange(1.0)}
                className="p-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <button
              type="button"
              title="Alejar (-10%)"
              onClick={() => handleScaleChange(currentScale - 0.1)}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={currentScale}
              onChange={e => handleScaleChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            />
            <button
              type="button"
              title="Agrandar (+10%)"
              onClick={() => handleScaleChange(currentScale + 0.1)}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Color Palette Selector */}
      {showColorPalette && (
        <div className="w-full bg-slate-950/70 backdrop-blur-md rounded-2xl p-3.5 border border-slate-800/80 flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-between w-full text-xs font-bold text-slate-300 px-1">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Palette className="w-4 h-4 text-indigo-400" />
              Color del Producto
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 uppercase">
              {PRESET_COLORS.find(c => c.hex.toLowerCase() === currentColor.toLowerCase())?.name || currentColor}
            </span>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-2 w-full">
            {PRESET_COLORS.map(c => {
              const isSelected = currentColor.toLowerCase() === c.hex.toLowerCase();
              const isWhite = c.hex === '#ffffff';
              return (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => handleSelectColor(c.hex)}
                  className={`relative w-7 h-7 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center border ${
                    isWhite ? 'border-slate-400' : 'border-slate-700/80'
                  } ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg shadow-indigo-500/30'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${isWhite ? 'text-slate-900' : 'text-white'} font-bold filter drop-shadow`} />
                  )}
                </button>
              );
            })}

            {/* Custom Color Input */}
            <div className="relative group">
              <label
                title="Seleccionar color personalizado"
                className={`relative w-7 h-7 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center border border-slate-600 bg-gradient-to-tr from-pink-500 via-indigo-500 to-cyan-400 ${
                  !PRESET_COLORS.some(c => c.hex.toLowerCase() === currentColor.toLowerCase())
                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg shadow-indigo-500/30'
                    : 'hover:scale-105'
                }`}
              >
                <input
                  type="color"
                  value={currentColor}
                  onChange={e => handleSelectColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <Palette className="w-3.5 h-3.5 text-white filter drop-shadow pointer-events-none" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
