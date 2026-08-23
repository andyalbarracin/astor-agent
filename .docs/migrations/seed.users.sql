-- ============================================================================
-- Astor · Usuarios de prueba (dev) · seed.users.sql
-- ----------------------------------------------------------------------------
-- Crea usuarios en auth.users CON contraseña (email confirmado) para el login
-- por password. El trigger handle_new_user (0001) les crea su fila en profiles.
--
-- Correr en el editor SQL de Supabase. Requiere pgcrypto (ya en extensions).
-- Idempotente: si el email existe, no lo recrea.
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
-- extensions: donde Supabase instala pgcrypto (gen_salt/crypt)
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
    confirmation_token, recovery_token, email_change, email_change_token_new,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), now(), now(),
    '', '', '', '',
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

-- Salvaguarda: GoTrue rompe ("Database error querying schema") si estas columnas
-- de token quedan en NULL. Las normalizamos a '' para cualquier fila.
update auth.users set
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
where confirmation_token is null or recovery_token is null or email_change is null
   or email_change_token_new is null or email_change_token_current is null
   or phone_change is null or phone_change_token is null or reauthentication_token is null;

-- ============================================================================
-- BORRAR tu usuario original (albarracin.andres@gmail.com) — como pediste.
-- Cascada: borra también su fila en profiles. Descomentá y corré:
-- ============================================================================
-- delete from auth.users where email = 'albarracin.andres@gmail.com';

-- ============================================================================
-- (Opcional) Ponerle password a un usuario que se creó por magic link, en vez
-- de borrarlo. Reemplazá email y password:
-- ============================================================================
-- update auth.users
-- set encrypted_password = extensions.crypt('mi-password', extensions.gen_salt('bf')),
--     email_confirmed_at = coalesce(email_confirmed_at, now())
-- where email = 'albarracin.andres@gmail.com';

-- ============================================================================
-- -- ROLLBACK (borra los usuarios de prueba y la función)
-- ============================================================================
-- delete from auth.users where email in ('juan@astor.app', 'maria@astor.app');
-- drop function if exists public.astor_create_test_user(text, text, text);
