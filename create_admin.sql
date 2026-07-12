-- =====================================================================
-- SUBLIMAX STUDIO - Crear cuenta Administrador
-- Ejecuta este script en: Supabase Dashboard → SQL Editor
-- =====================================================================

-- Paso 1: Crear el usuario en auth.users
-- Usamos WHERE NOT EXISTS para evitar duplicados (auth.users no expone
-- su constraint de email para ON CONFLICT directamente)
DO $$
DECLARE
  new_uid UUID := gen_random_uuid();
BEGIN

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@admin.com') THEN
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
      new_uid,
      'authenticated',
      'authenticated',
      'admin@admin.com',
      crypt('12345678Cecyte', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"nombre": "Administrador General", "role": "admin"}',
      now(),
      now(),
      '', '', '', ''
    );
    RAISE NOTICE 'Usuario admin creado con ID: %', new_uid;
  ELSE
    RAISE NOTICE 'El usuario admin@admin.com ya existe. Solo actualizando rol.';
  END IF;

END $$;


-- Paso 2: Asegurar rol 'admin' en public.usuarios
-- (cubre el caso en que el trigger corrió antes o con rol diferente)
INSERT INTO public.usuarios (id, email, nombre, role, fecha_registro)
  SELECT id, email, 'Administrador General', 'admin'::public.rol_usuario, now()
  FROM auth.users
  WHERE email = 'admin@admin.com'
ON CONFLICT (id) DO UPDATE
  SET role = 'admin'::public.rol_usuario,
      nombre = 'Administrador General';


-- Verificación final: debe mostrar role = 'admin'
SELECT u.id, u.email, u.nombre, u.role, u.fecha_registro
FROM public.usuarios u
WHERE u.email = 'admin@admin.com';
