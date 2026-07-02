# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BikeStore — an online store for bikes, accessories and parts, with an admin panel for products, users and sales. No frameworks: plain HTML/CSS/JS frontend + a single-file Express backend.

## Commands

```bash
# Backend
cd api
npm install
npm start          # node server.js — API on http://localhost:3600 (or $PORT)

# Frontend — any static file server works, e.g.:
cd frontend
python -m http.server 5500   # site on http://localhost:5500/index.html
```

There is no test suite, linter, or build step (`npm test` is a stub). No `nodemon` script is defined even though `nodemon` is a dependency — restart manually or run `npx nodemon server.js` from `api/`.

Setup: copy `api/.env.example` to `api/.env` and fill in DB (TiDB Cloud/MySQL), `JWT_SECRET`, SMTP, and `FRONTEND_URL`. Create the schema by running `api/DB/bikeStore.sql` against the target database.

## Architecture

**Backend (`api/server.js`)** — the entire API is one file: Express app, MySQL pool, auth middleware, and all routes. There's no router/controller/model split; when adding endpoints, follow the existing pattern of route handlers defined inline in this file.

- **DB access**: a `mysql2` pool (`conexion`), not a single connection — TiDB Cloud drops idle connections, so the pool recovers automatically instead of needing manual reconnect logic. `conexion.query` is promisified at startup; some handlers use that promisified form with `.then`/`await`, others use `conexion.promise().query(...)`, and a few still use raw callbacks — match whichever style the surrounding handler already uses.
- **Auth**: JWT-based (`jsonwebtoken`), no sessions. `verificarToken` middleware requires a valid `Authorization: Bearer <token>` header and sets `req.usuario`. `requiereAdmin` (must run after `verificarToken`) requires `req.usuario.rol === "Administrador"`. Tokens embed `{ id, correo, rol }` and expire in 30m for login, 15m for password-reset tokens (which carry `proposito: "reset-password"` instead of a role, and are validated by checking that field).
- **Generic CRUD**: `/api/:tabla` (GET/POST/PUT/DELETE, admin-only) operates on a table name taken from the URL. `TABLAS_PERMITIDAS` is a hardcoded whitelist (`usuarios`, `productos`, `ventas`, `detalle_ventas`) checked by `validarTabla()` before any query — never interpolate a table name into SQL without going through this whitelist. This generic route is defined last so more specific product/category/user routes (e.g. `/api/productos/destacados`, `/api/productos/:id`) take precedence.
- **Product category endpoints** (`/api/productos/bicicletas|accesorios|repuestos`) all call the shared `obtenerProductosPorCategoria()` helper — extend that helper rather than duplicating its logic if behavior needs to change across categories.
- **Stock**: `productos.stock` is a MySQL virtual column (`entradas - salidas`). Sales (`POST /api/ventas`) check `entradas - salidas` against requested quantity before inserting, then insert into `ventas` + `detalle_ventas` and increment `salidas` — do this stock check/update pattern for any new code that consumes stock.
- **Uploads**: `multer` stores product images on disk in `api/uploads/` (gitignored) with a `Date.now()`-based filename, limited to 5MB and JPEG/PNG/WEBP. Served statically at `/uploads`. `producto.imagen_url` is synthesized as `/uploads/${imagen}` in every read endpoint — keep that consistent if adding new product read paths.
- **Registration** (`/api/register` and the generic `POST /api/usuarios`) explicitly whitelists which fields get inserted — never let client input set `rol` directly; public signups are hardcoded to `"Cliente"`.

**Frontend (`frontend/`)** — static multi-page site, no bundler, no framework.
- `assets/pages/` — one HTML file per page (catalog pages per category, login, register, password reset/recovery, admin dashboards).
- `assets/scripts/` — one JS file per page, mostly matching HTML filenames (e.g. `catalogo-bicicletas.html` ↔ `catalogo-bicicletas.js`).
- `assets/styles/` — one CSS file per page/section, same pairing convention.
- The API base URL `http://localhost:3600` is hardcoded across ~14 script files (no shared config/constants file) — if the API origin changes, all of them need updating.
- Auth token lives in `localStorage` (`token`); `auth.js` verifies it against `GET /api/user` on page load and renders login/logout UI accordingly.
- Cart (`carrito` / `carritoAnonimo` in `localStorage`) persists across sessions; an anonymous cart gets merged into the user's cart on login (see `catalogo.js`).
- User-facing strings and all comments are in Spanish; match that when editing existing files.
- Server responses are rendered via `innerHTML` in several places — always pass user/DB-derived text through the local `escapeHTML()` helper (duplicated per script) before interpolating into HTML, to avoid XSS.

## Database

MySQL-compatible (TiDB Cloud in practice), schema in `api/DB/bikeStore.sql`. Four tables: `usuarios` (role enum `Cliente`/`Administrador`), `productos` (category enum `Bicicletas`/`Accesorios`/`Repuestos`, `stock` virtual column), `ventas`, `detalle_ventas` (FKs to `ventas`/`productos`). The connection uses TLS (`minVersion: TLSv1.2`, `rejectUnauthorized: true`).

## Security notes already in place

- Passwords hashed with `bcrypt`.
- Password reset requires a signed, single-use, time-limited JWT (not just knowing the email); `forgot-password` always returns a generic success message regardless of whether the email exists, to avoid user enumeration.
- Admin routes are consistently double-protected with `verificarToken` + `requiereAdmin`.
- SQL uses parameterized queries throughout except the generic CRUD's table name, which goes through the `TABLAS_PERMITIDAS` whitelist instead.
