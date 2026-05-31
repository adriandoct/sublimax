import React, { useState } from 'react';
import { FileText, Calculator, Upload, Check, Printer, FileDown, Star } from 'lucide-react';
import { Database, Producto } from '../services/database';

interface B2BPortalProps {
  products: Producto[];
}

export const B2BPortal: React.FC<B2BPortalProps> = ({ products }) => {
  // Calculator state
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(100);
  const [doubleSided, setDoubleSided] = useState(false);
  const [designComplexity, setDesignComplexity] = useState<'basic' | 'custom' | 'ai'>('basic');
  
  // Quote contact details
  const [companyName, setCompanyName] = useState('');
  const [rfc, setRfc] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [logoFile, setLogoFile] = useState<string | null>(null);

  // Quote status
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState('');

  // Math variables
  const product = products.find(p => p.id === selectedProductId) || products[0];
  const basePrice = product ? product.precio_base : 120;
  
  // Custom prints additional costs
  let customPrintCost = 0;
  if (doubleSided) customPrintCost += 15;
  if (designComplexity === 'custom') customPrintCost += 25;
  if (designComplexity === 'ai') customPrintCost += 10;

  const unitBasePrice = basePrice + customPrintCost;
  const rawSubtotal = unitBasePrice * quantity;

  // Discount matrix
  let discountPercent = 0;
  if (quantity >= 50 && quantity < 100) discountPercent = 10;
  else if (quantity >= 100 && quantity < 500) discountPercent = 15;
  else if (quantity >= 500) discountPercent = 25;

  const discountAmount = rawSubtotal * (discountPercent / 100);
  const subtotalAfterDiscount = rawSubtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * 0.16; // 16% IVA Mexican Tax
  const finalTotal = subtotalAfterDiscount + taxAmount;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setLogoFile(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteNumber(`QT-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Intro */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-2">Portal de Ventas Corporativas B2B</h1>
        <p className="text-slate-400 text-sm">
          Cotiza pedidos masivos para empresas, eventos, escuelas o equipos deportivos. Obtén descuentos por volumen, facturación fiscal inmediata y atención preferencial.
        </p>
      </div>

      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Calculator */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" /> Calculador de Descuentos
            </h2>

            <div className="flex flex-col gap-4">
              {/* Product selector */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Seleccionar Producto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (Base: ${p.precio_base.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              {/* Quantity input */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Cantidad Requerida</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                
                {/* Visual discount markers indicator */}
                <div className="flex justify-between text-[9px] text-slate-500 mt-2 px-1">
                  <span>&lt;50 Pzas: 0% desc</span>
                  <span className={quantity >= 50 && quantity < 100 ? 'text-indigo-400 font-semibold' : ''}>50+ Pzas: 10% desc</span>
                  <span className={quantity >= 100 && quantity < 500 ? 'text-indigo-400 font-semibold' : ''}>100+ Pzas: 15% desc</span>
                  <span className={quantity >= 500 ? 'text-indigo-400 font-semibold' : ''}>500+ Pzas: 25% desc</span>
                </div>
              </div>

              {/* Custom Options */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1.5">Complejidad Diseño</label>
                  <select
                    value={designComplexity}
                    onChange={(e) => setDesignComplexity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="basic">Logo Básico (Gratis)</option>
                    <option value="ai">Generado con IA (+$10/u)</option>
                    <option value="custom">Adaptación por Diseñador (+$25/u)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-4 select-none">
                    <input
                      type="checkbox"
                      checked={doubleSided}
                      onChange={(e) => setDoubleSided(e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-0 w-4 h-4 bg-slate-950"
                    />
                    <span className="text-xs text-slate-300 font-medium">Impresión Doble Cara (+$15/u)</span>
                  </label>
                </div>
              </div>

              {/* Logo Attach */}
              <div className="border-t border-slate-900 pt-4">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1.5">Cargar Logotipo Corporativo (Opcional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 p-2.5 rounded-xl cursor-pointer text-xs transition">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 font-medium">Cargar Archivo Vector/Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoFile && (
                    <div className="w-10 h-10 border border-slate-850 rounded-lg overflow-hidden flex items-center justify-center p-0.5 bg-slate-900">
                      <img src={logoFile} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 flex flex-col gap-2.5 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Precio Unitario Base</span>
                <span className="text-slate-200">${unitBasePrice.toFixed(2)} MXN</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Descuento ({discountPercent}%)</span>
                  <span className="text-emerald-400 font-semibold">-${discountAmount.toFixed(2)} MXN</span>
                </div>
              )}

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">IVA Trasladado (16%)</span>
                <span className="text-slate-200">${taxAmount.toFixed(2)} MXN</span>
              </div>

              <div className="flex justify-between items-baseline border-t border-slate-900 pt-2.5">
                <span className="text-sm font-bold text-white">Importe Total Estimado</span>
                <span className="text-xl font-extrabold text-white">${finalTotal.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Details */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6 border-b border-slate-900 pb-3">
              <FileText className="w-5 h-5 text-indigo-400" /> Solicitud de Cotización Formal
            </h2>

            <form onSubmit={handleSubmitQuote} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Nombre de la Empresa o Escuela</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej. Corporativo México S.A."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">RFC / Identificador Fiscal</label>
                <input
                  type="text"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value)}
                  placeholder="Opcional"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Nombre de Contacto</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ej. Ing. Juan Pérez"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Ej. compras@empresa.com"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Teléfono</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="10 dígitos"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Especificaciones Adicionales</label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Comenta aquí detalles sobre colores de base especiales, tallas variadas de playeras o fechas límite críticas..."
                  className="w-full h-20 bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="sm:col-span-2 mt-2 py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <FileDown className="w-4 h-4" /> Generar Documento de Cotización
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Print-ready Invoice/Quotation Template Render view
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="bg-emerald-950/40 border border-emerald-900 p-4 rounded-2xl text-emerald-400 text-xs flex items-center justify-between">
            <span>✓ Cotización generada con éxito. Listo para imprimir o descargar en PDF.</span>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="underline text-[10px] font-bold"
            >
              Nueva cotización
            </button>
          </div>

          {/* Quotation sheet wrapper */}
          <div id="print-quote-area" className="bg-white text-slate-950 p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col gap-6 print:p-0 print:border-none print:shadow-none">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div>
                <h1 className="text-xl font-black text-indigo-900 tracking-wider">SUBLIMAX STUDIO</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Personaliza tu imaginación</p>
                <p className="text-[9px] text-slate-400 mt-2">Calle Cecyte 123, CP 54000, México DF<br/>RFC: SUB160520AA1</p>
              </div>
              <div className="text-right">
                <h2 className="text-base font-bold text-slate-900">COTIZACIÓN MASIVA</h2>
                <span className="text-xs font-mono font-bold text-indigo-700 block mt-1">{quoteNumber}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Fecha: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Clients details */}
            <div className="grid grid-cols-2 gap-6 text-[10px] text-slate-600 bg-slate-50 p-4 rounded-2xl">
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wide">Para el Cliente</span>
                <strong className="text-slate-900 text-xs mt-0.5 block">{companyName}</strong>
                {rfc && <span className="block">RFC: {rfc}</span>}
                <span className="block">Atn: {contactName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wide">Contacto de Envío</span>
                <span className="block mt-0.5">{contactEmail}</span>
                <span className="block">Tel: {contactPhone}</span>
              </div>
            </div>

            {/* Logo attached display in printed quote */}
            {logoFile && (
              <div className="flex items-center gap-3 border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                <div className="w-12 h-12 border border-slate-200 rounded overflow-hidden flex items-center justify-center p-0.5 bg-white">
                  <img src={logoFile} alt="Attached Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-[9px] text-slate-500">
                  <span className="font-bold text-slate-700 block">Logotipo Corporativo Adjunto</span>
                  Archivo de imagen listo para calibración del plotter de sublimación.
                </div>
              </div>
            )}

            {/* Items details table */}
            <table className="w-full text-left text-[10px] border-collapse mt-4">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 uppercase font-bold text-[8px] tracking-wider">
                  <th className="py-2.5">Descripción Concepto</th>
                  <th className="py-2.5 text-center">Cantidad</th>
                  <th className="py-2.5 text-right">Precio Unit.</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3">
                    <strong className="text-slate-900 block">{product.nombre}</strong>
                    <span className="text-slate-400 text-[9px] block">
                      Variante Sublimada - Complejidad de diseño: {designComplexity.toUpperCase()} {doubleSided ? '+ Impresión Doble Cara' : ''}
                    </span>
                  </td>
                  <td className="py-3 text-center font-bold text-slate-800">{quantity} Pzs</td>
                  <td className="py-3 text-right text-slate-700">${unitBasePrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-bold text-slate-900">${rawSubtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals column */}
            <div className="flex justify-end mt-4">
              <div className="w-64 bg-slate-50 p-4 rounded-2xl flex flex-col gap-2 text-[10px] text-slate-600">
                <div className="flex justify-between">
                  <span>Importe Neto</span>
                  <span>${rawSubtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Descuento Volumen ({discountPercent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotalAfterDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA Trasladado (16%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-slate-200 pt-2 font-black text-slate-900 text-sm">
                  <span>Total Neto</span>
                  <span className="text-indigo-900">${finalTotal.toFixed(2)} MXN</span>
                </div>
              </div>
            </div>

            {/* Legal terms footer */}
            <div className="border-t border-slate-100 pt-4 text-[8px] text-slate-400 leading-normal">
              <p className="font-semibold text-slate-500 mb-1">Términos y Condiciones:</p>
              <ul className="list-disc pl-3 flex flex-col gap-0.5">
                <li>Esta cotización tiene una vigencia legal de 30 días a partir de su emisión.</li>
                <li>Los tiempos de entrega inician a partir del pago del 50% de anticipo y aprobación de muestras virtuales.</li>
                <li>Precios calculados en moneda nacional (MXN). Incluyen impuesto al valor agregado (IVA).</li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Imprimir / Guardar PDF (Ctrl+P)
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="flex-1 py-4 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-2xl font-bold text-xs flex items-center justify-center transition"
            >
              Regresar al Portal B2B
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
