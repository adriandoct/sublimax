import React, { useState, useEffect } from 'react';
import { Database, Producto, Pedido, Cupon, Diseño, Categoria } from '../services/database';
import { Plus, Edit, Package, Check, X, ShieldAlert, BarChart3, Tag, ShoppingBag, Award, Users } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'inventory' | 'orders' | 'coupons' | 'designs'>('metrics');
  
  // States loaded from database
  const [products, setProducts] = useState<Producto[]>([]);
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [coupons, setCoupons] = useState<Cupon[]>([]);
  const [designs, setDesigns] = useState<Diseño[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);

  // Inventory forms states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(100);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdType, setNewProdType] = useState<Producto['tipo_3d']>('taza');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop');

  // Coupon form states
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCupCode, setNewCupCode] = useState('');
  const [newCupType, setNewCupType] = useState<'porcentaje' | 'fijo'>('porcentaje');
  const [newCupValue, setNewCupValue] = useState(10);
  const [newCupLimit, setNewCupLimit] = useState(100);

  // Load database tables
  const loadData = () => {
    setProducts(Database.getProducts());
    setOrders(Database.getOrders());
    setCoupons(Database.getCoupons());
    setDesigns(Database.getDesigns());
    setCategories(Database.getCategories());
  };

  useEffect(() => {
    loadData();
    // Set default category id if categories exist
    const cats = Database.getCategories();
    if (cats.length > 0) setNewProdCat(cats[0].id);
  }, []);

  // Guard access
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center max-w-md mx-auto my-12 border-red-500/20">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
        <p className="text-slate-400 text-sm">
          Este panel es de uso administrativo exclusivo. Por favor inicia sesión con la cuenta de administrador autorizada.
        </p>
      </div>
    );
  }

  // --- Handlers ---
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Producto = {
      id: `prod-${Date.now()}`,
      nombre: newProdName,
      descripcion: newProdDesc,
      precio_base: Number(newProdPrice),
      categoria_id: newProdCat,
      imagen_url: newProdImg,
      stock: Number(newProdStock),
      tipo_3d: newProdType,
      popularidad: 3,
      fecha_creacion: new Date().toISOString().split('T')[0]
    };

    const currentProds = Database.getProducts();
    currentProds.unshift(newProduct);
    Database.saveProducts(currentProds);
    
    // Reset form
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice(100);
    setNewProdStock(50);
    setIsAddingProduct(false);
    loadData();
  };

  const handleUpdateStock = (prodId: string, amt: number) => {
    const currentProds = Database.getProducts();
    const idx = currentProds.findIndex(p => p.id === prodId);
    if (idx > -1) {
      currentProds[idx].stock = Math.max(0, currentProds[idx].stock + amt);
      Database.saveProducts(currentProds);
      loadData();
    }
  };

  const handleOrderStatusUpdate = (orderId: string, state: Pedido['estado']) => {
    Database.updateOrderEstado(orderId, state);
    loadData();
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCupCode.trim()) return;

    Database.createCoupon({
      codigo: newCupCode.trim().toUpperCase(),
      tipo: newCupType,
      valor: Number(newCupValue),
      limite_usos: Number(newCupLimit),
      activo: true
    });

    setNewCupCode('');
    setIsAddingCoupon(false);
    loadData();
  };

  const handleApproveDesign = (designId: string) => {
    Database.approveDesign(designId);
    loadData();
  };

  // --- Metrics Aggregations ---
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const popularProductMap: { [key: string]: number } = {};
  orders.forEach(o => {
    o.items.forEach(it => {
      popularProductMap[it.producto_nombre] = (popularProductMap[it.producto_nombre] || 0) + it.cantidad;
    });
  });
  const bestSellers = Object.entries(popularProductMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Panel de Control</span>
          <h1 className="text-2xl font-bold text-white">SUBLIMAX Studio Admin</h1>
          <p className="text-slate-400 text-xs mt-0.5">Métricas de negocio, control de inventario y pedidos en tiempo real</p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'metrics', label: 'Dashboard', icon: BarChart3 },
            { id: 'inventory', label: 'Inventario', icon: Package },
            { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
            { id: 'coupons', label: 'Cupones', icon: Tag },
            { id: 'designs', label: 'Aprobaciones', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="min-height-[500px]">
        
        {/* TAB 1: METRICS */}
        {activeTab === 'metrics' && (
          <div className="flex flex-col gap-6">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel rounded-2xl p-5 border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-xs">Ventas Totales</span>
                  <span className="text-2xl font-extrabold text-white block mt-1">${totalSales.toFixed(2)}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">↑ 12.4% este mes</span>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-xs">Órdenes Procesadas</span>
                  <span className="text-2xl font-extrabold text-white block mt-1">{totalOrders}</span>
                  <span className="text-[10px] text-indigo-400 font-medium">{orders.filter(o => o.estado === 'Pendiente').length} pendientes</span>
                </div>
                <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-xs">Productos en Catálogo</span>
                  <span className="text-2xl font-extrabold text-white block mt-1">{products.length}</span>
                  <span className="text-[10px] text-amber-400 font-medium">
                    {products.filter(p => p.stock < 15).length} con bajo stock
                  </span>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-xs">Diseñadores Activos</span>
                  <span className="text-2xl font-extrabold text-white block mt-1">12</span>
                  <span className="text-[10px] text-cyan-400 font-medium">{designs.length} plantillas totales</span>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Charts & Table row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sales Chart (SVG Visualization) */}
              <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border-slate-800 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-200">Tendencia de Ventas Diarias</h3>
                
                {/* SVG Chart */}
                <div className="w-full h-64 bg-slate-950/40 rounded-xl relative p-4 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 400 150">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="400" y2="30" stroke="#1e293b" strokeDasharray="3" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="#1e293b" strokeDasharray="3" />
                    <line x1="0" y1="120" x2="400" y2="120" stroke="#1e293b" strokeDasharray="3" />
                    
                    {/* Simulated linear chart */}
                    <path
                      d="M 10 120 L 50 110 L 100 130 L 150 90 L 200 80 L 250 50 L 300 65 L 350 40 L 390 20"
                      fill="none"
                      stroke="url(#chartGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    
                    {/* Glowing dots */}
                    <circle cx="250" cy="50" r="4" fill="#818cf8" />
                    <circle cx="390" cy="20" r="4" fill="#ec4899" />

                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="50%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Axis labels */}
                  <div className="absolute bottom-2 left-4 text-[9px] text-slate-500">23 May</div>
                  <div className="absolute bottom-2 right-4 text-[9px] text-slate-500">Hoy (31 May)</div>
                </div>

                <div className="flex gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Venta Regular
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Proyectos Corporativos B2B
                  </div>
                </div>
              </div>

              {/* Best Sellers */}
              <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border-slate-800 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-200">Productos Más Vendidos</h3>
                
                <div className="flex flex-col gap-3">
                  {bestSellers.length > 0 ? (
                    bestSellers.map(([name, qty], idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium truncate max-w-[160px]">{name}</span>
                          <span className="text-indigo-400 font-semibold">{qty} Unidades</span>
                        </div>
                        {/* Bar */}
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${Math.min(100, (qty / 15) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs py-8 text-center">Sin ventas registradas aún.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="glass-panel rounded-2xl p-6 border-slate-800 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <h2 className="text-lg font-bold text-white">Administración de Catálogo</h2>
              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Agregar Producto
              </button>
            </div>

            {/* Create Product Form */}
            {isAddingProduct && (
              <form onSubmit={handleAddProduct} className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Ej. Taza Cónica"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Descripción</label>
                  <input
                    type="text"
                    required
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Detalles del producto"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Categoría</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Precio Base ($)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Modelo 3D Compatible</label>
                  <select
                    value={newProdType}
                    onChange={(e) => setNewProdType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="taza">Taza (3D Cylinder)</option>
                    <option value="playera">Playera (3D Box/Cloth)</option>
                    <option value="gorra">Gorra (3D Dome)</option>
                    <option value="termo">Termo (3D Tube)</option>
                    <option value="cushion">Cojín (3D Cushion)</option>
                    <option value="puzzle">Rompecabezas (3D Board)</option>
                    <option value="mousepad">Mouse Pad (3D Flat Box)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Imagen URL</label>
                  <input
                    type="text"
                    required
                    value={newProdImg}
                    onChange={(e) => setNewProdImg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold">Guardar</button>
                  <button type="button" onClick={() => setIsAddingProduct(false)} className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs">Cancelar</button>
                </div>
              </form>
            )}

            {/* Inventory table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Tipo 3D</th>
                    <th className="py-3 px-4 text-right">Precio Base</th>
                    <th className="py-3 px-4 text-center font-bold">Stock</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-900/10 text-slate-300">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img src={prod.imagen_url} alt={prod.nombre} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <span className="font-semibold text-white block">{prod.nombre}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[180px] block">{prod.descripcion}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-semibold text-[10px] text-indigo-400">{prod.tipo_3d}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">${prod.precio_base.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          prod.stock < 15 ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                        }`}>
                          {prod.stock} Pzas
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => handleUpdateStock(prod.id, 10)} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded font-semibold text-[10px] text-slate-300">+10</button>
                          <button onClick={() => handleUpdateStock(prod.id, -10)} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded font-semibold text-[10px] text-slate-300">-10</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="glass-panel rounded-2xl p-6 border-slate-800 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-900 pb-4">Gestión de Pedidos</h2>
            
            <div className="overflow-x-auto">
              {orders.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Artículos</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-center">Actualizar Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-900/10 text-slate-300">
                        <td className="py-4 px-4 font-mono font-bold text-indigo-300">{order.codigo_seguimiento}</td>
                        <td className="py-4 px-4">{order.usuario_nombre}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-0.5">
                            {order.items.map((it, idx) => (
                              <span key={idx} className="text-[10px] text-slate-400">
                                {it.cantidad}x {it.producto_nombre} ({it.color})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-white">${order.total.toFixed(2)}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.estado === 'Pendiente' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' :
                            order.estado === 'En Producción' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40' :
                            order.estado === 'Enviado' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/40' :
                            'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                          }`}>
                            {order.estado}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-1">
                            {order.estado === 'Pendiente' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'En Producción')}
                                className="px-2 py-1 bg-indigo-900/50 hover:bg-indigo-850 border border-indigo-700/40 text-indigo-200 rounded text-[9px] font-bold"
                              >
                                Producir
                              </button>
                            )}
                            {order.estado === 'En Producción' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'Enviado')}
                                className="px-2 py-1 bg-cyan-900/50 hover:bg-cyan-850 border border-cyan-700/40 text-cyan-200 rounded text-[9px] font-bold"
                              >
                                Enviar
                              </button>
                            )}
                            {order.estado === 'Enviado' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'Entregado')}
                                className="px-2 py-1 bg-emerald-900/50 hover:bg-emerald-850 border border-emerald-700/40 text-emerald-200 rounded text-[9px] font-bold"
                              >
                                Entregar
                              </button>
                            )}
                            {order.estado === 'Entregado' && (
                              <span className="text-[10px] text-slate-500 font-semibold">✓ Completado</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Ningún pedido registrado en el sistema.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="glass-panel rounded-2xl p-6 border-slate-800 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <h2 className="text-lg font-bold text-white">Cupones de Descuento</h2>
              <button
                onClick={() => setIsAddingCoupon(!isAddingCoupon)}
                className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Nuevo Cupón
              </button>
            </div>

            {isAddingCoupon && (
              <form onSubmit={handleAddCoupon} className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">CÓDIGO DE CUPÓN</label>
                  <input
                    type="text"
                    required
                    value={newCupCode}
                    onChange={(e) => setNewCupCode(e.target.value)}
                    placeholder="EJ: DIADELPADRE"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">TIPO DESCUENTO</label>
                  <select
                    value={newCupType}
                    onChange={(e) => setNewCupType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">VALOR DESCUENTO</label>
                  <input
                    type="number"
                    required
                    value={newCupValue}
                    onChange={(e) => setNewCupValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold">Crear</button>
                  <button type="button" onClick={() => setIsAddingCoupon(false)} className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs">X</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(cup => (
                <div key={cup.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="font-mono text-sm font-bold text-white bg-indigo-950/50 border border-indigo-900/60 px-2 py-1 rounded">
                      {cup.codigo}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-2.5">
                      Descuento: <span className="text-emerald-400 font-semibold">{cup.tipo === 'porcentaje' ? `${cup.valor}%` : `$${cup.valor} MXN`}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Usos registrados: {cup.usos} veces
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${cup.activo ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                    {cup.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DESIGNS */}
        {activeTab === 'designs' && (
          <div className="glass-panel rounded-2xl p-6 border-slate-800 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-900 pb-4">Aprobación de Diseños (Marketplace)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {designs.filter(d => !d.aprobado).length > 0 ? (
                designs.filter(d => !d.aprobado).map(des => (
                  <div key={des.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-900">
                      <img src={des.imagen_url} alt={des.titulo} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{des.titulo}</h4>
                      <span className="text-[10px] text-slate-400">Por: {des.nombre_diseñador}</span>
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-[10px] text-slate-500">Precio plantilla</span>
                        <span className="text-xs font-semibold text-emerald-400">${des.precio.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveDesign(des.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Aprobar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500 text-xs">
                  No hay diseños nuevos pendientes de aprobación. Todos los diseños subidos están activos en la plataforma.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
