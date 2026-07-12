import React, { useState, useEffect, useRef } from 'react';
import { Database, Diseño, Usuario } from '../services/database';
import {
  Sparkles, Upload, Check, Loader, Award, X,
  Eye, Palette, ImagePlus, UserPlus, LogIn, ShieldCheck,
  TrendingUp, DollarSign, Package
} from 'lucide-react';

interface DesignerMarketplaceProps {
  currentUser: Usuario | null;
  onRefreshUser: () => void;
}

/* ─────────────────────────────────────────────
   SHIRT SVG PREVIEW
   Renders an SVG shirt silhouette with the
   designer's uploaded image mapped onto the chest.
   ───────────────────────────────────────────── */
const ShirtPreview: React.FC<{ imageDataUrl: string | null; title: string }> = ({
  imageDataUrl,
  title,
}) => (
  <div className="relative flex items-center justify-center select-none">
    {/* Shirt silhouette */}
    <svg
      viewBox="0 0 200 220"
      className="w-full max-w-[260px] drop-shadow-2xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <path
        d="M60 30 L20 70 L45 80 L40 200 L160 200 L155 80 L180 70 L140 30 Q120 45 100 45 Q80 45 60 30Z"
        fill="#1e293b"
        stroke="#334155"
        strokeWidth="1.5"
      />
      {/* Left sleeve */}
      <path
        d="M60 30 Q50 35 40 50 L20 70 L45 80 Q50 60 55 45Z"
        fill="#1e293b"
        stroke="#334155"
        strokeWidth="1.5"
      />
      {/* Right sleeve */}
      <path
        d="M140 30 Q150 35 160 50 L180 70 L155 80 Q150 60 145 45Z"
        fill="#1e293b"
        stroke="#334155"
        strokeWidth="1.5"
      />
      {/* Collar */}
      <path
        d="M80 30 Q100 55 120 30"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* Design print area on chest */}
      {imageDataUrl ? (
        <image
          href={imageDataUrl}
          x="65"
          y="70"
          width="70"
          height="80"
          clipPath="url(#chest-clip)"
          style={{ objectFit: 'contain' }}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <g>
          <rect x="65" y="70" width="70" height="80" rx="4" fill="#0f172a" stroke="#334155" strokeDasharray="4 3" />
          <text x="100" y="110" textAnchor="middle" fontSize="7" fill="#475569" fontFamily="sans-serif">
            Vista previa
          </text>
          <text x="100" y="120" textAnchor="middle" fontSize="7" fill="#475569" fontFamily="sans-serif">
            del diseño
          </text>
        </g>
      )}
      <clipPath id="chest-clip">
        <rect x="65" y="70" width="70" height="80" rx="4" />
      </clipPath>

      {/* Brand tag at bottom */}
      <text x="100" y="194" textAnchor="middle" fontSize="5.5" fill="#334155" fontFamily="sans-serif" fontWeight="bold">
        SUBLIMAX STUDIO
      </text>
    </svg>

    {/* Floating label */}
    {title && (
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 whitespace-nowrap">
        {title}
      </span>
    )}
  </div>
);

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

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export const DesignerMarketplace: React.FC<DesignerMarketplaceProps> = ({
  currentUser,
  onRefreshUser,
}) => {
  const [designs, setDesigns] = useState<Diseño[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [activeView, setActiveView] = useState<'upload' | 'portfolio'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDesignerOrAdmin =
    currentUser?.role === 'designer' || currentUser?.role === 'admin';

  const loadDesigns = () => {
    if (!currentUser) return;
    const allDesigns = Database.getDesigns();
    setDesigns(allDesigns.filter(d => d.usuario_id === currentUser.id));
  };

  useEffect(() => {
    loadDesigns();
  }, [currentUser]);

  /* ── File picker handler ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen (PNG, JPG, SVG, etc.)');
      return;
    }
    // Validate size (max 8 MB)
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no debe superar 8 MB.');
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      setImageDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* ── Drop zone drag-and-drop ── */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
  };

  /* ── Upload design ── */
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageDataUrl || !currentUser) return;

    setIsUploading(true);
    setTimeout(() => {
      Database.uploadDesign({
        usuario_id: currentUser.id,
        nombre_diseñador: currentUser.nombre,
        titulo: title,
        imagen_url: imageDataUrl,
        precio: Number(price),
      });

      setTitle('');
      setPrice(0);
      setImageDataUrl(null);
      setImageFileName('');
      setIsUploading(false);
      setSuccessMsg('¡Diseño enviado con éxito! Pendiente de aprobación por el Administrador.');
      loadDesigns();
      setActiveView('portfolio');
      setTimeout(() => setSuccessMsg(''), 5000);
    }, 1600);
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
      <div className="flex gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-900 self-start">
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
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                  Imagen del Diseño *
                </label>
                <div
                  id="image-drop-zone"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full min-h-[140px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition gap-2 ${
                    imageDataUrl
                      ? 'border-indigo-500/50 bg-indigo-950/20'
                      : 'border-slate-700 bg-slate-950/40 hover:border-indigo-500/40 hover:bg-indigo-950/10'
                  }`}
                >
                  {imageDataUrl ? (
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
                        Arrastra tu imagen aquí o{' '}
                        <span className="text-indigo-400 underline">selecciona un archivo</span>
                      </span>
                      <span className="text-[10px] text-slate-600">PNG, JPG, SVG — Máx. 8 MB</span>
                    </>
                  )}
                  <input
                    id="image-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
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
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
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

              <button
                id="submit-design-btn"
                type="submit"
                disabled={isUploading || !title.trim() || !imageDataUrl}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-950/40"
              >
                {isUploading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Subiendo diseño...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Enviar Diseño a Revisión</>
                )}
              </button>
            </form>
          </div>

          {/* Live shirt preview panel */}
          <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col items-center gap-5">
            <div className="text-center">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Vista Previa en Camisa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Así lucirá tu diseño impreso en la playera.
              </p>
            </div>

            <ShirtPreview imageDataUrl={imageDataUrl} title={title || 'Tu diseño aquí'} />

            <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-900 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                Información de Impresión
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left mt-2">
                {[
                  ['Técnica', 'Sublimación Digital'],
                  ['Área', '18 × 22 cm (pecho)'],
                  ['Soporte', 'Playera Poliéster 100%'],
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

      {/* ── PORTFOLIO VIEW ── */}
      {activeView === 'portfolio' && (
        <div className="glass-panel rounded-3xl p-6 border-slate-800">
          <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3 mb-4">
            Tu Portafolio de Diseñador
          </h2>

          {designs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map(des => (
                <div
                  key={des.id}
                  className="bg-slate-950/50 border border-slate-850 rounded-2xl overflow-hidden flex flex-col group hover:border-indigo-500/30 transition"
                >
                  {/* Thumbnail — shirt preview */}
                  <div className="relative bg-slate-900/40 p-4 flex items-center justify-center min-h-[160px]">
                    <ShirtPreview imageDataUrl={des.imagen_url} title="" />
                    {/* Status badge */}
                    <span
                      className={`absolute top-2 right-2 text-[9px] font-bold px-2.5 py-1 rounded-full ${
                        des.aprobado
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                          : 'bg-amber-950 text-amber-400 border border-amber-900'
                      }`}
                    >
                      {des.aprobado ? '✓ Activo' : '⏰ Pendiente'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-1 flex-1">
                    <span className="font-bold text-sm text-white leading-snug truncate">
                      {des.titulo}
                    </span>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-[10px] text-slate-500">
                        Vendido: <span className="text-slate-300 font-bold">{des.ventas}x</span>
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        ${des.precio}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">MXN</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-600 text-sm">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-800" />
              Aún no has subido ningún diseño.{' '}
              <button
                onClick={() => setActiveView('upload')}
                className="text-indigo-400 underline hover:text-indigo-300"
              >
                Sube tu primera propuesta
              </button>
              .
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
            <ShirtPreview imageDataUrl={d.imagen_url} title="" />
            <span className="text-xs font-bold text-white truncate w-full text-center">{d.titulo}</span>
            <span className="text-[10px] text-indigo-400">por {d.nombre_diseñador}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
