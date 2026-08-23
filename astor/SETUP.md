# Astor — Setup / provisioning (Fase 0)

Runbook manual. La infraestructura externa es un **prerequisito**: no se automatiza.

## 1. Requisitos locales
- Node ≥ 20.11 (`.nvmrc`) · `corepack enable` para pnpm 9.
- `pnpm install` en `astor/`.

## 2. Proyecto Supabase (fresco)
1. Crear un proyecto en https://supabase.com.
2. Project Settings → API: copiar `URL`, `anon key`, `service_role key`.
3. Editor SQL → pegar y correr **en orden**:
   - `../.docs/migrations/0000_extensions_and_helpers.sql`
   - `../.docs/migrations/0001_profiles.sql`
   (Cada migración es pegable sin editar. La fuente de verdad es `.docs/migrations/`.)
4. Auth → habilitar email + magic link (se usa en Fase 0c).

## 3. Variables de entorno
1. Raíz (referencia): `cp .env.example .env.local`.
2. Web app (Next lee el `.env` del dir del app): `cp apps/web/.env.example apps/web/.env.local`.
3. Completar al menos: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`.

## 4. Bootstrap del owner
Después de registrarte una vez (Fase 0c crea la fila en `profiles` automáticamente), correr en el
editor SQL, reemplazando el uuid por tu `auth.users.id` (= `ASTOR_OWNER_USER_ID`):

```sql
update public.profiles
set role = 'owner', agent_enabled = true
where user_id = '<ASTOR_OWNER_USER_ID>';
```

## 5. Hosting (Vercel)
- Conectar el repo, root del proyecto web = `apps/web`.
- Cargar las mismas env vars en Vercel (Project Settings → Environment Variables).
- Las superficies de agente (REST/MCP/Telegram/cron) corren como route handlers del mismo deploy.

## Verificación de Fase 0a
- `pnpm install && pnpm turbo build` verdes.
- `0000` + `0001` corren en Supabase sin editar.
- `.docs/` completo y `market-analysis.md` movido a `.docs/`.
