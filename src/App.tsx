import React, { useState, useEffect } from 'react';
import { Database, Producto, Categoria, CartItem, Usuario, Pedido } from './services/database';
import { ThreeDesigner } from './components/ThreeDesigner';
import { AIDesigner } from './components/AIDesigner';
import { AdminDashboard } from './components/AdminDashboard';
import { DesignerMarketplace } from './components/DesignerMarketplace';
import { B2BPortal } from './components/B2BPortal';
import { Checkout } from './components/Checkout';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { ARPreview } from './components/ARPreview';
import { 
  Sparkles, ShoppingCart, User, LogOut, Package, Star, 
  Layers, Gift, Send, Briefcase, FileText, ChevronRight, X, Info
} from 'lucide-react';

export default function App() {
  // Navigation & Routing state
  const [activeTab, setActiveTab] = useState<'catalog' | 'designer' | 'b2b' | 'marketplace' | 'rewards' | 'admin'>('catalog');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  // App Database States
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  
  // Catalog filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(300);
  const [activeEventFilter, setActiveEventFilter] = useState<string>('all');

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showArPreview, setShowArPreview] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Initial Seed & Load
  useEffect(() => {
    Database.initialize();
    setProducts(Database.getProducts());
    setCategories(Database.getCategories());
    setCart(Database.getCart());
    setCurrentUser(Database.getActiveUser());
  }, []);

  const handleRefreshUser = () => {
    setCurrentUser(Database.getActiveUser());
  };

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const user = Database.login(loginEmail, loginPassword);
    if (user) {
      setCurrentUser(user);
      setLoginEmail('');
      setLoginPassword('');
      if (user.role === 'admin') setActiveTab('admin');
    } else {
      setAuthError('Credenciales inválidas para administrador o error en el sistema.');
    }
  };

  const handleLogout = () => {
    Database.logout();
    setCurrentUser(null);
    setActiveTab('catalog');
  };

  const autoLoginAdmin = () => {
    const user = Database.login('admin@admin.com', '12345678Cecyte');
    if (user) {
      setCurrentUser(user);
      setActiveTab('admin');
    }
  };

  // --- Cart Handlers ---
  const handleAddToCart = (item: CartItem) => {
    Database.addToCart(item);
    setCart(Database.getCart());
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (itemId: string) => {
    const updated = cart.filter(item => item.id !== itemId);
    Database.saveCart(updated);
    setCart(updated);
  };

  const handleUpdateCartQuantity = (itemId: string, qty: number) => {
    const updated = cart.map(item => {
      if (item.id === itemId) {
        return { ...item, cantidad: Math.max(1, item.cantidad + qty) };
      }
      return item;
    });
    Database.saveCart(updated);
    setCart(updated);
  };

  const clearCart = () => {
    Database.saveCart([]);
    setCart([]);
  };

  // --- Social points reward actions ---
  const handleClaimSocialPoints = (type: 'social' | 'referido', pts: number, desc: string) => {
    if (!currentUser) return;
    Database.addPoints(currentUser.id, pts, type, desc);
    handleRefreshUser();
    alert(`¡Felicidades! Has acumulado +${pts} Puntos en tu monedero.`);
  };

  // --- Filtering Logic ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCatId === 'all' || p.categoria_id === selectedCatId;
    const matchesPrice = p.precio_base <= priceRange;
    
    // Simulate event matching
    let matchesEvent = true;
    if (activeEventFilter !== 'all') {
      if (activeEventFilter === 'maestro' && !p.nombre.toLowerCase().includes('taza')) matchesEvent = false;
      if (activeEventFilter === 'bodas' && !p.nombre.toLowerCase().includes('cojín') && !p.nombre.toLowerCase().includes('termo')) matchesEvent = false;
      if (activeEventFilter === 'graduaciones' && !p.nombre.toLowerCase().includes('taza') && !p.nombre.toLowerCase().includes('playera')) matchesEvent = false;
      if (activeEventFilter === 'deportes' && !p.nombre.toLowerCase().includes('termo') && !p.nombre.toLowerCase().includes('mouse')) matchesEvent = false;
    }

    return matchesSearch && matchesCat && matchesPrice && matchesEvent;
  });

  const activeProductForAR = selectedProducto;

  return (
    <div className="min-h-screen bg-[#05060e] text-[#f3f4f6] relative grid-bg">
      {/* Background Ambient Glows */}
      <div className="mesh-glow w-[500px] h-[500px] bg-indigo-900/30 -top-40 -left-40"></div>
      <div className="mesh-glow w-[500px] h-[500px] bg-purple-900/20 top-1/2 -right-40"></div>

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-900 px-4 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
        {/* Brand */}
        <div 
          onClick={() => { setSelectedProducto(null); setActiveTab('catalog'); }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-950/50 group-hover:scale-105 transition duration-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-none tracking-wider">SUBLIMAX <span className="text-indigo-400">STUDIO</span></h1>
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mt-0.5">Personaliza tu imaginación</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-900">
          <button 
            onClick={() => { setSelectedProducto(null); setActiveTab('catalog'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'catalog' && !selectedProducto 
                ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-200' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Catálogo
          </button>
          
          {selectedProducto && currentUser?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('designer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'designer' 
                  ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-200' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Diseñador 3D
            </button>
          )}

          <button 
            onClick={() => { setSelectedProducto(null); setActiveTab('b2b'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'b2b' 
                ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-200' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Corporativo B2B
          </button>
          <button 
            onClick={() => { setSelectedProducto(null); setActiveTab('marketplace'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'marketplace' 
                ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-200' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Creadores
          </button>
          <button 
            onClick={() => { setSelectedProducto(null); setActiveTab('rewards'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'rewards' 
                ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-200' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-indigo-400" /> Recompensas
          </button>
          
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => { setSelectedProducto(null); setActiveTab('admin'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'admin' 
                  ? 'bg-red-950/40 border border-red-900/40 text-red-400 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Panel
            </button>
          )}
        </nav>

        {/* User profile & Cart Actions */}
        <div className="flex items-center gap-3">
          
          {/* User auth details */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-2xl border border-slate-900">
              <img src={currentUser.avatar_url} alt={currentUser.nombre} className="w-6 h-6 rounded-full border border-slate-800" />
              <div className="hidden sm:block text-left">
                <span className="text-[10px] text-slate-300 font-bold block truncate max-w-[80px]">{currentUser.nombre}</span>
                <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">{currentUser.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1 hover:bg-slate-900 rounded text-slate-400 ml-1"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={autoLoginAdmin}
                className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-xl text-[10px] font-bold"
              >
                Prueba Admin
              </button>
              
              {/* Quick Login Form inline */}
              <form onSubmit={handleLogin} className="hidden sm:flex gap-1.5 items-center">
                <input
                  type="email"
                  required
                  placeholder="admin@admin.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-900 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none w-28"
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-slate-950 border border-slate-900 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none w-20"
                />
                <button 
                  type="submit"
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Cart Icon trigger */}
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2.5 bg-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/50 text-indigo-400 rounded-2xl transition"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cart.reduce((sum, item) => sum + item.cantidad, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-12">
        
        {/* PARALLAX HERO - SUBLIMATION PROCESS SIMULATOR (Only show on main landing catalog page) */}
        {activeTab === 'catalog' && !selectedProducto && (
          <div className="relative glass-panel rounded-3xl p-8 lg:p-12 border-indigo-500/10 overflow-hidden flex flex-col lg:flex-row items-center gap-8 min-h-[420px]">
            
            {/* Parallax elements */}
            <div className="lg:w-7/12 flex flex-col gap-6 text-left z-10">
              <span className="bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full self-start">
                Estudio Creativo Digital
              </span>
              <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">
                Imprime tu Imaginación en <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-cyan-400">Tazas, Playeras y Más</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Genera tus propios artes conceptuales con Inteligencia Artificial, explora nuestro amplio catálogo y recibe impresiones de sublimación ultra vibrantes.
              </p>
              
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => {
                    const catalogEl = document.getElementById('catalog-section');
                    if (catalogEl) {
                      catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-indigo-950/40"
                >
                  Explorar Catálogo
                </button>
                <button 
                  onClick={() => setActiveTab('b2b')}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-2xl text-xs transition"
                >
                  Mayoreo Empresas B2B
                </button>
              </div>
            </div>

            {/* Heat Press Machine Simulator Graphics */}
            <div className="lg:w-5/12 flex justify-center items-center relative w-full h-[260px]">
              {/* Heat Press Stand */}
              <div className="absolute w-64 h-36 border-4 border-slate-800 rounded-2xl bottom-4 bg-slate-900/90 shadow-xl flex items-center justify-center overflow-hidden">
                
                {/* The mug revealing custom sublimation design */}
                <div className="relative w-20 h-24 bg-white border border-slate-300 rounded-lg flex flex-col justify-center items-center shadow-lg">
                  {/* Handle */}
                  <div className="absolute -left-3 w-4 h-12 border-2 border-slate-300 rounded-l-lg bg-white" />
                  
                  {/* Sublimation Design Reveal Mask */}
                  <div className="w-14 h-18 rounded bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-reveal-design opacity-80 flex items-center justify-center text-[8px] font-black text-white p-1 text-center leading-none">
                    MOCK DESIGN
                  </div>
                </div>

                {/* Steam Rising Particles */}
                <div className="absolute top-2 w-2 h-8 bg-white/20 rounded-full blur-sm animate-steam" />
                <div className="absolute top-4 left-20 w-3 h-10 bg-white/20 rounded-full blur-sm animate-steam" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1 right-20 w-1.5 h-6 bg-white/20 rounded-full blur-sm animate-steam" style={{ animationDelay: '1s' }} />
              </div>

              {/* Heat Press Platen Arm */}
              <div className="absolute w-56 h-10 bg-indigo-950 border-2 border-indigo-700/80 rounded-xl top-6 animate-heat-press flex items-center justify-center shadow-lg">
                <span className="text-[8px] text-indigo-400 font-mono tracking-widest font-bold">200°C CALENTANDO</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB CONTENTS ROUTER */}

        {/* TAB 1: CATALOG GRID */}
        {activeTab === 'catalog' && !selectedProducto && (
          <div id="catalog-section" className="flex flex-col gap-8">
            
            {/* Categories & Filter Bar */}
            <div className="flex flex-col gap-5 bg-slate-950/40 p-5 rounded-3xl border border-slate-900">
              
              {/* Category tags */}
              <div className="flex gap-2.5 overflow-x-auto pb-1 select-none">
                <button
                  onClick={() => setSelectedCatId('all')}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-bold border transition flex-shrink-0 ${
                    selectedCatId === 'all' 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  Todos los Productos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs font-bold border transition flex-shrink-0 ${
                      selectedCatId === cat.id 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>

              {/* Advanced search & Range slider */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-t border-slate-900 pt-4">
                
                {/* Search query */}
                <div className="md:col-span-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos (Ej. Taza Mágica, Playera)..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {/* Price range slider */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex-shrink-0">Precio Máx:</span>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-white">${priceRange} MXN</span>
                </div>

                {/* Event Store Filter Tag */}
                <div className="md:col-span-4 flex items-center gap-2 overflow-x-auto select-none">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex-shrink-0">Eventos:</span>
                  {[
                    { id: 'all', label: 'Cualquiera' },
                    { id: 'maestro', label: 'Día del Maestro' },
                    { id: 'graduaciones', label: 'Graduaciones' },
                    { id: 'bodas', label: 'Bodas' },
                    { id: 'deportes', label: 'Deportes' }
                  ].map(evt => (
                    <button
                      key={evt.id}
                      onClick={() => setActiveEventFilter(evt.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition flex-shrink-0 ${
                        activeEventFilter === evt.id 
                          ? 'bg-indigo-900/60 border-indigo-500 text-indigo-300' 
                          : 'bg-slate-900/30 border-slate-850 text-slate-400'
                      }`}
                    >
                      {evt.label}
                    </button>
                  ))}
                </div>

              </div>

            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(prod => (
                  <div key={prod.id} className="glass-panel rounded-3xl p-4 border-slate-850 hover:border-indigo-500/30 hover:scale-[1.01] transition duration-300 flex flex-col justify-between gap-4 group">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      
                      {/* Popularity Badge */}
                      <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold text-amber-400 flex items-center gap-0.5 border border-slate-850">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {prod.popularidad}.0
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-bold text-white leading-snug truncate">{prod.nombre}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 min-h-8">{prod.descripcion}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Desde</span>
                        <span className="text-base font-extrabold text-white">${prod.precio_base.toFixed(2)}</span>
                      </div>
                      
                      {currentUser?.role === 'admin' ? (
                        <button
                          onClick={() => {
                            setSelectedProducto(prod);
                            setActiveTab('designer');
                          }}
                          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-950/50"
                        >
                          Personalizar 3D
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleAddToCart({
                              id: `cart-${Date.now()}-${prod.id}`,
                              producto_id: prod.id,
                              producto_nombre: prod.nombre,
                              producto_imagen: prod.imagen_url,
                              tipo_3d: prod.tipo_3d,
                              precio_unitario: prod.precio_base,
                              cantidad: 1,
                              color: '#ffffff'
                            });
                          }}
                          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-950/50"
                        >
                          Agregar al Carrito
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs">
                  Ningún producto coincide con los filtros aplicados.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE 3D DESIGNER & AI STUDIO */}
        {activeTab === 'designer' && selectedProducto && currentUser?.role === 'admin' && (
          <div className="flex flex-col gap-8">
            {/* Editor Top Navigation */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedProducto(null); setActiveTab('catalog'); }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 font-semibold"
                >
                  ← Catálogo
                </button>
                <div>
                  <h2 className="text-base font-bold text-white">Estudio de Personalización 3D</h2>
                  <p className="text-slate-500 text-[10px]">Utiliza el panel 3D interactivo y las herramientas de Inteligencia Artificial.</p>
                </div>
              </div>
              
              {/* Augmented reality preview trigger */}
              <button
                onClick={() => setShowArPreview(true)}
                className="py-2.5 px-4.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-950/40"
              >
                Ver en Realidad Aumentada (AR)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (takes 8 cols) - 3D Editor Canvas */}
              <div className="lg:col-span-8">
                <ThreeDesigner 
                  producto={selectedProducto} 
                  currentUser={currentUser}
                  onAddToCart={handleAddToCart}
                />
              </div>

              {/* Right Column (takes 4 cols) - AI Generator panel */}
              <div className="lg:col-span-4">
                <AIDesigner 
                  onSelectDesign={(url) => {
                    // Update uploader image state inside ThreeDesigner by sending image url
                    // We'll update the active image uploader inside ThreeDesigner
                    // Simply trigger a CustomEvent that the designer component listens to
                    // This is a neat React communication pattern for nested instances
                    const event = new CustomEvent('sublimaxApplyAIDesign', { detail: url });
                    window.dispatchEvent(event);
                  }}
                />
              </div>
            </div>

            {/* Script receiver helper to connect AIDesigner applied design directly to ThreeDesigner */}
            <ARDesignEventConnector />
          </div>
        )}

        {/* TAB 3: B2B CORPORATE PORTAL */}
        {activeTab === 'b2b' && (
          <B2BPortal products={products} />
        )}

        {/* TAB 4: CREATOR MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <DesignerMarketplace currentUser={currentUser} onRefreshUser={handleRefreshUser} />
        )}

        {/* TAB 5: REWARDS WALLET PAGE */}
        {activeTab === 'rewards' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-white mb-1.5">Monedero de Recompensas SUBLIMAX</h1>
              <p className="text-slate-400 text-xs">Acumula puntos en cada compra y canjéalos por descuentos inmediatos en checkout</p>
            </div>

            {currentUser ? (
              <div className="flex flex-col gap-6">
                
                {/* Wallet Balance Board */}
                <div className="glass-panel rounded-3xl p-6 border-indigo-500/20 text-center flex flex-col items-center justify-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Balance de Puntos</span>
                  <div className="text-5xl font-black text-white tracking-tight flex items-baseline gap-1 mt-1">
                    <span>{Database.getTotalPoints(currentUser.id)}</span>
                    <span className="text-lg text-indigo-400 font-bold">PTS</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold mt-1">
                    Equivalente a: ${(Database.getTotalPoints(currentUser.id) * 0.1).toFixed(2)} MXN de saldo
                  </span>
                </div>

                {/* Point accumulation missions */}
                <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Acumular Más Puntos</h3>
                  
                  <div className="flex flex-col gap-3">
                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-200 block">Invitar Amigos y Referidos</strong>
                        <span className="text-slate-500 text-[10px]">Tus referidos se registran con tu enlace corporativo</span>
                      </div>
                      <button
                        onClick={() => handleClaimSocialPoints('referido', 100, 'Recompensa por amigo referido')}
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                      >
                        +100 PTS
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-200 block">Compartir Diseños en Redes Sociales</strong>
                        <span className="text-slate-500 text-[10px]">Comparte tus visualizaciones 3D en Facebook o Instagram</span>
                      </div>
                      <button
                        onClick={() => handleClaimSocialPoints('social', 50, 'Compartir modelo 3D en redes')}
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                      >
                        +50 PTS
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wallet Statement ledger */}
                <div className="glass-panel rounded-3xl p-6 border-slate-800 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Historial de Monedero</h3>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                    {Database.getPointsLedger(currentUser.id).length > 0 ? (
                      Database.getPointsLedger(currentUser.id).map(record => (
                        <div key={record.id} className="flex justify-between items-center text-xs py-2 border-b border-slate-900/50">
                          <div>
                            <span className="text-slate-200 font-semibold block">{record.descripcion}</span>
                            <span className="text-[9px] text-slate-500 block">{record.fecha}</span>
                          </div>
                          <span className={`font-bold ${record.puntos > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {record.puntos > 0 ? `+${record.puntos}` : record.puntos} PTS
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-[11px]">
                        No hay movimientos de puntos registrados todavía.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-8 text-center border-slate-800">
                <Info className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-xs mb-4">Inicia sesión con tu cuenta para visualizar tus puntos y redimir premios.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ADMINISTRATIVE PANEL */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboard currentUser={currentUser} />
        )}

      </main>

      {/* WHATSAPP SUPPORT CHAT WIDGET */}
      <WhatsAppWidget />

      {/* AR MODAL WINDOW */}
      {showArPreview && activeProductForAR && (
        <ARPreview 
          productoNombre={activeProductForAR.nombre}
          tipo3d={activeProductForAR.tipo_3d}
          canvasTextureSrc={
            // Extract visual representation from current texture canvas in DOM
            (document.querySelector('.hidden') as HTMLCanvasElement)?.toDataURL() || ''
          }
          baseColor={
            // Match base color parameter
            '#ffffff'
          }
          onClose={() => {
            setShowArPreview(false);
            stopWebcamInApp();
          }}
        />
      )}

      {/* SHOPPING CART DRAWER PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay mask */}
          <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-[#070914] border-l border-slate-900 text-slate-100 flex flex-col justify-between">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/60">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-400" /> Carrito de Compras
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-slate-900 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items Panel */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {!isCheckoutOpen ? (
                  cart.length > 0 ? (
                    cart.map(item => (
                      <div key={item.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex gap-3 text-xs justify-between items-center relative">
                        <img src={item.producto_imagen} alt={item.producto_nombre} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <strong className="text-slate-200 block truncate">{item.producto_nombre}</strong>
                          <span className="text-[10px] text-indigo-400 font-semibold block capitalize">Base: {item.color}</span>
                          
                          {/* Customizations summary tags */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.diseño_personalizado?.text && (
                              <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                T: "{item.diseño_personalizado.text}"
                              </span>
                            )}
                            {item.diseño_personalizado?.image && (
                              <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                ✓ Logo/Img
                              </span>
                            )}
                            {item.diseño_personalizado?.stickers && item.diseño_personalizado.stickers.length > 0 && (
                              <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                {item.diseño_personalizado.stickers.length} stickers
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Adjust quantities */}
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-bold text-white">${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                          <div className="flex items-center border border-slate-900 rounded bg-slate-950">
                            <button onClick={() => handleUpdateCartQuantity(item.id, -1)} className="px-1.5 py-0.5 text-slate-400">-</button>
                            <span className="px-2 text-[10px] font-bold text-slate-200">{item.cantidad}</span>
                            <button onClick={() => handleUpdateCartQuantity(item.id, 1)} className="px-1.5 py-0.5 text-slate-400">+</button>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button 
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="absolute -top-1 -right-1 bg-red-950/60 border border-red-900/40 text-red-400 hover:text-red-300 w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-500 text-xs">
                      Tu carrito de compras está vacío.
                    </div>
                  )
                ) : (
                  /* Slide Checkout Integration */
                  <Checkout 
                    cart={cart}
                    currentUser={currentUser}
                    onClearCart={clearCart}
                    onOrderPlaced={() => {
                      setIsCheckoutOpen(false);
                      setIsCartOpen(true); // open popup invoice window inside cart drawer
                    }}
                  />
                )}
              </div>

              {/* Checkout Panel Footer */}
              {cart.length > 0 && !isCheckoutOpen && (
                <div className="p-6 bg-slate-950 border-t border-slate-900 flex flex-col gap-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Total Neto Estimado:</span>
                    <span className="text-xl font-extrabold text-white">
                      ${cart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0).toFixed(2)} MXN
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        alert("Inicia sesión o regístrate para proceder con el pago.");
                        return;
                      }
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-950/40"
                  >
                    Proceder al Pago Segura <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {isCheckoutOpen && (
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-full py-2.5 text-center text-xs text-slate-500 underline font-semibold"
                    >
                      Volver a la edición del carrito
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* FOOTER STATS */}
      <footer className="border-t border-slate-900/60 bg-slate-950/20 py-8 text-center text-xs text-slate-600 flex flex-col gap-2 mt-12">
        <p>© 2026 SUBLIMAX Studio - Personaliza tu imaginación. Todos los derechos reservados.</p>
        <p className="text-[10px] text-slate-700">Next.js 15 + React + TypeScript + Three.js + Supabase client simulator.</p>
      </footer>
    </div>
  );
}

// AR and Event connection components
function ARDesignEventConnector() {
  useEffect(() => {
    // Listens to design apply events and simulates direct uploader triggers
    const handleEvent = (e: Event) => {
      const url = (e as CustomEvent).detail;
      // Triggers change inside ThreeDesigner canvas
      // Simulating clicking file selector input inside ThreeDesigner
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        // Build simulated File transfer
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "ai_design.png", { type: "image/png" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            
            // Dispatch change event
            const changeEvent = new Event('change', { bubbles: true });
            input.dispatchEvent(changeEvent);
          });
      }
    };

    window.addEventListener('sublimaxApplyAIDesign', handleEvent);
    return () => window.removeEventListener('sublimaxApplyAIDesign', handleEvent);
  }, []);
  
  return null;
}

function stopWebcamInApp() {
  const vids = document.querySelectorAll('video');
  vids.forEach(v => {
    if (v.srcObject) {
      const s = v.srcObject as MediaStream;
      s.getTracks().forEach(t => t.stop());
    }
  });
}
