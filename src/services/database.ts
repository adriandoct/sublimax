// SUBLIMAX Studio Database Service - Dual Mode (Supabase / LocalStorage)
// Automatically connects to Supabase if credentials are provided in .env,
// otherwise falls back to localStorage for a completely interactive sandboxed demo.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  role: 'admin' | 'designer' | 'user';
  fecha_registro: string;
  avatar_url?: string;
  comision_acumulada?: number;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio_base: number;
  categoria_id: string;
  imagen_url: string;
  stock: number;
  tipo_3d: 'taza' | 'playera' | 'gorra' | 'termo' | 'cushion' | 'puzzle' | 'mousepad';
  popularidad: number;
  fecha_creacion: string;
  dimensiones?: string;
  material?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  slug: string;
}

export interface Diseño {
  id: string;
  usuario_id: string;
  nombre_diseñador: string;
  titulo: string;
  imagen_url: string;
  precio: number;
  categoria_id?: string;
  ventas: number;
  aprobado: boolean;
}

export interface CartItem {
  id: string;
  producto_id: string;
  producto_nombre: string;
  producto_imagen: string;
  tipo_3d: string;
  precio_unitario: number;
  cantidad: number;
  color: string;
  diseño_personalizado?: {
    image?: string;
    text?: string;
    textColor?: string;
    textFontSize?: number;
    textFontFamily?: string;
    stickers?: Array<{ id: string; url: string; x: number; y: number; scale: number }>;
  };
}

export interface Pedido {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  items: CartItem[];
  subtotal: number;
  descuento: number;
  total: number;
  estado: 'Pendiente' | 'En Producción' | 'Enviado' | 'Entregado';
  metodo_pago: string;
  fecha_creacion: string;
  codigo_seguimiento: string;
  puntos_ganados: number;
}

export interface Reseña {
  id: string;
  producto_id: string;
  usuario_nombre: string;
  rating: number;
  comentario: string;
  fecha: string;
}

export interface Cupon {
  id: string;
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  activo: boolean;
  limite_usos?: number;
  usos: number;
}

export interface PuntosRecompensa {
  id: string;
  usuario_id: string;
  puntos: number;
  tipo_movimiento: 'compra' | 'referido' | 'redencion' | 'social';
  descripcion: string;
  fecha: string;
}

// ---------------------------------------------------------
// SUPABASE CLIENT INITIALIZATION & DETECTION
// ---------------------------------------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid and not placeholders
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
  !supabaseUrl.includes('placeholder');

export let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log("🚀 SUBLIMAX Studio: Conectado a la base de datos Supabase.");
  } catch (error) {
    console.error("⚠️ Error inicializando cliente Supabase, usando LocalStorage:", error);
  }
} else {
  console.log("ℹ️ SUBLIMAX Studio: Corriendo en Modo Sandbox Local (LocalStorage).");
}

// ---------------------------------------------------------
// LOCAL SEED FALLBACK DATA
// ---------------------------------------------------------
const DEFAULT_CATEGORIES: Categoria[] = [
  { id: 'cat-1', nombre: 'Tazas Personalizadas', descripcion: 'Tazas de cerámica, mágicas, de cristal y más', slug: 'tazas' },
  { id: 'cat-2', nombre: 'Playeras Sublimadas', descripcion: 'T-shirts premium con tacto algodón y Dry-Fit', slug: 'playeras' },
  { id: 'cat-3', nombre: 'Gorras Personalizadas', descripcion: 'Gorras de gabardina y tipo trucker ajustables', slug: 'gorras' },
  { id: 'cat-4', nombre: 'Termos Premium', descripcion: 'Termos de acero inoxidable y cilindros deportivos', slug: 'termos' },
  { id: 'cat-5', nombre: 'Artículos Promocionales', descripcion: 'Cojines, rompecabezas, mouse pads y más', slug: 'promocionales' },
];

const DEFAULT_PRODUCTS: Producto[] = [
  {
    id: 'prod-taza-1',
    nombre: 'Taza de Cerámica Blanca 11oz',
    descripcion: 'Taza de cerámica premium AAA con recubrimiento de poliéster de alta durabilidad.',
    precio_base: 120.00,
    categoria_id: 'cat-1',
    imagen_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
    stock: 250,
    tipo_3d: 'taza',
    popularidad: 5,
    fecha_creacion: '2026-01-10',
    dimensiones: '9.5cm alto x 8cm diámetro',
    material: 'Cerámica Premium AAA'
  },
  {
    id: 'prod-taza-magica',
    nombre: 'Taza Mágica de 11oz',
    descripcion: 'Taza negra que revela el diseño impreso al verter líquido caliente en su interior.',
    precio_base: 160.00,
    categoria_id: 'cat-1',
    imagen_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop',
    stock: 120,
    tipo_3d: 'taza',
    popularidad: 5,
    fecha_creacion: '2026-02-15',
    dimensiones: '9.5cm alto x 8.2cm diámetro',
    material: 'Cerámica Termosensible'
  },
  {
    id: 'prod-playera-poliester',
    nombre: 'Playera Tacto Algodón Premium',
    descripcion: 'Playera de poliéster transpirable con textura tacto algodón suave al tacto.',
    precio_base: 220.00,
    categoria_id: 'cat-2',
    imagen_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop',
    stock: 300,
    tipo_3d: 'playera',
    popularidad: 4,
    fecha_creacion: '2026-01-20',
    dimensiones: 'S, M, L, XL',
    material: 'Poliéster 100% (190 gr/m²)'
  },
  {
    id: 'prod-playera-clown-color',
    nombre: 'Playera Clown Colorida Sublimada',
    descripcion: 'Playera premium sublimada con el diseño vibrante de una máscara punk de payaso.',
    precio_base: 250.00,
    categoria_id: 'cat-2',
    imagen_url: '/playera_clown_color.png',
    stock: 100,
    tipo_3d: 'playera',
    popularidad: 5,
    fecha_creacion: '2026-06-14',
    dimensiones: 'S, M, L, XL',
    material: 'Poliéster 100% (Tacto Algodón)'
  },
  {
    id: 'prod-playera-clown-sequin',
    nombre: 'Playera Clown Brillante Sublimada',
    descripcion: 'Playera premium sublimada con el diseño detallado de diamantes y lentejuelas de máscara clown.',
    precio_base: 250.00,
    categoria_id: 'cat-2',
    imagen_url: '/playera_clown_sequin.png',
    stock: 100,
    tipo_3d: 'playera',
    popularidad: 5,
    fecha_creacion: '2026-06-14',
    dimensiones: 'S, M, L, XL',
    material: 'Poliéster 100% (Tacto Algodón)'
  },
  {
    id: 'prod-playera-lucha-azul',
    nombre: 'Playera Lucha Libre Azul Sublimada',
    descripcion: 'Playera premium sublimada con diseño bordado estilizado de máscara de lucha libre azul.',
    precio_base: 250.00,
    categoria_id: 'cat-2',
    imagen_url: '/playera_lucha_azul.png',
    stock: 100,
    tipo_3d: 'playera',
    popularidad: 5,
    fecha_creacion: '2026-06-14',
    dimensiones: 'S, M, L, XL',
    material: 'Poliéster 100% (Tacto Algodón)'
  },
  {
    id: 'prod-gorra-trucker',
    nombre: 'Gorra Trucker Ajustable',
    descripcion: 'Gorra clásica tipo trailera con malla de nylon trasera y frente acolchado sublimable.',
    precio_base: 110.00,
    categoria_id: 'cat-3',
    imagen_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=300&auto=format&fit=crop',
    stock: 150,
    tipo_3d: 'gorra',
    popularidad: 4,
    fecha_creacion: '2026-03-01',
    dimensiones: 'Broche ajustable (Unica)',
    material: 'Poliéster y Nylon'
  },
  {
    id: 'prod-termo-deportivo',
    nombre: 'Termo de Acero Inoxidable 600ml',
    descripcion: 'Termo de doble pared hermético. Mantiene líquidos fríos por 12 horas.',
    precio_base: 280.00,
    categoria_id: 'cat-4',
    imagen_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=300&auto=format&fit=crop',
    stock: 90,
    tipo_3d: 'termo',
    popularidad: 5,
    fecha_creacion: '2026-02-10',
    dimensiones: '22cm alto x 7.3cm diámetro',
    material: 'Acero Inoxidable 304'
  }
];

const DEFAULT_COUPONS: Cupon[] = [
  { id: 'cup-1', codigo: 'BIENVENIDA10', tipo: 'porcentaje', valor: 10, activo: true, usos: 25 },
  { id: 'cup-2', codigo: 'SUBLIMAX50', tipo: 'fijo', valor: 50, activo: true, usos: 12 },
  { id: 'cup-3', codigo: 'CECYTEPROMO', tipo: 'porcentaje', valor: 25, activo: true, usos: 0 }
];

// Helper to initialize and retrieve public database API
export class Database {
  private static initKey = 'sublimax_db_initialized';

  static initialize() {
    if (localStorage.getItem(this.initKey)) {
      // Ensure any new default products are added even if already initialized
      const currentProds = JSON.parse(localStorage.getItem('sublimax_productos') || '[]');
      let updated = false;
      DEFAULT_PRODUCTS.forEach(dp => {
        if (!currentProds.some((p: Producto) => p.id === dp.id)) {
          currentProds.push(dp);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('sublimax_productos', JSON.stringify(currentProds));
      }
      return;
    }

    localStorage.setItem('sublimax_categorias', JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem('sublimax_productos', JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem('sublimax_diseños', JSON.stringify([]));
    localStorage.setItem('sublimax_cupones', JSON.stringify(DEFAULT_COUPONS));
    localStorage.setItem('sublimax_reseñas', JSON.stringify([]));
    localStorage.setItem('sublimax_pedidos', JSON.stringify([]));
    localStorage.setItem('sublimax_puntos', JSON.stringify([]));
    localStorage.setItem('sublimax_carrito', JSON.stringify([]));

    // Admin profile seed
    const adminUser: Usuario = {
      id: 'admin-id-1',
      email: 'admin@gmail.com',
      nombre: 'Administrador General (Cecyte)',
      role: 'admin',
      fecha_registro: '2026-05-01',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'
    };

    localStorage.setItem('sublimax_usuarios', JSON.stringify([adminUser]));
    localStorage.setItem('sublimax_active_user', JSON.stringify(null));
    localStorage.setItem(this.initKey, 'true');
  }

  // --- Auth API ---
  static getActiveUser(): Usuario | null {
    this.initialize();
    const user = localStorage.getItem('sublimax_active_user');
    return user ? JSON.parse(user) : null;
  }

  static login(email: string, pass: string): Usuario | null {
    this.initialize();
    
    // Auth bypass simulator or Supabase Auth link
    if (email.toLowerCase() === 'admin@gmail.com' && pass === '12345678Cecyte') {
      const admin: Usuario = {
        id: 'admin-id-1',
        email: 'admin@gmail.com',
        nombre: 'Administrador General (Cecyte)',
        role: 'admin',
        fecha_registro: '2026-05-01',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'
      };
      localStorage.setItem('sublimax_active_user', JSON.stringify(admin));
      return admin;
    }

    // Default local auth flow
    const users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      const isDesigner = email.includes('designer');
      user = {
        id: `user-${Date.now()}`,
        email: email,
        nombre: email.split('@')[0].toUpperCase(),
        role: isDesigner ? 'designer' : 'user',
        fecha_registro: new Date().toISOString().split('T')[0],
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        comision_acumulada: isDesigner ? 0 : undefined
      };
      users.push(user);
      localStorage.setItem('sublimax_usuarios', JSON.stringify(users));
    }
    localStorage.setItem('sublimax_active_user', JSON.stringify(user));
    return user;
  }

  static logout() {
    localStorage.setItem('sublimax_active_user', JSON.stringify(null));
  }

  /**
   * Register a brand new user (designer or user role).
   * Returns the created Usuario on success, or an error string on failure.
   */
  static register(
    nombre: string,
    email: string,
    _password: string,
    role: 'user' | 'designer' = 'user'
  ): Usuario | string {
    this.initialize();
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return 'Ya existe una cuenta con ese correo electrónico.';
    }

    const newUser: Usuario = {
      id: `user-${Date.now()}`,
      email,
      nombre: nombre.trim() || email.split('@')[0].toUpperCase(),
      role,
      fecha_registro: new Date().toISOString().split('T')[0],
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      comision_acumulada: role === 'designer' ? 0 : undefined,
    };

    users.push(newUser);
    localStorage.setItem('sublimax_usuarios', JSON.stringify(users));
    localStorage.setItem('sublimax_active_user', JSON.stringify(newUser));
    return newUser;
  }

  static getUsers(): Usuario[] {
    this.initialize();
    return JSON.parse(localStorage.getItem('sublimax_usuarios') || '[]');
  }

  // --- Products & Categories API (With Async Fetch Support) ---
  static getProducts(): Producto[] {
    this.initialize();
    // In background, if Supabase is connected we could sync it.
    // To maintain synchronous UI response, we read local, but sync DB.
    if (supabaseClient) {
      supabaseClient.from('productos').select('*').then(({ data }) => {
        if (data && data.length > 0) {
          localStorage.setItem('sublimax_productos', JSON.stringify(data));
        }
      });
    }
    return JSON.parse(localStorage.getItem('sublimax_productos') || '[]');
  }

  static saveProducts(products: Producto[]) {
    localStorage.setItem('sublimax_productos', JSON.stringify(products));
    
    // Sync to Supabase in background
    if (supabaseClient) {
      products.forEach(p => {
        supabaseClient!.from('productos').upsert({
          id: p.id.includes('prod-') ? undefined : p.id, // let db generate UUID if local temp
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio_base: p.precio_base,
          categoria_id: p.categoria_id.includes('cat-') ? null : p.categoria_id,
          imagen_url: p.imagen_url,
          stock: p.stock,
          tipo_3d: p.tipo_3d,
          popularidad: p.popularidad,
          dimensiones: p.dimensiones,
          material: p.material
        }).then(({ error }) => { if (error) console.error("Error syncing product to Supabase:", error); });
      });
    }
  }

  static getCategories(): Categoria[] {
    this.initialize();
    if (supabaseClient) {
      supabaseClient.from('categorias').select('*').then(({ data }) => {
        if (data && data.length > 0) {
          localStorage.setItem('sublimax_categorias', JSON.stringify(data));
        }
      });
    }
    return JSON.parse(localStorage.getItem('sublimax_categorias') || '[]');
  }

  // --- Cart API ---
  static getCart(): CartItem[] {
    this.initialize();
    return JSON.parse(localStorage.getItem('sublimax_carrito') || '[]');
  }

  static saveCart(cart: CartItem[]) {
    localStorage.setItem('sublimax_carrito', JSON.stringify(cart));
  }

  static addToCart(item: CartItem) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(c => 
      c.producto_id === item.producto_id && 
      c.color === item.color &&
      JSON.stringify(c.diseño_personalizado) === JSON.stringify(item.diseño_personalizado)
    );

    if (existingIndex > -1) {
      cart[existingIndex].cantidad += item.cantidad;
    } else {
      cart.push(item);
    }
    this.saveCart(cart);
  }

  // --- Orders API ---
  static getOrders(): Pedido[] {
    this.initialize();
    if (supabaseClient) {
      supabaseClient.from('pedidos').select('*').then(({ data }) => {
        if (data && data.length > 0) {
          // Format payload
          const formatted = data.map(d => ({
            id: d.id,
            usuario_id: d.usuario_id,
            usuario_nombre: d.usuario_nombre,
            items: [], // loaded from items relation if fully implemented, falls back to local storage
            subtotal: Number(d.subtotal),
            descuento: Number(d.descuento),
            total: Number(d.total),
            estado: d.estado,
            metodo_pago: d.metodo_pago,
            fecha_creacion: d.fecha_creacion ? d.fecha_creacion.split('T')[0] : '',
            codigo_seguimiento: d.codigo_seguimiento,
            puntos_ganados: d.puntos_ganados
          }));
          // Merge with local orders
          localStorage.setItem('sublimax_pedidos', JSON.stringify(formatted));
        }
      });
    }
    return JSON.parse(localStorage.getItem('sublimax_pedidos') || '[]');
  }

  static createPedido(pedido: Omit<Pedido, 'id' | 'codigo_seguimiento' | 'fecha_creacion'>): Pedido {
    const orders = this.getOrders();
    const trackingCode = `SBX-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPedido: Pedido = {
      ...pedido,
      id: `ped-${Date.now()}`,
      codigo_seguimiento: trackingCode,
      fecha_creacion: new Date().toISOString().split('T')[0]
    };
    orders.unshift(newPedido);
    localStorage.setItem('sublimax_pedidos', JSON.stringify(orders));

    // Deduct stock
    const products = this.getProducts();
    newPedido.items.forEach(item => {
      const prod = products.find(p => p.id === item.producto_id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.cantidad);
      }
    });
    this.saveProducts(products);

    // Award Points
    if (pedido.usuario_id) {
      this.addPoints(pedido.usuario_id, newPedido.puntos_ganados, 'compra', `Compra en orden ${newPedido.codigo_seguimiento}`);
    }

    // Sync to Supabase in background
    if (supabaseClient) {
      supabaseClient.from('pedidos').insert({
        usuario_id: pedido.usuario_id.includes('admin') || pedido.usuario_id.includes('user-') ? null : pedido.usuario_id,
        usuario_nombre: pedido.usuario_nombre,
        subtotal: pedido.subtotal,
        descuento: pedido.descuento,
        total: pedido.total,
        estado: 'Pendiente',
        metodo_pago: pedido.metodo_pago,
        codigo_seguimiento: trackingCode,
        puntos_ganados: pedido.puntos_ganados
      }).select().then(({ data, error }) => {
        if (error) console.error("Error creating order on Supabase:", error);
        
        // Insert order items
        if (data && data[0]) {
          const pedId = data[0].id;
          pedido.items.forEach(item => {
            supabaseClient!.from('items_pedido').insert({
              pedido_id: pedId,
              producto_id: item.producto_id.includes('prod-') ? null : item.producto_id,
              producto_nombre: item.producto_nombre,
              precio_unitario: item.precio_unitario,
              cantidad: item.cantidad,
              color: item.color,
              diseño_personalizado: item.diseño_personalizado
            }).then(({ error: itemErr }) => { if (itemErr) console.error("Error adding order item to Supabase:", itemErr); });
          });
        }
      });
    }

    return newPedido;
  }

  static updateOrderEstado(orderId: string, estado: Pedido['estado']) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
      orders[index].estado = estado;
      localStorage.setItem('sublimax_pedidos', JSON.stringify(orders));

      // Sync state to Supabase in background
      if (supabaseClient && !orderId.includes('ped-')) {
        supabaseClient.from('pedidos')
          .update({ estado })
          .eq('id', orderId)
          .then(({ error }) => { if (error) console.error("Error updating order state in Supabase:", error); });
      }
    }
  }

  // --- Points & Rewards API ---
  static getPointsLedger(usuarioId: string): PuntosRecompensa[] {
    this.initialize();
    if (supabaseClient && !usuarioId.includes('user-')) {
      supabaseClient.from('puntos_recompensa')
        .select('*')
        .eq('usuario_id', usuarioId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            localStorage.setItem('sublimax_puntos', JSON.stringify(data));
          }
        });
    }
    const ledger: PuntosRecompensa[] = JSON.parse(localStorage.getItem('sublimax_puntos') || '[]');
    return ledger.filter(l => l.usuario_id === usuarioId);
  }

  static getTotalPoints(usuarioId: string): number {
    const ledger = this.getPointsLedger(usuarioId);
    return ledger.reduce((sum, item) => sum + item.puntos, 0);
  }

  static addPoints(usuarioId: string, puntos: number, tipo: PuntosRecompensa['tipo_movimiento'], descripcion: string) {
    this.initialize();
    const ledger: PuntosRecompensa[] = JSON.parse(localStorage.getItem('sublimax_puntos') || '[]');
    const record: PuntosRecompensa = {
      id: `pts-${Date.now()}`,
      usuario_id: usuarioId,
      puntos,
      tipo_movimiento: tipo,
      descripcion,
      fecha: new Date().toISOString().split('T')[0]
    };
    ledger.push(record);
    localStorage.setItem('sublimax_puntos', JSON.stringify(ledger));

    // Sync to Supabase
    if (supabaseClient && !usuarioId.includes('user-') && !usuarioId.includes('admin')) {
      supabaseClient.from('puntos_recompensa').insert({
        usuario_id: usuarioId,
        puntos,
        tipo_movimiento: tipo,
        descripcion
      }).then(({ error }) => { if (error) console.error("Error saving reward points to Supabase:", error); });
    }
  }

  // --- Coupons API ---
  static getCoupons(): Cupon[] {
    this.initialize();
    if (supabaseClient) {
      supabaseClient.from('cupones').select('*').then(({ data }) => {
        if (data && data.length > 0) {
          localStorage.setItem('sublimax_cupones', JSON.stringify(data));
        }
      });
    }
    return JSON.parse(localStorage.getItem('sublimax_cupones') || '[]');
  }

  static validateCoupon(codigo: string): Cupon | null {
    const coupons = this.getCoupons();
    const cup = coupons.find(c => c.codigo.toUpperCase() === codigo.trim().toUpperCase() && c.activo);
    if (cup) {
      if (cup.limite_usos && cup.usos >= cup.limite_usos) return null;
      return cup;
    }
    return null;
  }

  static useCoupon(codigo: string) {
    const coupons = this.getCoupons();
    const index = coupons.findIndex(c => c.codigo.toUpperCase() === codigo.trim().toUpperCase());
    if (index > -1) {
      coupons[index].usos += 1;
      localStorage.setItem('sublimax_cupones', JSON.stringify(coupons));

      if (supabaseClient && !coupons[index].id.includes('cup-')) {
        supabaseClient.from('cupones')
          .update({ usos: coupons[index].usos })
          .eq('id', coupons[index].id)
          .then(({ error }) => { if (error) console.error("Error syncing coupon usage in Supabase:", error); });
      }
    }
  }

  static createCoupon(coupon: Omit<Cupon, 'id' | 'usos'>): Cupon {
    const coupons = this.getCoupons();
    const newCoupon: Cupon = {
      ...coupon,
      id: `cup-${Date.now()}`,
      usos: 0
    };
    coupons.push(newCoupon);
    localStorage.setItem('sublimax_cupones', JSON.stringify(coupons));

    // Sync to Supabase
    if (supabaseClient) {
      supabaseClient.from('cupones').insert({
        codigo: coupon.codigo,
        tipo: coupon.tipo,
        valor: coupon.valor,
        limite_usos: coupon.limite_usos,
        activo: coupon.activo
      }).then(({ error }) => { if (error) console.error("Error creating coupon on Supabase:", error); });
    }

    return newCoupon;
  }

  // --- Designs Marketplace API ---
  static getDesigns(): Diseño[] {
    this.initialize();
    if (supabaseClient) {
      supabaseClient.from('diseños').select('*').then(({ data }) => {
        if (data && data.length > 0) {
          localStorage.setItem('sublimax_diseños', JSON.stringify(data));
        }
      });
    }
    return JSON.parse(localStorage.getItem('sublimax_diseños') || '[]');
  }

  static uploadDesign(design: Omit<Diseño, 'id' | 'ventas' | 'aprobado'>): Diseño {
    const designs = this.getDesigns();
    const newDesign: Diseño = {
      ...design,
      id: `des-${Date.now()}`,
      ventas: 0,
      aprobado: false
    };
    designs.push(newDesign);
    localStorage.setItem('sublimax_diseños', JSON.stringify(designs));

    // Sync to Supabase
    if (supabaseClient && !design.usuario_id.includes('user-')) {
      supabaseClient.from('diseños').insert({
        usuario_id: design.usuario_id,
        nombre_diseñador: design.nombre_diseñador,
        titulo: design.titulo,
        imagen_url: design.imagen_url,
        precio: design.precio,
        aprobado: false
      }).then(({ error }) => { if (error) console.error("Error uploading design to Supabase:", error); });
    }

    return newDesign;
  }

  static approveDesign(designId: string) {
    const designs = this.getDesigns();
    const index = designs.findIndex(d => d.id === designId);
    if (index > -1) {
      designs[index].aprobado = true;
      localStorage.setItem('sublimax_diseños', JSON.stringify(designs));

      if (supabaseClient && !designId.includes('des-')) {
        supabaseClient.from('diseños')
          .update({ aprobado: true })
          .eq('id', designId)
          .then(({ error }) => { if (error) console.error("Error approving design in Supabase:", error); });
      }
    }
  }

  // --- Reviews API ---
  static getReviews(productoId: string): Reseña[] {
    this.initialize();
    if (supabaseClient && !productoId.includes('prod-')) {
      supabaseClient.from('reseñas')
        .select('*')
        .eq('producto_id', productoId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            localStorage.setItem('sublimax_reseñas', JSON.stringify(data));
          }
        });
    }
    const reviews: Reseña[] = JSON.parse(localStorage.getItem('sublimax_reseñas') || '[]');
    return reviews.filter(r => r.producto_id === productoId);
  }

  static addReview(productoId: string, rating: number, comentario: string, usuarioNombre: string) {
    const reviews: Reseña[] = JSON.parse(localStorage.getItem('sublimax_reseñas') || '[]');
    const newReview: Reseña = {
      id: `rev-${Date.now()}`,
      producto_id: productoId,
      usuario_nombre: usuarioNombre,
      rating,
      comentario,
      fecha: new Date().toISOString().split('T')[0]
    };
    reviews.push(newReview);
    localStorage.setItem('sublimax_reseñas', JSON.stringify(reviews));

    if (supabaseClient && !productoId.includes('prod-')) {
      supabaseClient.from('reseñas').insert({
        producto_id: productoId,
        usuario_nombre: usuarioNombre,
        rating,
        comentario
      }).then(({ error }) => { if (error) console.error("Error writing review to Supabase:", error); });
    }
  }
}
