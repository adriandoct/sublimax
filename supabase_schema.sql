-- =====================================================================
-- SUBLIMAX STUDIO - Esquema de Base de Datos Supabase (PostgreSQL)
-- Copia y pega este script en el editor SQL de tu panel de Supabase.
-- =====================================================================

-- 1. ENUM DE ROLES DE USUARIO
CREATE TYPE rol_usuario AS ENUM ('admin', 'designer', 'user');

-- 2. TABLA DE CATEGORÍAS
CREATE TABLE public.categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Categorías
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad de Categorías
CREATE POLICY "Permitir lectura de categorías a cualquiera" 
ON public.categorias FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden modificar categorías" 
ON public.categorias FOR ALL USING (
    (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'admin'
);


-- 3. TABLA DE USUARIOS / PERFILES (Sincronizada con auth.users de Supabase)
CREATE TABLE public.usuarios (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(150),
    role rol_usuario DEFAULT 'user'::rol_usuario NOT NULL,
    comision_acumulada NUMERIC(10, 2) DEFAULT 0.00,
    avatar_url TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad de Usuarios
CREATE POLICY "Permitir lectura de perfiles básicos a cualquiera" 
ON public.usuarios FOR SELECT USING (true);

CREATE POLICY "Permitir actualizar perfil propio" 
ON public.usuarios FOR UPDATE USING (auth.uid() = id);


-- 4. FUNCIÓN Y TRIGGER PARA AUTO-CREAR PERFIL AL REGISTRARSE EN AUTH
-- Esto asegura que cuando un vendedor o usuario se registre por la API de Auth, 
-- se le asigne su rol en la tabla pública de usuarios.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::public.rol_usuario, 'user'::public.rol_usuario),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 5. TABLA DE PRODUCTOS
CREATE TABLE public.productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_base NUMERIC(10, 2) NOT NULL CHECK (precio_base >= 0),
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    imagen_url TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    tipo_3d VARCHAR(50) NOT NULL, -- 'taza', 'playera', 'gorra', 'termo', etc.
    popularidad INTEGER DEFAULT 3 CHECK (popularidad BETWEEN 1 AND 5),
    dimensiones VARCHAR(100),
    material VARCHAR(150),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Productos
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad de Productos
CREATE POLICY "Permitir lectura de productos a cualquiera" 
ON public.productos FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden modificar productos" 
ON public.productos FOR ALL USING (
    (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'admin'
);


-- 6. TABLA DE DISEÑOS (Marketplace de Diseñadores / Creadores)
CREATE TABLE public.diseños (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    nombre_diseñador VARCHAR(150) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    imagen_url TEXT NOT NULL,
    precio NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio >= 0),
    aprobado BOOLEAN DEFAULT false NOT NULL,
    ventas INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Diseños
ALTER TABLE public.diseños ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad de Diseños
CREATE POLICY "Cualquiera puede ver diseños aprobados" 
ON public.diseños FOR SELECT USING (aprobado = true OR auth.uid() = usuario_id);

CREATE POLICY "Diseñadores pueden subir sus propios diseños" 
ON public.diseños FOR INSERT WITH CHECK (
    auth.uid() = usuario_id AND 
    (SELECT role FROM public.usuarios WHERE id = auth.uid()) IN ('designer', 'admin')
);

CREATE POLICY "Administradores pueden aprobar o modificar diseños" 
ON public.diseños FOR ALL USING (
    (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'admin'
);


-- 7. TABLA DE CUPONES DE DESCUENTO
CREATE TABLE public.cupones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(20) DEFAULT 'porcentaje' NOT NULL, -- 'porcentaje' o 'fijo'
    valor NUMERIC(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    limite_usos INTEGER,
    usos INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Cupones
ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir validación de cupones a usuarios autenticados" 
ON public.cupones FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo administradores controlan cupones" 
ON public.cupones FOR ALL USING (
    (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'admin'
);


-- 8. TABLA DE PEDIDOS
CREATE TABLE public.pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    usuario_nombre VARCHAR(150) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    descuento NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente' NOT NULL, -- 'Pendiente', 'En Producción', 'Enviado', 'Entregado'
    metodo_pago VARCHAR(50) NOT NULL,
    codigo_seguimiento VARCHAR(50) NOT NULL UNIQUE,
    puntos_ganados INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios pedidos" 
ON public.pedidos FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Cualquier usuario autenticado puede crear un pedido" 
ON public.pedidos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores tienen control total de pedidos" 
ON public.pedidos FOR ALL USING (
    (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'admin'
);


-- 9. TABLA DE ITEMS DE PEDIDO
CREATE TABLE public.items_pedido (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
    producto_nombre VARCHAR(150) NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    color VARCHAR(50),
    diseño_personalizado JSONB -- Almacena textos, colores de letra y stickers
);

-- Habilitar RLS en Items de Pedidos
ALTER TABLE public.items_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver items de sus propios pedidos" 
ON public.items_pedido FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pedidos 
        WHERE pedidos.id = items_pedido.pedido_id AND pedidos.usuario_id = auth.uid()
    )
);

CREATE POLICY "Permitir inserción de items a usuarios autenticados" 
ON public.items_pedido FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores controlan items" 
ON public.items_pedido FOR ALL USING (
    (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'admin'
);


-- 10. TABLA DE HISTORIAL DE PUNTOS DE RECOMPENSA
CREATE TABLE public.puntos_recompensa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    puntos INTEGER NOT NULL,
    tipo_movimiento VARCHAR(50) NOT NULL, -- 'compra', 'referido', 'redencion', 'social'
    descripcion TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Puntos
ALTER TABLE public.puntos_recompensa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propios puntos" 
ON public.puntos_recompensa FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Solo sistema o administrador modifica puntos" 
ON public.puntos_recompensa FOR ALL USING (
    (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'admin'
);


-- 11. TABLA DE RESEÑAS
CREATE TABLE public.reseñas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE NOT NULL,
    usuario_nombre VARCHAR(150) NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comentario TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Reseñas
ALTER TABLE public.reseñas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de reseñas pública" 
ON public.reseñas FOR SELECT USING (true);

CREATE POLICY "Cualquier usuario autenticado puede dejar reseñas" 
ON public.reseñas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- =====================================================================
-- 12. DATOS DE PRUEBA (SEED DATA)
-- =====================================================================

-- Inserción de Categorías
INSERT INTO public.categorias (nombre, descripcion, slug) VALUES
('Tazas Personalizadas', 'Tazas de cerámica AAA, mágicas, de cristal y metal', 'tazas'),
('Playeras Sublimadas', 'T-shirts premium con tacto algodón y Dry-Fit deportivo', 'playeras'),
('Gorras Personalizadas', 'Gorras tipo trucker ajustables con broches de plástico', 'gorras'),
('Termos Premium', 'Termos de acero inoxidable y cilindros deportivos de aluminio', 'termos'),
('Artículos Promocionales', 'Cojines reversibles, rompecabezas de cartón y mouse pads', 'promocionales')
ON CONFLICT (nombre) DO NOTHING;

-- Inserción de Productos Iniciales
-- Nota: Asociamos dinámicamente el ID de la categoría correspondiente
INSERT INTO public.productos (nombre, descripcion, precio_base, categoria_id, imagen_url, stock, tipo_3d, popularidad, dimensiones, material) VALUES
('Taza de Cerámica Blanca 11oz', 'Taza de cerámica premium AAA importada con recubrimiento de poliéster de alta durabilidad.', 120.00, (SELECT id FROM public.categorias WHERE slug='tazas'), 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop', 250, 'taza', 5, '9.5cm alto x 8cm diámetro', 'Cerámica Premium AAA'),
('Taza Mágica de 11oz', 'Taza negra termosensible que revela el diseño personalizado al verter líquido caliente.', 160.00, (SELECT id FROM public.categorias WHERE slug='tazas'), 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop', 120, 'taza', 5, '9.5cm alto x 8.2cm diámetro', 'Cerámica Termosensible'),
('Playera Tacto Algodón Premium', 'Playera de poliéster transpirable con textura tacto algodón suave al tacto y costuras reforzadas.', 220.00, (SELECT id FROM public.categorias WHERE slug='playeras'), 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop', 300, 'playera', 4, 'S, M, L, XL', 'Poliéster tacto algodón'),
('Gorra Trucker Ajustable', 'Gorra clásica tipo trailera con malla de nylon trasera y frente acolchado sublimable.', 110.00, (SELECT id FROM public.categorias WHERE slug='gorras'), 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=300&auto=format&fit=crop', 150, 'gorra', 4, 'Broche ajustable (Unica)', 'Poliéster y Nylon'),
('Termo de Acero Inoxidable 600ml', 'Termo cilíndrico de acero inoxidable de doble pared hermético. Mantiene líquidos fríos por 12 horas.', 280.00, (SELECT id FROM public.categorias WHERE slug='termos'), 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=300&auto=format&fit=crop', 90, 'termo', 5, '22cm alto x 7.3cm diámetro', 'Acero Inoxidable 304'),
('Cojín de Lentejuela Reversible', 'Funda de cojín satinado con lentejuelas brillantes bicolor que muestran la impresión al deslizar.', 180.00, (SELECT id FROM public.categorias WHERE slug='promocionales'), 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=300&auto=format&fit=crop', 80, 'cushion', 4, '40cm x 40cm', 'Satín y Lentejuelas'),
('Mouse Pad Rectangular', 'Alfombrilla para mouse de neopreno con base de goma antideslizante y superficie textil lisa.', 95.00, (SELECT id FROM public.categorias WHERE slug='promocionales'), 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=300&auto=format&fit=crop', 200, 'mousepad', 5, '22cm x 18cm', 'Neopreno');

-- Inserción de Cupones iniciales
INSERT INTO public.cupones (codigo, tipo, valor, activo, limite_usos) VALUES
('BIENVENIDA10', 'porcentaje', 10.00, true, 500),
('SUBLIMAX50', 'fijo', 50.00, true, 200),
('CECYTEPROMO', 'porcentaje', 25.00, true, 1000)
ON CONFLICT (codigo) DO NOTHING;
