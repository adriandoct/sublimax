import React, { useState, useEffect } from 'react';
import { Database, Diseño, Usuario } from '../services/database';
import { Sparkles, Upload, Check, Loader, DollarSign, ListFilter, Award, Percent } from 'lucide-react';

interface DesignerMarketplaceProps {
  currentUser: Usuario | null;
  onRefreshUser: () => void;
}

export const DesignerMarketplace: React.FC<DesignerMarketplaceProps> = ({ currentUser, onRefreshUser }) => {
  const [designs, setDesigns] = useState<Diseño[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=300&auto=format&fit=crop');
  const [successMsg, setSuccessMsg] = useState('');

  const loadDesigns = () => {
    if (!currentUser) return;
    const allDesigns = Database.getDesigns();
    // Filter designer's own uploaded designs
    setDesigns(allDesigns.filter(d => d.usuario_id === currentUser.id));
  };

  useEffect(() => {
    loadDesigns();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center max-w-md mx-auto my-12 border-slate-800">
        <Award className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white mb-2">Comunidad de Diseñadores</h2>
        <p className="text-slate-400 text-sm mb-6">
          Sube tus diseños a SUBLIMAX Studio y gana comisiones del 15% por cada producto vendido con tu arte.
        </p>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs text-slate-500">
          Por favor inicia sesión con tu cuenta para acceder al Marketplace.
        </div>
      </div>
    );
  }

  // Toggle user role to designer if they are a regular user
  const handleJoinProgram = () => {
    const users = Database.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx > -1) {
      users[idx].role = 'designer';
      users[idx].comision_acumulada = 0;
      localStorage.setItem('sublimax_usuarios', JSON.stringify(users));
      localStorage.setItem('sublimax_active_user', JSON.stringify(users[idx]));
      onRefreshUser();
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);

    setTimeout(() => {
      Database.uploadDesign({
        usuario_id: currentUser.id,
        nombre_diseñador: currentUser.nombre,
        titulo: title,
        imagen_url: imageUrl,
        precio: Number(price)
      });

      setTitle('');
      setPrice(0);
      setIsUploading(false);
      setSuccessMsg('¡Diseño enviado con éxito! Pendiente de aprobación por el Administrador.');
      loadDesigns();

      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1500);
  };

  // Calculate designer stats
  const totalSalesCount = designs.reduce((sum, d) => sum + d.ventas, 0);
  const totalCommissionsEarned = designs.reduce((sum, d) => {
    // 15% commission base on product print + item design licensing fee
    return sum + (d.ventas * (d.precio + 20));
  }, 0);

  return (
    <div className="flex flex-col gap-8">
      {currentUser.role !== 'designer' && currentUser.role !== 'admin' ? (
        // Non-designer onboarding view
        <div className="glass-panel rounded-3xl p-8 max-w-2xl mx-auto border-indigo-500/20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-950/50">
            <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Únete como Diseñador a SUBLIMAX Studio</h1>
          <p className="text-slate-300 max-w-md text-sm mb-6 leading-relaxed">
            Monetiza tu creatividad. Sube tus ilustraciones vectoriales, logotipos, frases o plantillas creativas y recibe ingresos automáticos cada vez que un cliente elija tu arte.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8 text-left">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900">
              <span className="text-xs text-indigo-400 font-bold block mb-1">Paso 1</span>
              <span className="text-xs text-white font-semibold block mb-1">Sube tus archivos</span>
              <span className="text-[10px] text-slate-500">Formatos PNG transparentes o SVG de alta resolución.</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900">
              <span className="text-xs text-pink-400 font-bold block mb-1">Paso 2</span>
              <span className="text-xs text-white font-semibold block mb-1">Fija tus regalías</span>
              <span className="text-[10px] text-slate-500">Tú decides el costo de licencia de tus diseños especiales.</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900">
              <span className="text-xs text-emerald-400 font-bold block mb-1">Paso 3</span>
              <span className="text-xs text-white font-semibold block mb-1">Gana Comisiones</span>
              <span className="text-[10px] text-slate-500">15% de comisión garantizada sobre el costo base + regalías.</span>
            </div>
          </div>

          <button
            onClick={handleJoinProgram}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition shadow-lg shadow-indigo-950/40"
          >
            Activar Cuenta de Diseñador Gratuita
          </button>
        </div>
      ) : (
        // Designer Dashboard View
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: stats & upload form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Stats */}
            <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tus Estadísticas de Creador</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900">
                  <span className="text-slate-500 text-[10px] block">Diseños Utilizados</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">{totalSalesCount} Veces</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900">
                  <span className="text-slate-500 text-[10px] block">Comisiones Ganadas</span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">${totalCommissionsEarned.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Design Uploader Form */}
            <div className="glass-panel rounded-3xl p-6 border-slate-800">
              <h2 className="text-base font-bold text-white mb-4">Subir Nueva Plantilla</h2>

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-900 text-emerald-400 rounded-xl text-xs">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Título del Diseño</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Girasoles Acuarela"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Precio Licencia Regalia ($ MXN)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">Establece $0 para que sea de uso libre en la plataforma.</span>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Imagen URL / Archivo Mock</label>
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !title.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" /> Subiendo archivo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Enviar Diseño a Revisión
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Right panel: designs list */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-4">
            <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3">Tu Portafolio de Diseñador</h2>
            
            {designs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {designs.map(des => (
                  <div key={des.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                      <img src={des.imagen_url} alt={des.titulo} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-white block truncate">{des.titulo}</span>
                      <span className="text-[10px] text-slate-500 block">Vendido: {des.ventas} veces</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[9px] font-semibold ${
                          des.aprobado ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {des.aprobado ? '✓ Activo' : '⏰ Pendiente'}
                        </span>
                        <span className="text-xs font-bold text-slate-300">${des.precio} MXN</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                No has subido ningún diseño todavía. Envía tu primera propuesta en el panel izquierdo.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
