# BikeStore

Tienda en línea de bicicletas, accesorios y repuestos, con panel de administración para gestionar productos, usuarios y ventas.

## Integrantes

- Daniel Alejandro Benavides Quintero
- Juan Alejandro Sanchez Bermudez
- Yorland Insignares Escorcia

## Stack

- **Frontend:** HTML, CSS y JavaScript puro (sin frameworks ni bundler), servido como archivos estáticos.
- **Backend:** Node.js + Express.
- **Base de datos:** MySQL / [TiDB Cloud](https://tidbcloud.com) (compatible con protocolo MySQL) vía `mysql2`.
- **Autenticación:** JWT (`jsonwebtoken`) + contraseñas con `bcrypt`.
- **Correo:** `nodemailer` (recuperación de contraseña).
- **Subida de archivos:** `multer`.

## Estructura del proyecto

```
├── api/                  # Backend Express
│   ├── DB/bikeStore.sql  # Esquema de la base de datos
│   ├── uploads/          # Imágenes de productos subidas
│   ├── server.js         # Toda la API (rutas, auth, conexión a BD)
│   └── .env.example       # Plantilla de variables de entorno
└── frontend/             # Sitio estático (multi-página)
    ├── index.html
    └── assets/
        ├── pages/        # Catálogos, login, registro, dashboards admin
        ├── scripts/       # Lógica de cada página
        └── styles/
```

## Requisitos previos

- Node.js 18+
- Una base de datos MySQL o un cluster de [TiDB Cloud](https://tidbcloud.com) (tier Serverless/Starter, gratis)

## Configuración

1. Instala las dependencias del backend:

   ```bash
   cd api
   npm install
   ```

2. Copia `api/.env.example` a `api/.env` y completa tus datos:

   ```env
   DB_HOST=...
   DB_PORT=3306
   DB_USER=...
   DB_PASSWORD=...
   DB_NAME=bikeStore

   JWT_SECRET=...        # genera uno largo y aleatorio, ej: openssl rand -hex 32

   PORT=3600

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=...
   EMAIL_PASS=...         # contraseña de aplicación, no la contraseña normal de la cuenta

   FRONTEND_URL=http://localhost:5500
   ```

   > Si usas TiDB Cloud, algunas redes bloquean el puerto 4000 por defecto — el puerto 3306 (estándar de MySQL) también funciona y suele evitar ese bloqueo.

3. Crea el esquema de la base de datos ejecutando `api/DB/bikeStore.sql` contra tu base de datos.

## Ejecutar el proyecto

**Backend:**

```bash
cd api
npm start
# API disponible en http://localhost:3600
```

**Frontend** (cualquier servidor de archivos estáticos sirve, por ejemplo):

```bash
cd frontend
python -m http.server 5500
# Sitio disponible en http://localhost:5500/index.html
```

## Funcionalidades

- Catálogo público por categoría (bicicletas, accesorios, repuestos), búsqueda y productos destacados.
- Registro e inicio de sesión de clientes, con carrito de compras persistente y checkout.
- Recuperación de contraseña por correo con enlace de un solo uso (expira en 15 minutos).
- Panel de administración (rol `Administrador`): CRUD de productos, gestión de usuarios y reportes de ventas (por rango de fechas y productos más vendidos), protegido con JWT.

## Seguridad

- Contraseñas hasheadas con `bcrypt`.
- Sesiones vía JWT con expiración; el rol viaja embebido en el token para autorizar rutas de administrador.
- Rutas de administración protegidas por middleware (`verificarToken` + `requiereAdmin`).
- Whitelist de tablas en el CRUD genérico para evitar inyección SQL.
- El registro público nunca permite auto-asignarse el rol de Administrador.
- Reset de contraseña basado en token firmado (no solo el correo).
