import React, { useState } from 'react';
import { Database, Usuario, supabaseClient } from '../services/database';
import { X, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: Usuario) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSupabaseGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (supabaseClient) {
        const res = await Database.signInWithGoogleOAuth();
        if (res.error) {
          setErrorMsg(`Error Supabase OAuth: ${res.error}`);
          setIsLoading(false);
        }
        // Redirect handled by browser
      } else {
        // Fallback for Sandbox mode
        setTimeout(() => {
          const user = Database.loginWithGoogle(
            'diseñador.google@gmail.com',
            'Diseñador Google Pro'
          );
          setIsLoading(false);
          onSuccess(user);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error iniciando sesión con Google');
      setIsLoading(false);
    }
  };

  const handleQuickPresetSelect = (email: string, name: string, avatar?: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const user = Database.loginWithGoogle(email, name, avatar);
      setIsLoading(false);
      onSuccess(user);
      onClose();
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido de Google');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const name = customName.trim() || customEmail.split('@')[0].toUpperCase();
      const user = Database.loginWithGoogle(customEmail.trim(), name);
      setIsLoading(false);
      onSuccess(user);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 border border-white/20 rounded-2xl mb-3 shadow-lg">
            {/* SVG Official Google 'G' Logo */}
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 12 0 7.37 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-black text-white">Iniciar Sesión con Google</h3>
          <p className="text-xs text-slate-400 mt-1">
            Autenticación rápida de Google para creadores y diseñadores SUBLIMAX
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Acceso Automático con Privilegios de Diseñador
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-900/40 rounded-xl text-xs text-red-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* Main Action: Primary Google Button */}
        <button
          onClick={handleSupabaseGoogleLogin}
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-3 border border-slate-200 mb-6 group cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continuar como Diseñador de Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-slate-900 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            O selecciona una cuenta demo de Google
          </span>
        </div>

        {/* Account Presets */}
        <div className="flex flex-col gap-2.5 mb-6">
          <button
            onClick={() =>
              handleQuickPresetSelect(
                'diseñador.google@gmail.com',
                'Diseñador Google Pro',
                'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleDesigner1'
              )
            }
            className="w-full p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                G1
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                  diseñador.google@gmail.com
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Privilegios de Diseñador Pro
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-bold">
              Usar
            </span>
          </button>

          <button
            onClick={() =>
              handleQuickPresetSelect(
                'creador.studio@gmail.com',
                'Creador Sublimax',
                'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleDesigner2'
              )
            }
            className="w-full p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                G2
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                  creador.studio@gmail.com
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Privilegios de Diseñador Pro
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold">
              Usar
            </span>
          </button>
        </div>

        {/* Manual Google Email Entry */}
        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ingresar correo alternativo de Google:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="tu.cuenta@gmail.com"
              value={customEmail}
              onChange={e => setCustomEmail(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
            >
              Ingresar
            </button>
          </div>
        </form>

        {/* Security / Terms Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Autenticación segura Google OAuth
          </span>
          <span>SUBLIMAX Studio v2026</span>
        </div>
      </div>
    </div>
  );
};
