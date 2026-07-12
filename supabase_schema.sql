-- =====================================================================
-- SUBLIMAX STUDIO - Esquema de Base de Datos Supabase (PostgreSQL)
-- ✅ Script corregido v3 - orden de dependencias definitivo.
-- Pega este script COMPLETO en el SQL Editor de Supabase y ejecuta.
-- =====================================================================

-- =====================================================================
-- PASO 0: LIMPIEZA (re-ejecutable de forma segura)
-- =====================================================================
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user()  CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role()    CASCADE;

DROP TABLE IF EXISTS public.reseñas            CASCADE;
DROP TABLE IF EXISTS public.puntos_recompensa  CASCADE;
DROP TABLE IF EXISTS public.items_pedido       CASCADE;
DROP TABLE IF EXISTS public.pedidos            CASCADE;
DROP TABLE IF EXISTS public.cupones            CASCADE;
DROP TABLE IF EXISTS public.diseños            CASCADE;
DROP TABLE IF EXISTS public.productos          CASCADE;
DROP TABLE IF EXISTS public.categorias         CASCADE;
DROP TABLE IF EXISTS public.usuarios           CASCADE;

DROP TYPE IF EXISTS public.rol_usuario CASCADE;


-- =====================================================================
-- PASO 1: TIPO ENUM
-- =====================================================================
CREATE TYPE public.rol_usuario AS ENUM ('admin', 'designer', 'user');


-- =====================================================================
-- PASO 2: TABLA USUARIOS  ← primera tabla, sin dependencias externas
-- =====================================================================
CREATE TABLE public.usuarios (
    id                 UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email              VARCHAR(255) NOT NULL UNIQUE,
    nombre             VARCHAR(150),
    role               public.rol_usuario DEFAULT 'user'::public.rol_usuario NOT NULL,
    comision_acumulada NUMERIC(10, 2) DEFAULT 0.00,
    avatar_url         TEXT,
    fecha_registro     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas simples de usuarios (no necesitan get_user_role todavía)
CREATE POLICY "usuarios_select_publico"
    ON public.usuarios FOR SELECT USING (true);

CREATE POLICY "usuarios_update_propio"
    ON public.usuarios FOR UPDATE USING (auth.uid() = id);


-- =====================================================================
-- PASO 3: FUNCIÓN AUXILIAR DE ROL
-- Se crea DESPUÉS de usuarios para que la referencia sea válida.
-- Usamos PLPGSQL (no SQL) para diferir validación y evitar errores.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role
  FROM public.usuarios
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN v_role;
END;
$$;

-- Ahora podemos agregar la política de admin a usuarios
CREATE POLICY "usuarios_admin_total"
    ON public.usuarios FOR ALL
    USING (public.get_user_role() = 'admin');


-- =====================================================================
-- PASO 4: TRIGGER PARA AUTO-CREAR PERFIL EN AUTH
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    COALESCE(
      (new.raw_user_meta_data->>'role')::public.rol_usuario,
      'user'::public.rol_usuario
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================================================================
-- PASO 5: TABLA DE CATEGORÍAS
-- =====================================================================
CREATE TABLE public.categorias (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL UNIQUE,
    descripcion    TEXT,
    slug           VARCHAR(100) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias_select_publico"
    ON public.categorias FOR SELECT USING (true);

CREATE POLICY "categorias_admin_total"
    ON public.categorias FOR ALL USING (public.get_user_role() = 'admin');


-- =====================================================================
-- PASO 6: TABLA DE PRODUCTOS
-- =====================================================================
CREATE TABLE public.productos (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre         VARCHAR(150) NOT NULL,
    descripcion    TEXT,
    precio_base    NUMERIC(10, 2) NOT NULL CHECK (precio_base >= 0),
    categoria_id   UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    imagen_url     TEXT,
    stock          INTEGER DEFAULT 0 CHECK (stock >= 0),
    tipo_3d        VARCHAR(50) NOT NULL,
    popularidad    INTEGER DEFAULT 3 CHECK (popularidad BETWEEN 1 AND 5),
    dimensiones    VARCHAR(100),
    material       VARCHAR(150),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_select_publico"
    ON public.productos FOR SELECT USING (true);

CREATE POLICY "productos_admin_total"
    ON public.productos FOR ALL USING (public.get_user_role() = 'admin');


-- =====================================================================
-- PASO 7: TABLA DE DISEÑOS (Marketplace Creadores)
-- =====================================================================
CREATE TABLE public.diseños (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id       UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    nombre_diseñador VARCHAR(150) NOT NULL,
    titulo           VARCHAR(150) NOT NULL,
    imagen_url       TEXT NOT NULL,
    precio           NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio >= 0),
    aprobado         BOOLEAN DEFAULT false NOT NULL,
    ventas           INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.diseños ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diseños_select_aprobados_o_propios"
    ON public.diseños FOR SELECT
    USING (aprobado = true OR auth.uid() = usuario_id);

CREATE POLICY "diseños_insert_designer"
    ON public.diseños FOR INSERT
    WITH CHECK (
        auth.uid() = usuario_id AND
        public.get_user_role() IN ('designer', 'admin')
    );

CREATE POLICY "diseños_update_propio"
    ON public.diseños FOR UPDATE
    USING (auth.uid() = usuario_id);

CREATE POLICY "diseños_admin_total"
    ON public.diseños FOR ALL USING (public.get_user_role() = 'admin');


-- =====================================================================
-- PASO 8: TABLA DE CUPONES
-- =====================================================================
CREATE TABLE public.cupones (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo         VARCHAR(50) NOT NULL UNIQUE,
    tipo           VARCHAR(20) DEFAULT 'porcentaje' NOT NULL,
    valor          NUMERIC(10, 2) NOT NULL,
    activo         BOOLEAN DEFAULT true NOT NULL,
    limite_usos    INTEGER,
    usos           INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cupones_select_autenticados"
    ON public.cupones FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "cupones_admin_total"
    ON public.cupones FOR ALL USING (public.get_user_role() = 'admin');


-- =====================================================================
-- PASO 9: TABLA DE PEDIDOS
-- =====================================================================
CREATE TABLE public.pedidos (
    id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id         UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    usuario_nombre     VARCHAR(150) NOT NULL,
    subtotal           NUMERIC(10, 2) NOT NULL,
    descuento          NUMERIC(10, 2) DEFAULT 0.00,
    total              NUMERIC(10, 2) NOT NULL,
    estado             VARCHAR(50) DEFAULT 'Pendiente' NOT NULL,
    metodo_pago        VARCHAR(50) NOT NULL,
    codigo_seguimiento VARCHAR(50) NOT NULL UNIQUE,
    puntos_ganados     INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pedidos_select_propio"
    ON public.pedidos FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "pedidos_insert_autenticado"
    ON public.pedidos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "pedidos_admin_total"
    ON public.pedidos FOR ALL USING (public.get_user_role() = 'admin');


-- =====================================================================
-- PASO 10: TABLA DE ITEMS DE PEDIDO
-- =====================================================================
CREATE TABLE public.items_pedido (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id            UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    producto_id          UUID REFERENCES public.productos(id) ON DELETE SET NULL,
    producto_nombre      VARCHAR(150) NOT NULL,
    precio_unitario      NUMERIC(10, 2) NOT NULL,
    cantidad             INTEGER NOT NULL CHECK (cantidad > 0),
    color                VARCHAR(50),
    diseño_personalizado JSONB
);

ALTER TABLE public.items_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_select_propio"
    ON public.items_pedido FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedidos
            WHERE pedidos.id = items_pedido.pedido_id
              AND pedidos.usuario_id = auth.uid()
        )
    );

CREATE POLICY "items_insert_autenticado"
    ON public.items_pedido FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "items_admin_total"
    ON public.items_pedido FOR ALL USING (public.get_user_role() = 'admin');


-- =====================================================================
-- PASO 11: TABLA DE PUNTOS DE RECOMPENSA
-- =====================================================================
CREATE TABLE public.puntos_recompensa (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id      UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    puntos          INTEGER NOT NULL,
    tipo_movimiento VARCHAR(50) NOT NULL,
    descripcion     TEXT,
    fecha           TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.puntos_recompensa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "puntos_select_propio"
    ON public.puntos_recompensa FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "puntos_admin_total"
    ON public.puntos_recompensa FOR ALL USING (public.get_user_role() = 'admin');


-- =====================================================================
-- PASO 12: TABLA DE RESEÑAS
-- =====================================================================
CREATE TABLE public.reseñas (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id    UUID REFERENCES public.productos(id) ON DELETE CASCADE NOT NULL,
    usuario_nombre VARCHAR(150) NOT NULL,
    rating         INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comentario     TEXT,
    fecha          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.reseñas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reseñas_select_publico"
    ON public.reseñas FOR SELECT USING (true);

CREATE POLICY "reseñas_insert_autenticado"
    ON public.reseñas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- =====================================================================
-- PASO 13: SEED DATA
-- =====================================================================

INSERT INTO public.categorias (nombre, descripcion, slug) VALUES
  ('Tazas Personalizadas',   'Tazas de cerámica AAA, mágicas, de cristal y metal',            'tazas'),
  ('Playeras Sublimadas',    'T-shirts premium con tacto algodón y Dry-Fit deportivo',         'playeras'),
  ('Gorras Personalizadas',  'Gorras tipo trucker ajustables con broches de plástico',         'gorras'),
  ('Termos Premium',         'Termos de acero inoxidable y cilindros deportivos de aluminio',  'termos'),
  ('Artículos Promocionales','Cojines reversibles, rompecabezas de cartón y mouse pads',      'promocionales')
ON CONFLICT (nombre) DO NOTHING;


INSERT INTO public.productos
  (nombre, descripcion, precio_base, categoria_id, imagen_url, stock, tipo_3d, popularidad, dimensiones, material)
VALUES
  ('Taza de Cerámica Blanca 11oz',
   'Taza de cerámica premium AAA importada con recubrimiento de poliéster de alta durabilidad.',
   120.00, (SELECT id FROM public.categorias WHERE slug='tazas'),
   'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
   250, 'taza', 5, '9.5cm alto x 8cm diámetro', 'Cerámica Premium AAA'),

  ('Taza Mágica de 11oz',
   'Taza negra termosensible que revela el diseño personalizado al verter líquido caliente.',
   160.00, (SELECT id FROM public.categorias WHERE slug='tazas'),
   'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop',
   120, 'taza', 5, '9.5cm alto x 8.2cm diámetro', 'Cerámica Termosensible'),

  ('Playera Tacto Algodón Premium',
   'Playera de poliéster transpirable con textura tacto algodón suave al tacto y costuras reforzadas.',
   220.00, (SELECT id FROM public.categorias WHERE slug='playeras'),
   'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop',
   300, 'playera', 4, 'S, M, L, XL', 'Poliéster tacto algodón'),

  ('Gorra Trucker Ajustable',
   'Gorra clásica tipo trailera con malla de nylon trasera y frente acolchado sublimable.',
   110.00, (SELECT id FROM public.categorias WHERE slug='gorras'),
   'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=300&auto=format&fit=crop',
   150, 'gorra', 4, 'Broche ajustable (Única)', 'Poliéster y Nylon'),

  ('Termo de Acero Inoxidable 600ml',
   'Termo cilíndrico de acero inoxidable de doble pared hermético. Mantiene líquidos fríos 12 horas.',
   280.00, (SELECT id FROM public.categorias WHERE slug='termos'),
   'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=300&auto=format&fit=crop',
   90, 'termo', 5, '22cm alto x 7.3cm diámetro', 'Acero Inoxidable 304'),

  ('Cojín de Lentejuela Reversible',
   'Funda de cojín satinado con lentejuelas brillantes bicolor que muestran la impresión al deslizar.',
   180.00, (SELECT id FROM public.categorias WHERE slug='promocionales'),
   'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=300&auto=format&fit=crop',
   80, 'cushion', 4, '40cm x 40cm', 'Satín y Lentejuelas'),

  ('Mouse Pad Rectangular',
   'Alfombrilla para mouse de neopreno con base de goma antideslizante y superficie textil lisa.',
   95.00, (SELECT id FROM public.categorias WHERE slug='promocionales'),
   'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=300&auto=format&fit=crop',
   200, 'mousepad', 5, '22cm x 18cm', 'Neopreno')

ON CONFLICT DO NOTHING;


INSERT INTO public.cupones (codigo, tipo, valor, activo, limite_usos) VALUES
  ('BIENVENIDA10', 'porcentaje', 10.00, true, 500),
  ('SUBLIMAX50',   'fijo',       50.00, true, 200),
  ('CECYTEPROMO',  'porcentaje', 25.00, true, 1000)
ON CONFLICT (codigo) DO NOTHING;


-- =====================================================================
-- ✅ Schema ejecutado correctamente. Todas las tablas creadas.
-- =====================================================================
