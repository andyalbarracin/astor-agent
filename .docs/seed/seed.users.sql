-- ============================================================================
-- Astor · Usuarios de prueba (dev) · seed.users.sql
-- ----------------------------------------------------------------------------
-- Crea usuarios en auth.users CON contraseña (email confirmado) para testear
-- el login por password. El trigger handle_new_user (migración 0001) les crea
-- su fila en public.profiles automáticamente.
--
-- Correr en el editor SQL de Supabase. Requiere pgcrypto (migración 0000).
-- Idempotente: si el email ya existe, no lo recrea.
--
-- Password de todos: astor1234
-- ============================================================================

create or replace function public.astor_create_test_user(
  p_email text,
  p_password text,
  p_name text
)
returns uuid
language plpgsql
security definer
-- extensions: donde Supabase instala pgcrypto (gen_salt/crypt/gen_random_uuid)
set search_path = auth, public, extensions
as $$
declare
  uid uuid;
begin
  select id into uid from auth.users where email = p_email;
  if uid is not null then
    return uid;
  end if;

  uid := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('display_name', p_name),
    false, false
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, uid::text,
    jsonb_build_object('sub', uid::text, 'email', p_email),
    'email', now(), now(), now()
  );

  return uid;
end;
$$;

-- Crear los usuarios de prueba ------------------------------------------------
select public.astor_create_test_user('juan@astor.app',  'astor1234', 'Juan Pérez');
select public.astor_create_test_user('maria@astor.app', 'astor1234', 'María Gómez');

-- (Opcional) darle contraseña a tu propio usuario ya creado por magic link:
--   update auth.users
--   set encrypted_password = crypt('tu-password', gen_salt('bf')),
--       email_confirmed_at = coalesce(email_confirmed_at, now())
--   where email = 'albarracin.andres@gmail.com';

-- ============================================================================
-- -- ROLLBACK (borra los usuarios de prueba y sus datos en cascada)
-- ============================================================================
-- delete from auth.users where email in ('juan@astor.app', 'maria@astor.app');
-- drop function if exists public.astor_create_test_user(text, text, text);
