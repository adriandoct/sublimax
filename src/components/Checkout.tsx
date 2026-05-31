import React, { useState } from 'react';
import { Database, CartItem, Cupon, Pedido } from '../services/database';
import { CreditCard, ShieldCheck, Ticket, Award, RefreshCw, CheckCircle, Printer, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutProps {
  cart: CartItem[];
  currentUser: any;
  onOrderPlaced: () => void;
  onClearCart: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cart, currentUser, onOrderPlaced, onClearCart }) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'mercadopago' | 'oxxo'>('stripe');
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Cupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Reward points states
  const [usePoints, setUsePoints] = useState(false);
  const userPoints = currentUser ? Database.getTotalPoints(currentUser.id) : 0;
  // Let 10 points = $1 MXN discount
  const pointsDiscountVal = Math.min(userPoints * 0.1, cart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0) * 0.5); // cap at 50% of subtotal

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardFocused, setCardFocused] = useState<'front' | 'back'>('front');

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
    }, 2000);
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

        {paymentMethod === 'oxxo' && (
          /* OXXO Barcode Pay Slip Display */
          <div className="w-full bg-white text-slate-950 p-6 rounded-2xl border border-slate-200 text-center flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-red-600 font-extrabold text-lg tracking-widest">OXXO PAY</span>
              <span className="text-[10px] text-slate-400">Ficha digital de pago</span>
            </div>
            
            <div className="flex flex-col items-center">
              {/* Fake barcode block */}
              <div className="h-10 w-48 bg-slate-950 flex gap-1 p-1">
                {[2,4,1,3,1,4,2,3,1,4,2,3,1,4,1,2,3,1,4].map((width, i) => (
                  <div key={i} className="bg-white h-full" style={{ flexGrow: width }} />
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 mt-2">0000 1234 5678 9012</span>
            </div>

            <div className="text-[10px] text-slate-500">
              Paga en caja en cualquier sucursal OXXO. La acreditación es inmediata.
            </div>
            <button 
              onClick={() => window.print()}
              className="py-2 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 mx-auto"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Ficha
            </button>
          </div>
        )}

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
        
        {/* Payment selector */}
        <div className="glass-panel rounded-3xl p-6 border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Elige tu método de pago</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'stripe', name: 'Stripe', logo: '💳' },
              { id: 'mercadopago', name: 'Mercado Pago', logo: '💙' },
              { id: 'paypal', name: 'PayPal', logo: '🅿️' },
              { id: 'oxxo', name: 'OXXO Pay', logo: '🏪' },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`py-3.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition ${
                  paymentMethod === method.id 
                    ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200' 
                    : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <span className="text-xl">{method.logo}</span>
                <span>{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Credit Card (Stripe Mode) Form with flip effect */}
        {paymentMethod === 'stripe' && (
          <form onSubmit={handlePay} className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-6">
            
            {/* Interactive Card Graphic */}
            <div className="w-full max-w-[340px] h-[190px] mx-auto perspective relative">
              <div 
                className={`w-full h-full duration-700 preserve-3d relative ${
                  cardFocused === 'back' ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-700 p-5 text-white flex flex-col justify-between backface-hidden shadow-xl">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">SUBLIMAX Studio Card</span>
                    <span className="text-xl font-bold">VISA</span>
                  </div>
                  <div className="font-mono text-base tracking-widest py-2">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-[8px] text-indigo-200 uppercase block">Propietario</span>
                      <span className="font-semibold uppercase truncate max-w-[150px] block">{cardName || 'Nombre Completo'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-indigo-200 uppercase block">Expira</span>
                      <span className="font-semibold">{cardExpiry || 'MM/AA'}</span>
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute w-full h-full rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-950 text-white flex flex-col justify-between rotate-y-180 backface-hidden shadow-xl">
                  <div className="w-full h-8 bg-slate-900 mt-4" />
                  <div className="px-5 pb-5 text-right">
                    <span className="text-[8px] text-indigo-200 uppercase block mb-1">CVV</span>
                    <span className="bg-white text-slate-950 font-mono px-3 py-1 rounded font-bold text-xs inline-block">
                      {cardCvv || '•••'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Número de Tarjeta</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onFocus={() => setCardFocused('front')}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  placeholder="4000 1234 5678 9010"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Nombre Impreso en Tarjeta</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onFocus={() => setCardFocused('front')}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="JUAN PEREZ GARCIA"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Vencimiento</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={cardExpiry}
                  onFocus={() => setCardFocused('front')}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/AA"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Cód. Seguridad (CVV)</label>
                <input
                  type="password"
                  required
                  maxLength={3}
                  value={cardCvv}
                  onFocus={() => setCardFocused('back')}
                  onBlur={() => setCardFocused('front')}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="123"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition mt-2"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Pagar con Tarjeta via Stripe
            </button>
          </form>
        )}

        {/* Mercado Pago, PayPal, or OXXO Simulation screens */}
        {paymentMethod !== 'stripe' && (
          <div className="glass-panel rounded-3xl p-8 border-slate-800 text-center flex flex-col items-center justify-center min-h-[300px] gap-4">
            {paymentMethod === 'paypal' && (
              <>
                <span className="text-4xl">🅿️</span>
                <h4 className="text-sm font-bold text-white">Simulador de Transacción PayPal</h4>
                <p className="text-slate-400 text-xs max-w-xs">
                  Al hacer clic se abrirá una pasarela de pago virtual para confirmar los fondos de tu saldo PayPal.
                </p>
              </>
            )}
            {paymentMethod === 'mercadopago' && (
              <>
                <span className="text-4xl">💙</span>
                <h4 className="text-sm font-bold text-white">Integración Mercado Pago Developers</h4>
                <p className="text-slate-400 text-xs max-w-xs">
                  Procesa de forma inmediata con tarjetas de débito o dinero en cuenta Mercado Pago.
                </p>
              </>
            )}
            {paymentMethod === 'oxxo' && (
              <>
                <span className="text-4xl">🏪</span>
                <h4 className="text-sm font-bold text-white">Ficha de Depósito OXXO Pay</h4>
                <p className="text-slate-400 text-xs max-w-xs">
                  Generaremos un código de barras. Podrás acudir a caja en tu OXXO más cercano para abonar en efectivo.
                </p>
              </>
            )}

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition mt-4"
            >
              {isProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
              Procesar Orden de Compra <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

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
