import React, { useState, useEffect, useRef } from 'react';
import { Database, Diseño, Usuario, CartItem } from '../services/database';
import { ProductPreview } from './ProductPreview';
import {
  Sparkles, Upload, Check, Loader, Award, X,
  Eye, Palette, ImagePlus, UserPlus, LogIn, ShieldCheck,
  TrendingUp, DollarSign, Package, ClipboardList, CheckCircle2,
  XCircle, Clock, Users, AlertCircle, Bell, Pencil, Trash2, ShoppingCart
} from 'lucide-react';

interface DesignerMarketplaceProps {
  currentUser: Usuario | null;
  onRefreshUser: () => void;
  onAddToCart?: (cartItem: CartItem) => void;
}


/* ─────────────────────────────────────────────
   REGISTRATION MODAL
   ───────────────────────────────────────────── */
interface RegisterModalProps {
  onClose: () => void;
  onSuccess: (user: Usuario) => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (!email.includes('@')) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPass) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = Database.register(nombre, email, password, 'designer');
      if (typeof result === 'string') {
        setError(result);
        setLoading(false);
      } else {
        setLoading(false);
        setStep('success');
        setTimeout(() => onSuccess(result), 1800);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 border border-indigo-500/30 shadow-2xl shadow-indigo-950/60 animate-fade-in">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'success' ? (
          /* ── Success screen ── */
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center border border-emerald-500/30">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white">¡Cuenta Creada!</h2>
            <p className="text-slate-400 text-sm">
              Tu cuenta de diseñador ha sido registrada exitosamente. Ahora puedes subir tus diseños.
            </p>
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs">
              <Loader className="w-3.5 h-3.5 animate-spin" /> Redirigiendo al panel...
            </div>
          </div>
        ) : (
          /* ── Registration form ── */
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Regístrate como Diseñador</h2>
                <p className="text-xs text-slate-400">Gana comisiones del 15% por cada venta</p>
              </div>
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-4 py-3 rounded-2xl mb-5">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-indigo-300 font-bold block">ROL ASIGNADO</span>
                <span className="text-xs text-white font-semibold">Diseñador Creador — Marketplace SUBLIMAX</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 px-3.5 py-2.5 bg-red-950/60 border border-red-900/50 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <X className="w-3.5 h-3.5 flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nombre Artístico / Nombre Completo
                </label>
                <input
                  id="reg-nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej. Ana García Diseños"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="diseñador@correo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                    Contraseña
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                    Confirmar
                  </label>
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  />
                </div>
              </div>

              <button
                id="reg-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-950/40 mt-1"
              >
                {loading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Creando cuenta...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Crear Cuenta de Diseñador</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Helper: compress base64 image while preserving 100% PNG transparency ── */
const compressImageIfNeeded = (dataUrl: string): Promise<string> => {
  return new Promise(resolve => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 350; // Optimized max dimension (~25KB-40KB)
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, w, h); // Clear canvas transparently
        ctx.drawImage(img, 0, 0, w, h);
        // ALWAYS export as image/png to preserve 100% PNG alpha transparency!
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/* ─────────────────────────────────────────────
   EDIT DESIGN MODAL
   ───────────────────────────────────────────── */
interface EditDesignModalProps {
  design: Diseño;
  onClose: () => void;
  onSave: (updated: { titulo: string; precio: number; tipo_3d: 'playera' | 'vaso' | 'termo' | 'gorra' | 'taza'; imagen_url: string; color_producto?: string }) => void;
}

const EditDesignModal: React.FC<EditDesignModalProps> = ({ design, onClose, onSave }) => {
  const [editTitle, setEditTitle] = useState(design.titulo);
  const [editPrice, setEditPrice] = useState(design.precio);
  const [editTipo3D, setEditTipo3D] = useState<'playera' | 'vaso' | 'termo' | 'gorra' | 'taza'>(design.tipo_3d || 'playera');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editColor, setEditColor] = useState<string>(design.color_producto || '#ffffff');
  const [editImageUrl, setEditImageUrl] = useState<string>(design.imagen_url);
  const [editFileName, setEditFileName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const getBasePrice = (type?: string) => {
    switch (type) {
      case 'vaso': return 190;
      case 'termo': return 220;
      case 'gorra': return 150;
      case 'taza': return 120;
      case 'playera':
      default: return 250;
    }
  };

  const basePrice = getBasePrice(editTipo3D);
  const unitPrice = basePrice + Number(editPrice || 0);
  const totalOrderToPay = unitPrice * editQuantity;

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no debe superar 8 MB.');
      return;
    }
    setEditFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      setEditImageUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    const titleInputEl = document.getElementById('edit-design-title-input') as HTMLInputElement | null;
    const currentTitle = (editTitle || titleInputEl?.value || '').trim();

    if (!currentTitle) {
      alert('Por favor escribe un título para el diseño.');
      return;
    }

    setIsSaving(true);
    try {
      const finalImage = editImageUrl.startsWith('data:image')
        ? await compressImageIfNeeded(editImageUrl)
        : editImageUrl;

      onSave({
        titulo: currentTitle,
        precio: Number(editPrice || 0),
        tipo_3d: editTipo3D,
        imagen_url: finalImage,
        color_producto: editColor,
      });
      setIsSaving(false);
      alert(`¡CAMBIOS GUARDADOS!\n\nEl diseño "${currentTitle}" ha sido actualizado correctamente.`);
    } catch (err: any) {
      console.error(err);
      setIsSaving(false);
      alert('Error al guardar cambios: ' + (err?.message || err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Editar Diseño del Portafolio</h2>
              <p className="text-xs text-slate-500">Modifica los detalles, tipo de producto o cambia la imagen.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                Imagen del Diseño
              </label>
              <div
                onClick={() => editFileInputRef.current?.click()}
                className="relative w-full min-h-[120px] rounded-2xl border-2 border-dashed border-indigo-500/40 bg-indigo-950/20 flex flex-col items-center justify-center cursor-pointer transition gap-2 p-3 hover:border-indigo-400"
              >
                <img src={editImageUrl} alt="Vista previa" className="max-h-24 max-w-full object-contain rounded-xl" />
                <span className="text-[10px] text-indigo-400 underline font-semibold">
                  {editFileName ? editFileName : 'Haz clic para reemplazar la imagen'}
                </span>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditFileChange}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                Producto a Personalizar *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'playera', label: 'Playera', icon: '👕' },
                  { id: 'vaso', label: 'Vaso', icon: '🥤' },
                  { id: 'termo', label: 'Termo', icon: '🧪' },
                  { id: 'gorra', label: 'Gorra', icon: '🧢' },
                  { id: 'taza', label: 'Taza', icon: '☕' },
                ].map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setEditTipo3D(p.id as any)}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      editTipo3D === p.id
                        ? 'bg-indigo-950/80 border-indigo-500 text-white font-bold'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs truncate">{p.icon} {p.label}</span>
                    {editTipo3D === p.id && <Check className="w-3.5 h-3.5 text-indigo-400 font-bold" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                Título del Diseño *
              </label>
              <input
                id="edit-design-title-input"
                type="text"
                required
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                Precio Licencia / Regalía ($ MXN)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={editPrice}
                onChange={e => setEditPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                Cantidad de Productos (Piezas) *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-base flex items-center justify-center transition active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={editQuantity}
                  onChange={e => setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={() => setEditQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-base flex items-center justify-center transition active:scale-95 cursor-pointer"
                >
                  +
                </button>
                <span className="text-xs text-slate-400 font-semibold ml-2">piezas</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving || !editTitle.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/40 cursor-pointer"
              >
                {isSaving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Guardar Cambios
              </button>
            </div>
          </form>

          {/* Live Preview Panel & Total Summary Card */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-850 flex flex-col items-center gap-4">
            <span className="text-xs font-bold text-slate-300">Vista Previa y Resumen de Orden</span>
            <ProductPreview imageDataUrl={editImageUrl} title={editTitle || 'Vista previa'} tipo3D={editTipo3D} productColor={editColor} onColorChange={setEditColor} showColorPalette={true} />

            {/* Total Price Breakdown */}
            <div className="w-full bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2 text-xs shadow-inner">
              <div className="flex justify-between items-center text-slate-400">
                <span>Producto Base ({editTipo3D.toUpperCase()}):</span>
                <span className="font-semibold text-slate-200">${basePrice.toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Licencia / Regalía:</span>
                <span className="font-semibold text-slate-200">${Number(editPrice || 0).toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Cantidad:</span>
                <span className="font-bold text-indigo-400">{editQuantity} pieza(s)</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-slate-800">
                <span className="text-white font-bold">TOTAL A PAGAR:</span>
                <span className="text-emerald-400 text-base font-extrabold">${totalOrderToPay.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export const DesignerMarketplace: React.FC<DesignerMarketplaceProps> = ({
  currentUser,
  onRefreshUser,
  onAddToCart,
}) => {
  const [designs, setDesigns] = useState<Diseño[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tipo3D, setTipo3D] = useState<'playera' | 'vaso' | 'termo' | 'gorra' | 'taza'>('playera');
  const [productColor, setProductColor] = useState<string>('#ffffff');
  const [imagesList, setImagesList] = useState<Array<{ dataUrl: string; fileName: string }>>([]);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [activeView, setActiveView] = useState<'upload' | 'portfolio' | 'revision'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin moderation state
  const [designersData, setDesignersData] = useState<{ usuario: Usuario; designs: Diseño[] }[]>([]);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const isDesignerOrAdmin =
    currentUser?.role === 'designer' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const [editingDesign, setEditingDesign] = useState<Diseño | null>(null);

  const handleOrderDesign = (des: { id: string; titulo: string; imagen_url: string; precio: number; tipo_3d?: string; color_producto?: string }) => {
    const productTypeLabel = des.tipo_3d === 'vaso' ? 'Vaso Vidrio' : des.tipo_3d === 'termo' ? 'Termo Acero' : des.tipo_3d === 'gorra' ? 'Gorra Trucker' : des.tipo_3d === 'taza' ? 'Taza Cerámica' : 'Playera';
    const basePrice = des.precio > 0 ? des.precio + 150 : 190;
    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      producto_id: des.id,
      producto_nombre: `${des.titulo} (${productTypeLabel})`,
      producto_imagen: des.imagen_url,
      tipo_3d: des.tipo_3d || 'playera',
      precio_unitario: basePrice,
      cantidad: 1,
      color: des.color_producto || '#ffffff',
      diseño_personalizado: { image: des.imagen_url }
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    } else {
      Database.addToCart(cartItem);
    }
    setSuccessMsg(`¡"${des.titulo}" fue añadido a tu carrito de compras!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const loadDesigns = () => {
    const allDesigns = Database.getDesigns();
    if (!currentUser) {
      setDesigns(allDesigns);
      return;
    }
    if (currentUser.role === 'admin') {
      setDesigns(allDesigns);
      return;
    }
    setDesigns(allDesigns.filter(d => 
      d.usuario_id === currentUser.id || 
      (currentUser.nombre && d.nombre_diseñador === currentUser.nombre) ||
      (currentUser.email && d.nombre_diseñador === currentUser.email) ||
      d.usuario_id === 'guest-designer' ||
      d.nombre_diseñador === 'Invitado'
    ));
  };

  const handleDeleteDesign = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este diseño de tu portafolio?')) {
      Database.deleteDesign(id);
      setSuccessMsg('Diseño eliminado correctamente del portafolio.');
      loadDesigns();
      if (isAdmin) loadAdminData();
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleSaveEditedDesign = (updatedData: { titulo: string; precio: number; tipo_3d: 'playera' | 'vaso' | 'termo' | 'gorra' | 'taza'; imagen_url: string }) => {
    if (!editingDesign) return;
    Database.updateDesign(editingDesign.id, updatedData);
    setSuccessMsg('¡Diseño del portafolio actualizado con éxito!');
    setEditingDesign(null);
    loadDesigns();
    if (isAdmin) loadAdminData();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const loadAdminData = () => {
    setDesignersData(Database.getAllDesignersWithDesigns());
  };

  useEffect(() => {
    loadDesigns();
    if (isAdmin) {
      loadAdminData();
      setActiveView('revision'); // Admin sees moderation panel first
    }
  }, [currentUser]);

  /* ── File picker handler (supports batch selection) ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`El archivo "${file.name}" no es una imagen válida (PNG, JPG, SVG).`);
        return false;
      }
      if (file.size > 12 * 1024 * 1024) {
        alert(`El archivo "${file.name}" supera los 12 MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const loadedEntries: Array<{ dataUrl: string; fileName: string }> = [];
    let processed = 0;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          loadedEntries.push({
            dataUrl: ev.target.result as string,
            fileName: file.name
          });
        }
        processed++;
        if (processed === validFiles.length) {
          setImagesList(prev => {
            const next = [...prev, ...loadedEntries];
            if (next.length > 0) {
              setImageDataUrl(next[0].dataUrl);
              setImageFileName(next[0].fileName);
            }
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /* ── Drop zone drag-and-drop (supports batch drop) ── */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    const fakeEvent = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
  };

  /* ── Helper: generate default design canvas ── */
  const generateDefaultDesignImage = (titleText: string, productType: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(titleText.toUpperCase(), 200, 180);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '15px sans-serif';
      ctx.fillText(`Diseño Personalizado Sublimax`, 200, 220);
    }
    return canvas.toDataURL('image/png');
  };

  /* ── Upload design (Batch processing) ── */
  const handleUpload = async (e?: React.SyntheticEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    const titleInputEl = document.getElementById('design-title-input') as HTMLInputElement | null;
    const currentTitle = (title || titleInputEl?.value || '').trim();

    if (!currentTitle) {
      alert('Por favor escribe un título en el campo "Título del Diseño".');
      return;
    }

    setIsUploading(true);

    try {
      const designerId = currentUser?.id || 'guest-designer';
      const designerName = currentUser?.nombre || 'Invitado';
      const basePrice = (tipo3D === 'vaso' ? 190 : tipo3D === 'termo' ? 220 : tipo3D === 'gorra' ? 150 : tipo3D === 'taza' ? 120 : 250) + Number(price || 0);
      const productTypeLabel = tipo3D === 'vaso' ? 'Vaso Vidrio' : tipo3D === 'termo' ? 'Termo Acero' : tipo3D === 'gorra' ? 'Gorra Trucker' : tipo3D === 'taza' ? 'Taza Cerámica' : 'Playera';

      const itemsToProcess = imagesList.length > 0 
        ? imagesList 
        : [{ dataUrl: imageDataUrl || generateDefaultDesignImage(currentTitle, tipo3D), fileName: 'diseno.png' }];

      let uploadedCount = 0;

      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];
        const compressedImage = await compressImageIfNeeded(item.dataUrl);
        const itemTitle = itemsToProcess.length > 1 ? `${currentTitle} (${i + 1})` : currentTitle;

        const newDesign = Database.uploadDesign({
          usuario_id: designerId,
          nombre_diseñador: designerName,
          titulo: itemTitle,
          imagen_url: compressedImage,
          precio: Number(price || 0),
          tipo_3d: tipo3D,
          color_producto: productColor,
        });

        const cartItem: CartItem = {
          id: `cart-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          producto_id: newDesign.id,
          producto_nombre: `${itemTitle} (${productTypeLabel})`,
          producto_imagen: compressedImage,
          tipo_3d: tipo3D,
          precio_unitario: basePrice,
          cantidad: quantity || 1,
          color: productColor || '#ffffff',
          diseño_personalizado: { image: compressedImage }
        };

        if (onAddToCart) {
          onAddToCart(cartItem);
        } else {
          Database.addToCart(cartItem);
        }
        uploadedCount++;
      }

      setTitle('');
      setPrice(0);
      setQuantity(1);
      setImageDataUrl(null);
      setImageFileName('');
      setImagesList([]);
      setIsUploading(false);

      if (isAdmin) loadAdminData();
      loadDesigns();
      setActiveView('portfolio');

      alert(`¡DISEÑOS REGISTRADOS CON ÉXITO!\n\nSe subieron ${uploadedCount} diseño(s) ("${currentTitle}") a revisión y se añadieron a tu portafolio/carrito.`);
      setSuccessMsg(`¡${uploadedCount} diseño(s) enviado(s) a revisión y añadidos a tu portafolio!`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      console.error("Error al subir diseño:", err);
      setIsUploading(false);
      alert('Ocurrió un inconveniente al procesar el diseño: ' + (err?.message || err));
    }
  };

  /* ── Join as designer (promote existing user) ── */
  const handleJoinProgram = () => {
    if (!currentUser) return;
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

  /* ── Stats ── */
  const totalSalesCount = designs.reduce((s, d) => s + d.ventas, 0);
  const totalCommissions = designs.reduce((s, d) => s + d.ventas * (d.precio + 20) * 0.15, 0);

  /* ═══════════════════════════════════════════
     RENDER: Not logged in
  ═══════════════════════════════════════════ */
  if (!currentUser) {
    return (
      <>
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onSuccess={user => {
              onRefreshUser();
              setShowRegister(false);
            }}
          />
        )}

        <div className="flex flex-col items-center gap-8 py-8">
          {/* Hero banner */}
          <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-10 border border-indigo-500/20 overflow-hidden text-center">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-pink-900/15 pointer-events-none" />

            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-950/50">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3">
              Comunidad de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                Creadores
              </span>
            </h1>
            <p className="text-slate-300 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
              Monetiza tu creatividad. Sube tus diseños, configura tus regalías y gana
              <span className="text-emerald-400 font-bold"> comisiones del 15%</span> por cada
              producto vendido con tu arte en SUBLIMAX Studio.
            </p>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
              {[
                {
                  step: '01',
                  color: 'text-indigo-400',
                  title: 'Regístrate gratis',
                  desc: 'Crea tu cuenta con rol de Diseñador en segundos.',
                  icon: <UserPlus className="w-5 h-5" />,
                },
                {
                  step: '02',
                  color: 'text-pink-400',
                  title: 'Sube tu diseño',
                  desc: 'Carga archivos PNG, JPG o SVG de alta resolución.',
                  icon: <ImagePlus className="w-5 h-5" />,
                },
                {
                  step: '03',
                  color: 'text-emerald-400',
                  title: 'Gana comisiones',
                  desc: '15% garantizado sobre cada venta con tu arte.',
                  icon: <DollarSign className="w-5 h-5" />,
                },
              ].map(s => (
                <div key={s.step} className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <div className={`${s.color} mb-2 flex items-center gap-2`}>
                    {s.icon}
                    <span className="text-xs font-extrabold uppercase tracking-widest">{s.step}</span>
                  </div>
                  <span className="text-xs text-white font-bold block mb-1">{s.title}</span>
                  <span className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="open-register-modal-btn"
                onClick={() => setShowRegister(true)}
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Crear Cuenta de Diseñador
              </button>
              <button
                id="login-cta-btn"
                onClick={() => {
                  // Scroll to header login
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-2xl text-sm transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Ya tengo cuenta — Iniciar Sesión
              </button>
            </div>
          </div>

          {/* Public approved designs showcase */}
          <PublicDesignsGrid />
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Logged in but NOT a designer/admin
  ═══════════════════════════════════════════ */
  if (!isDesignerOrAdmin) {
    return (
      <>
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onSuccess={() => {
              onRefreshUser();
              setShowRegister(false);
            }}
          />
        )}

        <div className="flex flex-col items-center gap-8 py-4">
          <div className="w-full max-w-2xl glass-panel rounded-3xl p-8 border border-indigo-500/20 text-center">
            <Award className="w-14 h-14 text-indigo-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-extrabold text-white mb-2">
              Conviértete en Diseñador de SUBLIMAX
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Tu cuenta actual es de cliente. Activa el modo diseñador para comenzar a subir
              tu arte y ganar comisiones automáticas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="activate-designer-btn"
                onClick={handleJoinProgram}
                className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Activar Modo Diseñador
              </button>
              <button
                id="open-register-modal-btn-2"
                onClick={() => setShowRegister(true)}
                className="px-7 py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl text-sm transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Registrar Nueva Cuenta de Diseñador
              </button>
            </div>
          </div>
          <PublicDesignsGrid />
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Designer / Admin Dashboard
  ═══════════════════════════════════════════ */
  return (
    <div className="flex flex-col gap-8">

      {/* Success notification */}
      {successMsg && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 rounded-2xl text-sm animate-fade-in">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Tus Diseños',
            value: designs.length,
            suffix: '',
            color: 'text-white',
            icon: <Palette className="w-5 h-5 text-indigo-400" />,
          },
          {
            label: 'Diseños Activos',
            value: designs.filter(d => d.aprobado).length,
            suffix: '',
            color: 'text-emerald-400',
            icon: <Check className="w-5 h-5 text-emerald-400" />,
          },
          {
            label: 'Veces Vendido',
            value: totalSalesCount,
            suffix: 'x',
            color: 'text-pink-400',
            icon: <TrendingUp className="w-5 h-5 text-pink-400" />,
          },
          {
            label: 'Comisiones Ganadas',
            value: `$${totalCommissions.toFixed(0)}`,
            suffix: ' MXN',
            color: 'text-amber-400',
            icon: <DollarSign className="w-5 h-5 text-amber-400" />,
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="glass-panel rounded-2xl p-5 border-slate-800 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <span className={`text-2xl font-extrabold ${stat.color}`}>
              {stat.value}{typeof stat.value === 'number' ? stat.suffix : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-900 self-start flex-wrap">
        {/* Admin sees revision tab first */}
        {isAdmin && (
          <button
            id="tab-revision"
            onClick={() => { setActiveView('revision'); loadAdminData(); }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === 'revision'
                ? 'bg-amber-600/30 border border-amber-500/40 text-amber-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Revisión de Diseños
            {/* Pending badge */}
            {(() => {
              const pending = designersData.flatMap(d => d.designs).filter(d => !d.aprobado).length;
              return pending > 0 ? (
                <span className="ml-1 bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">{pending}</span>
              ) : null;
            })()}
          </button>
        )}
        <button
          id="tab-upload"
          onClick={() => setActiveView('upload')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeView === 'upload'
              ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Subir Diseño
        </button>
        <button
          id="tab-portfolio"
          onClick={() => setActiveView('portfolio')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeView === 'portfolio'
              ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> Mi Portafolio ({designs.length})
        </button>
      </div>

      {/* ── UPLOAD VIEW ── */}
      {activeView === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Form panel */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-white">Subir Nueva Plantilla de Diseño</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                PNG transparente o JPG de alta resolución recomendado.
              </p>
            </div>

            <form id="upload-design-form" onSubmit={handleUpload} className="flex flex-col gap-4">

              {/* ── Image drop zone ── */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                  Imágenes del Diseño (Puedes subir varios archivos a la vez) *
                </label>
                <div
                  id="image-drop-zone"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full min-h-[140px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition gap-2 p-3 ${
                    imagesList.length > 0 || imageDataUrl
                      ? 'border-indigo-500/50 bg-indigo-950/20'
                      : 'border-slate-700 bg-slate-950/40 hover:border-indigo-500/40 hover:bg-indigo-950/10'
                  }`}
                >
                  {imagesList.length > 0 ? (
                    <div className="w-full flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-h-48 overflow-y-auto p-1">
                        {imagesList.map((img, idx) => (
                          <div key={idx} className="relative group bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
                            <img src={img.dataUrl} alt={`Vista ${idx}`} className="h-16 w-full object-contain rounded-lg mb-1" />
                            <span className="text-[9px] text-slate-300 truncate max-w-full font-semibold">{img.fileName}</span>
                            <button
                              type="button"
                              onClick={ev => {
                                ev.stopPropagation();
                                setImagesList(prev => {
                                  const next = prev.filter((_, i) => i !== idx);
                                  if (next.length > 0) {
                                    setImageDataUrl(next[0].dataUrl);
                                    setImageFileName(next[0].fileName);
                                  } else {
                                    setImageDataUrl(null);
                                    setImageFileName('');
                                  }
                                  return next;
                                });
                              }}
                              className="absolute top-1 right-1 p-1 bg-slate-950/90 hover:bg-red-900 text-slate-400 hover:text-red-200 rounded-lg transition border border-slate-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between w-full px-2 pt-1 border-t border-slate-800/80 text-xs">
                        <span className="text-indigo-400 font-bold">{imagesList.length} archivo(s) listo(s)</span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-indigo-300 hover:text-white underline text-[11px] font-semibold"
                        >
                          + Añadir más archivos
                        </button>
                      </div>
                    </div>
                  ) : imageDataUrl ? (
                    <>
                      <img
                        src={imageDataUrl}
                        alt="Vista previa"
                        className="max-h-28 max-w-full object-contain rounded-xl"
                      />
                      <span className="text-[10px] text-indigo-400 font-semibold truncate max-w-[90%]">
                        {imageFileName}
                      </span>
                      <button
                        type="button"
                        onClick={ev => {
                          ev.stopPropagation();
                          setImageDataUrl(null);
                          setImageFileName('');
                          setImagesList([]);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-10 h-10 text-slate-600" />
                      <span className="text-xs text-slate-500 font-medium text-center px-4">
                        Arrastra tus imágenes aquí o{' '}
                        <span className="text-indigo-400 underline">selecciona uno o varios archivos</span>
                      </span>
                      <span className="text-[10px] text-slate-600">PNG, JPG, SVG — Carga individual o múltiple</span>
                    </>
                  )}
                  <input
                    id="image-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Product Type Selector */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                  Producto a Personalizar *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'playera', label: 'Playera / Camisa', icon: '👕' },
                    { id: 'vaso', label: 'Vaso de Vidrio', icon: '🥤' },
                    { id: 'termo', label: 'Termo de Acero', icon: '🧪' },
                    { id: 'gorra', label: 'Gorra Trucker', icon: '🧢' },
                    { id: 'taza', label: 'Taza Cerámica', icon: '☕' },
                  ].map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setTipo3D(p.id as any)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        tipo3D === p.id
                          ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{p.icon}</span>
                        {tipo3D === p.id && <Check className="w-3.5 h-3.5 text-indigo-400 font-bold" />}
                      </div>
                      <span className="text-xs font-bold mt-1.5 block truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                  Título del Diseño *
                </label>
                <input
                  id="design-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. Girasoles Acuarela, Logo Minimalista..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                  Precio Licencia / Regalía ($ MXN)
                </label>
                <input
                  id="design-price-input"
                  type="number"
                  min="0"
                  step="5"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                />
                <span className="text-[10px] text-slate-600 mt-1 block">
                  Establece $0 para uso libre en la plataforma.
                </span>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                  Cantidad de Productos (Piezas) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-base flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-base flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-400 font-semibold ml-2">piezas</span>
                </div>
              </div>

              <button
                id="submit-design-btn"
                type="button"
                onClick={handleUpload}
                disabled={isUploading || !title.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-950/40 cursor-pointer"
              >
                {isUploading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Subiendo diseño...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Enviar Diseño a Revisión</>
                )}
              </button>
            </form>
          </div>

          {/* Live preview panel */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col items-center gap-5">
            <div className="text-center">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Vista Previa en {
                  tipo3D === 'playera' ? 'Playera / Camisa' :
                  tipo3D === 'vaso' ? 'Vaso de Vidrio Bambú' :
                  tipo3D === 'termo' ? 'Termo de Acero Inoxidable' :
                  tipo3D === 'gorra' ? 'Gorra Trucker' : 'Taza de Cerámica'
                }
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Así lucirá tu diseño impreso en el producto seleccionado.
              </p>
            </div>

            <ProductPreview imageDataUrl={imageDataUrl} title={title || 'Tu diseño aquí'} tipo3D={tipo3D} productColor={productColor} onColorChange={setProductColor} showColorPalette={true} />

            {/* Total Price Calculation Box */}
            <div className="w-full bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2 text-xs shadow-inner">
              <div className="flex justify-between items-center text-slate-400">
                <span>Producto Base ({tipo3D.toUpperCase()}):</span>
                <span className="font-semibold text-slate-200">
                  ${(tipo3D === 'vaso' ? 190 : tipo3D === 'termo' ? 220 : tipo3D === 'gorra' ? 150 : tipo3D === 'taza' ? 120 : 250).toFixed(2)} MXN
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Licencia / Regalía:</span>
                <span className="font-semibold text-slate-200">${Number(price || 0).toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Cantidad Solicitada:</span>
                <span className="font-bold text-indigo-400">{quantity} pieza(s)</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-slate-800">
                <span className="text-white font-bold">TOTAL A PAGAR ESTIMADO:</span>
                <span className="text-emerald-400 text-base font-extrabold">
                  ${(((tipo3D === 'vaso' ? 190 : tipo3D === 'termo' ? 220 : tipo3D === 'gorra' ? 150 : tipo3D === 'taza' ? 120 : 250) + Number(price || 0)) * quantity).toFixed(2)} MXN
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-900 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                Información de Impresión
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left mt-2">
                {[
                  ['Técnica', 'Sublimación Digital HD'],
                  ['Área', tipo3D === 'playera' ? '18 × 22 cm' : tipo3D === 'vaso' ? '15 × 23 cm (Wrap)' : tipo3D === 'termo' ? '14 × 21 cm (Wrap)' : tipo3D === 'gorra' ? '12 × 7 cm (Parche)' : '19 × 8.5 cm (Wrap)'],
                  ['Soporte', tipo3D === 'playera' ? 'Poliéster 100%' : tipo3D === 'vaso' ? 'Vidrio Borosilicato + Bambú' : tipo3D === 'termo' ? 'Acero Inoxidable 304' : tipo3D === 'gorra' ? 'Gabardina y Malla' : 'Cerámica Premium AAA'],
                  ['Colores', 'Full-color ilimitado'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[9px] text-slate-600 block">{k}</span>
                    <span className="text-[10px] text-slate-300 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── EDIT DESIGN MODAL ── */}
      {editingDesign && (
        <EditDesignModal
          design={editingDesign}
          onClose={() => setEditingDesign(null)}
          onSave={handleSaveEditedDesign}
        />
      )}

      {/* ── PORTFOLIO VIEW ── */}
      {activeView === 'portfolio' && (
        <div className="glass-panel rounded-3xl p-6 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              Tu Portafolio de Diseñador
            </h2>
            <button
              onClick={() => setActiveView('upload')}
              className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Subir Nuevo Diseño
            </button>
          </div>

          {designs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map(des => (
                <div
                  key={des.id}
                  className={`bg-slate-950/50 border rounded-2xl overflow-hidden flex flex-col group transition ${
                    des.aprobado
                      ? 'border-emerald-800/40 hover:border-emerald-500/40'
                      : 'border-amber-800/30 hover:border-amber-500/30'
                  }`}
                >
                  {/* Status banner */}
                  {des.aprobado ? (
                    <div className="flex items-center gap-2 bg-emerald-950/70 border-b border-emerald-900/50 px-4 py-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">✓ Aprobado — Activo en el Marketplace</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-950/50 border-b border-amber-900/40 px-4 py-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Pendiente de revisión por el Admin</span>
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="relative bg-slate-900/40 p-4 flex items-center justify-center min-h-[160px]">
                    <ProductPreview imageDataUrl={des.imagen_url} title="" tipo3D={des.tipo_3d || 'playera'} productColor={des.color_producto || '#ffffff'} showColorPalette={false} />
                    <span className="absolute top-2 right-2 text-[9px] font-bold bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">
                      {des.tipo_3d === 'vaso' ? '🥤 Vaso Vidrio' : des.tipo_3d === 'termo' ? '🧪 Termo' : des.tipo_3d === 'gorra' ? '🧢 Gorra' : des.tipo_3d === 'taza' ? '☕ Taza' : '👕 Playera'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-1 flex-1">
                    <span className="font-bold text-sm text-white leading-snug truncate">{des.titulo}</span>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-[10px] text-slate-500">
                        Vendido: <span className="text-slate-300 font-bold">{des.ventas}x</span>
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        ${des.precio}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">MXN</span>
                      </span>
                    </div>

                    {/* Order to Cart Button */}
                    <button
                      type="button"
                      onClick={() => handleOrderDesign(des)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 cursor-pointer mt-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Hacer Pedido / Añadir al Carrito
                    </button>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={() => setEditingDesign(des)}
                        className="py-1.5 px-3 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDesign(des.id)}
                        className="py-1.5 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-600 text-sm">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-800" />
              Aún no has subido ningún diseño.{' '}
              <button onClick={() => setActiveView('upload')} className="text-indigo-400 underline hover:text-indigo-300">
                Sube tu primera propuesta
              </button>
              .
            </div>
          )}
        </div>
      )}

      {/* ── ADMIN REVISION VIEW ── */}
      {activeView === 'revision' && isAdmin && (
        <div className="flex flex-col gap-6">

          {/* Action feedback */}
          {actionMsg && (
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm animate-fade-in border ${
              actionMsg.type === 'ok'
                ? 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400'
                : 'bg-red-950/60 border-red-800/50 text-red-400'
            }`}>
              {actionMsg.type === 'ok' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {actionMsg.text}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <ClipboardList className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Panel de Moderación</h2>
                <p className="text-xs text-slate-500">Revisa, aprueba o rechaza los diseños de los creadores.</p>
              </div>
            </div>
            <button
              onClick={loadAdminData}
              className="text-xs text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" /> Actualizar
            </button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const allD = designersData.flatMap(d => d.designs);
              return [
                { label: 'Usuarios', value: designersData.length, icon: <Users className="w-4 h-4 text-indigo-400" />, color: 'text-indigo-300' },
                { label: 'Pendientes', value: allD.filter(d => !d.aprobado).length, icon: <Clock className="w-4 h-4 text-amber-400" />, color: 'text-amber-300' },
                { label: 'Aprobados', value: allD.filter(d => d.aprobado).length, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, color: 'text-emerald-300' },
              ].map(s => (
                <div key={s.label} className="glass-panel rounded-2xl p-4 border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{s.label}</span>
                    {s.icon}
                  </div>
                  <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
                </div>
              ));
            })()}
          </div>

          {/* Designer cards */}
          {designersData.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 border-slate-800 text-center text-slate-600 text-sm flex flex-col items-center gap-3">
              <Users className="w-12 h-12 text-slate-800" />
              <p>No hay usuarios autenticados todavía.</p>
              <p className="text-xs text-slate-700">Los usuarios registrados y autenticados aparecerán aquí.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {designersData.map(({ usuario, designs: dList }) => (
                <div key={usuario.id} className="glass-panel rounded-3xl p-6 border-slate-800">

                  {/* Designer header */}
                  <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-900">
                    <img
                      src={usuario.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(usuario.email)}`}
                      alt={usuario.nombre}
                      className="w-12 h-12 rounded-full border-2 border-indigo-500/30 bg-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{usuario.nombre}</span>
                        <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full font-bold uppercase">
                          {usuario.role}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block truncate">{usuario.email}</span>
                      <span className="text-[10px] text-slate-600">Registrado: {usuario.fecha_registro}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-extrabold text-white">{dList.length}</span>
                      <span className="text-[10px] text-slate-500 block">diseños</span>
                    </div>
                  </div>

                  {/* Designs grid */}
                  {dList.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-xs flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-800" />
                      Este usuario aún no ha subido diseños a su portafolio.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dList.map(des => (
                        <div
                          key={des.id}
                          className={`rounded-2xl border overflow-hidden flex flex-col transition ${
                            des.aprobado
                              ? 'border-emerald-800/40 bg-emerald-950/10'
                              : 'border-amber-800/40 bg-amber-950/10'
                          }`}
                        >
                          {/* Status strip */}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 ${
                            des.aprobado ? 'bg-emerald-900/30' : 'bg-amber-900/20'
                          }`}>
                            {des.aprobado
                              ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              : <Clock className="w-3 h-3 text-amber-400" />}
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                              des.aprobado ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {des.aprobado ? 'Aprobado' : 'Pendiente de revisión'}
                            </span>
                          </div>

                          {/* Product thumbnail */}
                          <div className="relative bg-slate-900/40 p-3 flex items-center justify-center min-h-[140px]">
                            <ProductPreview imageDataUrl={des.imagen_url} title="" tipo3D={des.tipo_3d || 'playera'} productColor={des.color_producto || '#ffffff'} showColorPalette={false} />
                            <span className="absolute top-2 right-2 text-[9px] font-bold bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">
                              {des.tipo_3d === 'vaso' ? '🥤 Vaso Vidrio' : des.tipo_3d === 'termo' ? '🧪 Termo' : des.tipo_3d === 'gorra' ? '🧢 Gorra' : des.tipo_3d === 'taza' ? '☕ Taza' : '👕 Playera'}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-3 flex flex-col gap-2">
                            <span className="font-bold text-xs text-white truncate">{des.titulo}</span>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">Precio: <strong className="text-white">${des.precio} MXN</strong></span>
                              <span className="text-[10px] text-slate-400">{des.ventas} ventas</span>
                            </div>

                            {/* Action buttons */}
                            {!des.aprobado ? (
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => {
                                    Database.approveDesign(des.id);
                                    loadAdminData();
                                    loadDesigns();
                                    setActionMsg({ text: `✓ "${des.titulo}" aprobado. El diseñador fue notificado.`, type: 'ok' });
                                    setTimeout(() => setActionMsg(null), 4000);
                                  }}
                                  className="flex-1 py-2 bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-700/50 text-emerald-300 text-[10px] font-bold rounded-xl transition flex items-center justify-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                                </button>
                                <button
                                  onClick={() => {
                                    if (!confirm(`¿Rechazar y eliminar "${des.titulo}"? Esta acción no se puede deshacer.`)) return;
                                    Database.rejectDesign(des.id);
                                    loadAdminData();
                                    loadDesigns();
                                    setActionMsg({ text: `✗ "${des.titulo}" rechazado y eliminado.`, type: 'err' });
                                    setTimeout(() => setActionMsg(null), 4000);
                                  }}
                                  className="flex-1 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 text-[10px] font-bold rounded-xl transition flex items-center justify-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Rechazar
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 mt-1">
                                <div className="flex-1 py-2 bg-emerald-950/30 border border-emerald-900/30 text-emerald-500 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Publicado en Marketplace
                                </div>
                                <button
                                  onClick={() => {
                                    if (!confirm(`¿Retirar "${des.titulo}" del marketplace?`)) return;
                                    Database.rejectDesign(des.id);
                                    loadAdminData();
                                    loadDesigns();
                                    setActionMsg({ text: `"${des.titulo}" retirado del marketplace.`, type: 'err' });
                                    setTimeout(() => setActionMsg(null), 4000);
                                  }}
                                  className="px-3 py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 text-red-500 text-[10px] font-bold rounded-xl transition"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PUBLIC DESIGNS GRID
   Shows approved public designs to non-logged visitors.
   ───────────────────────────────────────────── */
const PublicDesignsGrid: React.FC = () => {
  const [publicDesigns, setPublicDesigns] = useState<Diseño[]>([]);

  useEffect(() => {
    const all = Database.getDesigns();
    setPublicDesigns(all.filter(d => d.aprobado).slice(0, 6));
  }, []);

  if (publicDesigns.length === 0) return null;

  return (
    <div className="w-full max-w-3xl">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
        Diseños destacados de la comunidad
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {publicDesigns.map(d => (
          <div key={d.id} className="glass-panel rounded-2xl p-3 border-slate-850 flex flex-col items-center gap-2">
            <ProductPreview imageDataUrl={d.imagen_url} title="" tipo3D={d.tipo_3d || 'playera'} productColor={d.color_producto || '#ffffff'} showColorPalette={false} />
            <span className="text-xs font-bold text-white truncate w-full text-center">{d.titulo}</span>
            <span className="text-[10px] text-indigo-400">por {d.nombre_diseñador}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
