# apps/web/public

Archivos estáticos servidos desde la raíz del sitio (`/`). Reemplazá los placeholders
con tus assets reales manteniendo el **mismo nombre y extensión**.

## Favicon
- **Actual:** `apps/web/app/icon.svg` (Next lo sirve como favicon automáticamente — pantera).
- Para un `.ico` clásico: poné `apps/web/app/favicon.ico` (Next lo prioriza).
- Para iOS: `apps/web/app/apple-icon.png` (180×180).

## Logos → `public/brand/`
- `logo.png` — logo completo (marca + wordmark), fondo transparente.
- `isologo.png` — solo el glifo pantera, transparente.
- `logo-light.png` / `logo-dark.png` — variantes por tema si hacen falta.

Mientras no existan, la UI usa el glifo vectorial `PantherMark` (no depende de imágenes).

## Login → `public/login/`
- `login-bg.jpg` — imagen de fondo del panel 60% del login (recomendado ≥ 1600×2000, oscura).
  El slider ya la referencia (`url('/login/login-bg.jpg')`) con opacidad y gradiente encima;
  si el archivo no existe, se ve solo el gradiente (no rompe).
