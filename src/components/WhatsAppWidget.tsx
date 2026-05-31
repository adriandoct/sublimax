import React, { useState } from 'react';
import { MessageSquare, X, Send, PhoneCall, HelpCircle, Package, FileText } from 'lucide-react';
import { Database } from '../services/database';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    { sender: 'bot', text: '¡Hola! Bienvenido a SUBLIMAX Studio. ¿Cómo puedo ayudarte hoy?', time: 'Justo ahora' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: textToSend, time: timeString };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI/Trigger response simulator
    setTimeout(() => {
      let botResponse = 'Disculpa, no entendí bien esa consulta. ¿Podrías intentar con otra frase o usar uno de los accesos rápidos?';
      const textLower = textToSend.toLowerCase();

      if (textLower.includes('hola') || textLower.includes('buenos dias')) {
        botResponse = '¡Hola de nuevo! Espero estés teniendo un excelente día. ¿Qué producto personalizado te interesa hoy?';
      } else if (textLower.includes('rastrear') || textLower.includes('sbx-') || textLower.includes('pedido') || textLower.includes('seguimiento')) {
        // Try to search for order code inside text
        const match = textToSend.match(/SBX-\d+/i);
        if (match) {
          const code = match[0].toUpperCase();
          const orders = Database.getOrders();
          const found = orders.find(o => o.codigo_seguimiento === code);
          if (found) {
            botResponse = `¡Pedido encontrado! El estado actual de tu orden ${code} es: "${found.estado.toUpperCase()}". Su total fue de $${found.total.toFixed(2)} MXN.`;
          } else {
            botResponse = `Lo siento, no encontré el código de rastreo ${code} en nuestro sistema de base de datos. Verifica que esté bien escrito (Ej: SBX-123456).`;
          }
        } else {
          botResponse = 'Para rastrear tu pedido, escribe tu código de seguimiento que empieza con SBX (Ej: "SBX-893045").';
        }
      } else if (textLower.includes('b2b') || textLower.includes('cotizar') || textLower.includes('mayoreo') || textLower.includes('corporativo')) {
        botResponse = 'Para cotizaciones de mayoreo (más de 50 piezas), puedes usar nuestra Tienda Corporativa B2B o platicar con un agente comercial en WhatsApp directo. ¡Ofrecemos descuentos de hasta el 25%!';
      } else if (textLower.includes('costo') || textLower.includes('precio') || textLower.includes('diseño')) {
        botResponse = 'El costo de sublimación depende del producto base (Tazas desde $120, Playeras $220). El agregar stickers, textos o imágenes tiene un valor adicional menor mostrado en tiempo real.';
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse, time: timeString }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickOption = (option: string) => {
    handleSendMessage(option);
  };

  // Open direct WhatsApp API link with custom message
  const redirectToWhatsApp = () => {
    const defaultText = encodeURIComponent('Hola SUBLIMAX Studio! Me gustaría cotizar unos productos personalizados.');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=521234567890&text=${defaultText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="glass-panel w-[330px] sm:w-[360px] h-[480px] rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-4 border-indigo-500/20 animate-fade-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                SX
              </div>
              <div>
                <h4 className="text-xs font-bold">Soporte SUBLIMAX</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                  <span className="text-[9px] text-emerald-100">En línea (Respuesta Inmediata)</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#070913] flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex flex-col max-w-[80%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div 
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-850'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="self-start bg-slate-900 border border-slate-850 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}
          </div>

          {/* Quick FAQ Access */}
          <div className="p-2 border-t border-slate-900 bg-slate-950/60 flex gap-2 overflow-x-auto select-none">
            <button 
              onClick={() => handleQuickOption('¿Cómo rastreo mi pedido?')}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-[10px] text-slate-400 font-medium"
            >
              <Package className="w-3 h-3 text-emerald-400" /> Rastrear Pedido
            </button>
            <button 
              onClick={() => handleQuickOption('Quiero cotizar un pedido masivo')}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-[10px] text-slate-400 font-medium"
            >
              <FileText className="w-3 h-3 text-cyan-400" /> Cotización Mayoreo
            </button>
            <button 
              onClick={() => handleQuickOption('¿Qué costo tiene el diseño personalizado?')}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-[10px] text-slate-400 font-medium"
            >
              <HelpCircle className="w-3 h-3 text-indigo-400" /> Costos de Diseño
            </button>
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-slate-950 border-t border-slate-900 flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button 
              onClick={() => handleSendMessage(inputText)}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
            <button 
              onClick={redirectToWhatsApp}
              className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition"
              title="Hablar directo en WhatsApp"
            >
              <PhoneCall className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-950/40 transition hover:scale-105"
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
      </button>

    </div>
  );
};
