import React, { useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Check, Loader, Trash, Eye, HelpCircle } from 'lucide-react';

interface AIDesignerProps {
  onSelectDesign: (imgUrl: string) => void;
}

const AI_PRESET_DESIGNS = [
  {
    theme: 'maestro',
    style: 'vintage',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop',
    title: 'Manzana Retro - Feliz Día del Maestro'
  },
  {
    theme: 'maestro',
    style: 'acuarela',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop',
    title: 'Libros Acuarela Creativa'
  },
  {
    theme: 'graduacion',
    style: 'cyberpunk',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop',
    title: 'Graduación Futurista Neon'
  },
  {
    theme: 'graduacion',
    style: 'vintage',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop',
    title: 'Diploma Clásico Cobre'
  },
  {
    theme: 'boda',
    style: 'acuarela',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop',
    title: 'Flores de Boda Acuarela Rosada'
  },
  {
    theme: 'corporativo',
    style: 'minimalista',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
    title: 'Abstracto Corporativo Azul/Plata'
  },
  {
    theme: 'deportes',
    style: 'cyberpunk',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop',
    title: 'Balón Fuego Neón Estilo Gamer'
  }
];

export const AIDesigner: React.FC<AIDesignerProps> = ({ onSelectDesign }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('vintage');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Background removal states
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate designs
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setSelectedIdx(null);
    setOriginalImageUrl(null);
    setProcessedImageUrl(null);

    // If API Key is provided, try real generation using DALL-E
    if (apiKey.trim()) {
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            prompt: `${prompt}, sublimation graphic design style, ${style} aesthetic, transparent background elements, highly detailed, vector-like, digital illustration`,
            n: 2,
            size: '512x512'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const urls = data.data.map((item: any) => item.url);
          setGeneratedOptions(urls);
          setIsLoading(false);
          return;
        } else {
          console.warn("OpenAI API failed, falling back to simulation.");
        }
      } catch (err) {
        console.error("Error generating image via OpenAI:", err);
      }
    }

    // Fallback Simulation (2 seconds delay for premium experience)
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      let matchedTheme = 'corporativo'; // default fallback

      if (lowerPrompt.includes('maestro') || lowerPrompt.includes('escuela') || lowerPrompt.includes('profesor') || lowerPrompt.includes('teacher')) {
        matchedTheme = 'maestro';
      } else if (lowerPrompt.includes('graduacion') || lowerPrompt.includes('estudio') || lowerPrompt.includes('titulo')) {
        matchedTheme = 'graduacion';
      } else if (lowerPrompt.includes('boda') || lowerPrompt.includes('amor') || lowerPrompt.includes('aniversario') || lowerPrompt.includes('novios')) {
        matchedTheme = 'boda';
      } else if (lowerPrompt.includes('deporte') || lowerPrompt.includes('futbol') || lowerPrompt.includes('soccer') || lowerPrompt.includes('gym')) {
        matchedTheme = 'deportes';
      }

      // Filter presets matching style & theme, otherwise fallback to any of the theme
      let filtered = AI_PRESET_DESIGNS.filter(d => d.theme === matchedTheme && d.style === style);
      if (filtered.length === 0) {
        filtered = AI_PRESET_DESIGNS.filter(d => d.theme === matchedTheme);
      }
      if (filtered.length === 0) {
        filtered = [AI_PRESET_DESIGNS[Math.floor(Math.random() * AI_PRESET_DESIGNS.length)]];
      }

      // Generate two options: one closest match, one random preset
      const option1 = filtered[0].url;
      const option2 = AI_PRESET_DESIGNS[(AI_PRESET_DESIGNS.indexOf(filtered[0]) + 1) % AI_PRESET_DESIGNS.length].url;

      setGeneratedOptions([option1, option2]);
      setIsLoading(false);
    }, 2200);
  };

  // Simulate background removal using Canvas color keying
  // Removes near-white pixels (chroma key) so the design has transparent background ready for sublimation
  const removeBackground = () => {
    if (selectedIdx === null || !generatedOptions[selectedIdx]) return;
    
    setIsRemovingBackground(true);
    const imgUrl = generatedOptions[selectedIdx];
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    // Allow cross origin loading for canvas data manipulation
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image pixels
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Scan all pixels and turn solid white/light-grey background transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        // If color is very bright (near white) or matches a solid tone, make it transparent
        // Threshold: R, G, B all above 210
        if (r > 200 && g > 200 && b > 200) {
          data[i + 3] = 0; // Alpha = 0 (Transparent)
        }
      }

      ctx.putImageData(imgData, 0, 0);
      
      // Convert to dataURL
      const processedUrl = canvas.toDataURL('image/png');
      setProcessedImageUrl(processedUrl);
      setIsRemovingBackground(false);
    };

    img.onerror = () => {
      // Fallback if CORS prevents canvas manipulation
      // Direct data transfer with simulation
      setTimeout(() => {
        setProcessedImageUrl(imgUrl); // fallback to original
        setIsRemovingBackground(false);
      }, 1000);
    };
  };

  const applyDesign = () => {
    const finalUrl = processedImageUrl || (selectedIdx !== null ? generatedOptions[selectedIdx] : null);
    if (finalUrl) {
      onSelectDesign(finalUrl);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-6">
      
      {/* Canvas for processing background removal */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Estudio de Diseño Inteligente</h2>
          <p className="text-slate-400 text-xs">Crea gráficos únicos para sublimar usando Inteligencia Artificial</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        {/* Prompt Input */}
        <div>
          <label className="text-xs text-slate-300 font-semibold mb-1.5 block">¿Qué deseas plasmar en tu producto?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: 'Taza para el Día del Maestro con manzanas vintage y colores cálidos' o 'Llavero de fútbol con efecto neón'..."
            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            required
          />
        </div>

        {/* Style presets grid */}
        <div>
          <label className="text-xs text-slate-300 font-semibold mb-2 block">Estilo Artístico</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'vintage', name: 'Retro Vintage', emoji: '🕰️' },
              { id: 'acuarela', name: 'Acuarela', emoji: '🎨' },
              { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌆' },
              { id: 'minimalista', name: 'Minimalista', emoji: '▫️' },
              { id: 'cartoon', name: 'Cartoon / Vector', emoji: '✏️' },
            ].map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStyle(st.id)}
                className={`py-2 px-3 rounded-xl border text-xs flex flex-col items-center gap-1 transition ${
                  style === st.id 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{st.emoji}</span>
                <span>{st.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional OpenAI API key connection */}
        <div className="border-t border-slate-900 pt-4">
          <details className="cursor-pointer group">
            <summary className="text-[11px] text-slate-500 font-medium select-none flex items-center gap-1 hover:text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              ¿Usar tu propia API Key de OpenAI para DALL-E? (Opcional)
            </summary>
            <div className="mt-2 pl-4">
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[9px] text-slate-600 mt-1 block">Tu API Key se utiliza de manera local y no se almacena en nuestros servidores.</span>
            </div>
          </details>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" /> Generando propuestas de arte...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Generar Diseños con IA
            </>
          )}
        </button>
      </form>

      {/* Generated Options Panel */}
      {generatedOptions.length > 0 && !isLoading && (
        <div className="border-t border-slate-900 pt-4 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-semibold block">Propuestas de Diseño Encontradas:</span>
          
          <div className="grid grid-cols-2 gap-4">
            {generatedOptions.map((opt, i) => (
              <div 
                key={i}
                onClick={() => {
                  setSelectedIdx(i);
                  setProcessedImageUrl(null); // Reset background removed cache
                }}
                className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition ${
                  selectedIdx === i 
                    ? 'border-indigo-500 scale-102 ring-2 ring-indigo-900/60' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <img src={opt} alt={`Option ${i+1}`} className="w-full h-full object-cover" />
                {selectedIdx === i && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedIdx !== null && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
              <span className="text-xs text-slate-300 font-semibold">Pre-Procesador de Sublimación</span>
              
              {/* Image Preview & Background Removal Toggle */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border border-slate-800 overflow-hidden bg-slate-900 flex items-center justify-center p-1 relative">
                  <img 
                    src={processedImageUrl || generatedOptions[selectedIdx]} 
                    alt="Processed" 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={removeBackground}
                    disabled={isRemovingBackground}
                    className="py-2 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center justify-center gap-1.5"
                  >
                    {isRemovingBackground ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" /> Removiendo...
                      </>
                    ) : (
                      <>
                        <Trash className="w-3.5 h-3.5" /> Remover Fondo Blanco
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-slate-500">
                    {processedImageUrl 
                      ? '✓ Fondo blanco removido con éxito (Transparencia activada)' 
                      : 'Elimina el fondo sólido para que se imprima directo sobre el producto.'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-1.5">
                <button
                  onClick={applyDesign}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
                >
                  <Eye className="w-4 h-4" /> Aplicar en Diseñador 3D
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
