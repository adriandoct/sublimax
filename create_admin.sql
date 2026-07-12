-- =====================================================================
-- SUBLIMAX STUDIO - Crear cuenta Administrador
-- Ejecuta este script en: Supabase Dashboard → SQL Editor
-- =====================================================================

-- Paso 1: Crear el usuario en auth.users de Supabase
-- (El trigger handle_new_user creará automáticamente el perfil en public.usuarios)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@admin.com',
  crypt('12345678Cecyte', gen_salt('bf')),
  now(),                                          -- email confirmado al instante
  '{"provider":"email","providers":["email"]}',
  '{"nombre": "Administrador General", "role": "admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Paso 2: Asegurar que el perfil en public.usuarios tenga rol 'admin'
-- (por si el trigger ya corrió con rol diferente)
UPDATE public.usuarios
SET role = 'admin', nombre = 'Administrador General'
WHERE email = 'admin@admin.com';

-- Verificación: debe mostrar el usuario admin con role='admin'
SELECT id, email, nombre, role, fecha_registro
FROM public.usuarios
WHERE email = 'admin@admin.com';
