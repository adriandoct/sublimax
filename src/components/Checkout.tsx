import React, { useState } from 'react';
import { Database, CartItem, Cupon, Pedido } from '../services/database';
import { ShieldCheck, Ticket, Award, RefreshCw, CheckCircle, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutProps {
  cart: CartItem[];
  currentUser: any;
  onOrderPlaced: () => void;
  onClearCart: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cart, currentUser, onOrderPlaced, onClearCart }) => {
  const [paymentMethod] = useState<'mercadopago'>('mercadopago');
  const [copiedMp, setCopiedMp] = useState(false);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Cupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Reward points states
  const [usePoints, setUsePoints] = useState(false);
  const userPoints = currentUser ? Database.getTotalPoints(currentUser.id) : 0;
  // Let 10 points = $1 MXN discount
  const pointsDiscountVal = Math.min(userPoints * 0.1, cart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0) * 0.5); // cap at 50% of subtotal

  // Checkout Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPedido, setCompletedPedido] = useState<Pedido | null>(null);

  // Pricing calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.tipo === 'porcentaje') {
      couponDiscount = rawSubtotal * (appliedCoupon.valor / 100);
    } else {
      couponDiscount = appliedCoupon.valor;
    }
  }

  const pointsDiscount = usePoints ? pointsDiscountVal : 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, rawSubtotal - totalDiscount);
  
  // Points gained: $1 spent = 1 point
  const pointsToEarn = Math.floor(finalTotal);

  // Apply coupon
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    const validated = Database.validateCoupon(couponCode);
    if (validated) {
      setAppliedCoupon(validated);
    } else {
      setCouponError('Cupón inválido o expirado.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Submit payment
  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment API delay
    setTimeout(() => {
      // Create Order
      const newOrder = Database.createPedido({
        usuario_id: currentUser?.id || 'guest-id',
        usuario_nombre: currentUser?.nombre || 'Invitado',
        items: cart,
        subtotal: rawSubtotal,
        descuento: totalDiscount,
        total: finalTotal,
        estado: 'Pendiente',
        metodo_pago: paymentMethod.toUpperCase(),
        puntos_ganados: pointsToEarn
      });

      // Deduct reward points if redeemed
      if (usePoints && currentUser) {
        Database.addPoints(
          currentUser.id, 
          -Math.floor(pointsDiscount * 10), 
          'redencion', 
          `Canje por descuento en orden ${newOrder.codigo_seguimiento}`
        );
      }

      // Redeem Coupon in database logs
      if (appliedCoupon) {
        Database.useCoupon(appliedCoupon.codigo);
      }

      // Trigger Confetti Celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981']
      });

      setIsProcessing(false);
      setCompletedPedido(newOrder);
      onClearCart();
      onOrderPlaced();
    }, 300);
  };

  if (completedPedido) {
    return (
      <div className="glass-panel rounded-3xl p-8 max-w-xl mx-auto border-emerald-500/20 text-center flex flex-col items-center">
        <CheckCircle className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">¡Pago Procesado con Éxito!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Tu pedido ha sido recibido y enviado a nuestro taller de sublimación.
        </p>

        {/* Invoice details */}
        <div className="w-full bg-slate-950 p-5 rounded-2xl border border-slate-900 text-left text-xs flex flex-col gap-3 mb-6">
          <div className="flex justify-between font-mono">
            <span className="text-slate-500">Orden:</span>
            <span className="text-indigo-400 font-bold">{completedPedido.codigo_seguimiento}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha:</span>
            <span className="text-slate-300">{completedPedido.fecha_creacion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Método de pago:</span>
            <span className="text-slate-300 font-semibold">{completedPedido.metodo_pago}</span>
          </div>
          <div className="flex justify-between border-t border-slate-900 pt-2.5">
            <span className="text-slate-500 font-bold">Total Pagado:</span>
            <span className="text-white font-extrabold">${completedPedido.total.toFixed(2)} MXN</span>
          </div>
          <div className="flex justify-between text-emerald-400 text-[10px] font-bold">
            <span>Puntos acumulados:</span>
            <span>+{completedPedido.puntos_ganados} Pts</span>
          </div>
        </div>



        <button
          onClick={() => window.location.reload()}
          className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs transition"
        >
          Volver a la Tienda
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form / Pay Method Viewport */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Unified Professional Mercado Pago Direct Transfer Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 flex flex-col gap-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-2xl shadow-inner">
                💙
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Mercado Pago Directo
                </h3>
                <p className="text-slate-400 text-xs">Transferencia bancaria SPEI o depósito inmediato</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Método de Pago Oficial
            </span>
          </div>

          {/* Digital Mercado Pago Card Graphic */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 text-white shadow-2xl flex flex-col gap-5 border border-cyan-400/30 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-100">Mercado Pago — Tarjeta de Depósito</span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-white tracking-wider border border-white/20">SPEI / DÉBITO</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-cyan-200 block mb-1.5 font-medium">Número de Tarjeta Mercado Pago</span>
              <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider flex items-center justify-between bg-slate-950/40 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
                <span className="tracking-widest text-white">4312 5700 1824 6147</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('4312570018246147');
                    setCopiedMp(true);
                    setTimeout(() => setCopiedMp(false), 3000);
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-cyan-50 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 shrink-0"
                >
                  {copiedMp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
                  {copiedMp ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/15">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-cyan-200 block">Beneficiario</span>
                <span className="font-bold block text-sm truncate text-white">SUBLIMAX Studio</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-cyan-200 block">Banco Emisor</span>
                <span className="font-bold block text-sm text-white">Mercado Pago / STP</span>
              </div>
            </div>
          </div>

          {/* Step instructions */}
          <div className="w-full bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80 text-xs text-slate-300 flex flex-col gap-3">
            <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block">Pasos para completar tu pago:</span>
            <ol className="space-y-2.5 text-slate-300 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0 border border-cyan-500/30">1</span>
                <span>Abre tu aplicación bancaria (BBVA, Banamex, Nu, Mercado Pago, Banorte, etc.).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0 border border-cyan-500/30">2</span>
                <span>Transfiere a la tarjeta <strong className="text-cyan-300 font-mono">4312 5700 1824 6147</strong> el monto total de <strong className="text-white font-bold text-sm">${finalTotal.toFixed(2)} MXN</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0 border border-cyan-500/30">3</span>
                <span>Haz clic en el botón de abajo para registrar y procesar tu pedido inmediatamente.</span>
              </li>
            </ol>
          </div>

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl shadow-cyan-950/40 cursor-pointer"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isProcessing ? 'Procesando Orden...' : 'Confirmar Transferencia y Procesar Pedido'}
          </button>
        </div>

      </div>

      {/* Right Column: Checkout cart summary */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Cart items review */}
        <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-900 pb-3">Resumen de Orden</h3>
          <div className="flex flex-col gap-4 max-h-56 overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex gap-3 items-center text-xs">
                <img src={item.producto_imagen} alt={item.producto_nombre} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-200 block truncate">{item.producto_nombre}</span>
                  <span className="text-[10px] text-slate-500">Color: {item.color} | Cantidad: {item.cantidad}</span>
                </div>
                <span className="font-bold text-slate-300">${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coupons Form */}
        <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-3">
          <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-indigo-400" /> Aplicar Cupón de Promoción
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              disabled={!!appliedCoupon}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="EJ: CECYTEPROMO"
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            {appliedCoupon ? (
              <button 
                onClick={handleRemoveCoupon}
                className="px-3.5 py-2 bg-red-950/40 text-red-400 border border-red-900/40 rounded-xl text-xs font-bold"
              >
                Quitar
              </button>
            ) : (
              <button 
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Aplicar
              </button>
            )}
          </div>

          {couponError && <span className="text-[10px] text-red-400">{couponError}</span>}
          {appliedCoupon && (
            <span className="text-[10px] text-emerald-400 font-semibold">
              ✓ Cupón {appliedCoupon.codigo} activo ({appliedCoupon.tipo === 'porcentaje' ? `${appliedCoupon.valor}%` : `$${appliedCoupon.valor}`} de descuento)
            </span>
          )}
        </div>

        {/* Reward points redemption */}
        {currentUser && userPoints > 0 && (
          <div className="glass-panel rounded-3xl p-6 border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Tus Puntos de Recompensa</span>
                <span className="text-[10px] text-slate-500 block">Balance: {userPoints} Pts | Canje: ${pointsDiscountVal.toFixed(2)} MXN</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
            </label>
          </div>
        )}

        {/* Price Summary Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border-indigo-500/10 bg-slate-950/60 flex flex-col gap-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Subtotal del Carrito</span>
            <span className="text-slate-200">${rawSubtotal.toFixed(2)} MXN</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-400 font-semibold">
              <span>Descuento Cupón</span>
              <span>-${couponDiscount.toFixed(2)} MXN</span>
            </div>
          )}

          {pointsDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-400 font-semibold">
              <span>Canje de Recompensa</span>
              <span>-${pointsDiscount.toFixed(2)} MXN</span>
            </div>
          )}

          <div className="flex justify-between items-baseline border-t border-slate-900 pt-3">
            <span className="text-sm font-bold text-white">Importe Total</span>
            <span className="text-2xl font-black text-white">${finalTotal.toFixed(2)} MXN</span>
          </div>

          <div className="text-[10px] text-slate-500 text-center border-t border-slate-900 pt-2.5 mt-1">
            Esta compra te otorgará <span className="text-indigo-400 font-bold">+{pointsToEarn} puntos</span> para el programa de recompensas.
          </div>
        </div>

      </div>
    </div>
  );
};
