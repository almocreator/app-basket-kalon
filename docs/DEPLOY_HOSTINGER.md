# Guía de Despliegue en Hostinger (VPS)

Esta aplicación está configurada para desplegarse como una aplicación Node.js standalone.

## 1. Preparación del VPS (Ubuntu/Debian)

Asegúrate de tener instalado Node.js 18+ y MySQL.

```bash
# Instalar Node.js (usando nvm recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20

# Instalar PM2 (Gestor de procesos)
npm install -g pm2
```

## 2. Configuración de Base de Datos MySQL

1. Accede a tu base de datos MySQL (phpMyAdmin o CLI).
2. Crea una nueva base de datos (ej: `basket_kalon`).
3. Obtén la URL de conexión. Formato:
   `mysql://USUARIO:CONTRASEÑA@HOST:3306/NOMBRE_DB`

## 3. Subida de Archivos

Sube los siguientes archivos a tu carpeta en el servidor (ej: `/var/www/basket-app`):

1. Carpeta `.next/standalone` (Generada tras `npm run build`).
2. Carpeta `.next/static` -> copiar a `.next/standalone/.next/static`.
3. Carpeta `public` -> copiar a `.next/standalone/public`.
4. Archivo `prisma` (carpeta completa) -> para migraciones.

*Nota: `next.config.mjs` tiene `output: 'standalone'` activado para optimizar este proceso.*

## 4. Configuración del Entorno (.env)

En la carpeta raíz del servidor (`.next/standalone`), crea un archivo `.env` con:

```env
DATABASE_URL="mysql://..."
AUTH_SECRET="generar_con_openssl_rand_base64_32"
AUTH_URL="https://tu-dominio.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 5. Migración e Inicio

Dentro de la carpeta `.next/standalone` encontrarás el archivo `server.js` que arranca la app. En esta sección se detallan dos caminos (recomendado: ejecutar migraciones desde tu máquina local; alternativa: ejecutar migraciones en el VPS) y los pasos para levantar la app con PM2.

Nota rápida:
- Si usas Prisma, lo más recomendable es ejecutar las migraciones desde tu equipo local apuntando a la base de datos remota (evita tener que instalar dependencias de desarrollo en el servidor). Si prefieres ejecutar migraciones en el VPS sigue los pasos de abajo.

1) Preparar entorno en el VPS (opcional según tu empaquetado)

```bash
# Sitúate en la carpeta donde subiste los artefactos
cd /ruta/a/tu/app/.next/standalone

# Asegúrate de tener un .env con DATABASE_URL y demás variables
ls -la .env
```

2) (Opcional) instalar dependencias de producción

Si tu build standalone no incluye binarios que necesita Prisma u otras dependencias en tiempo de ejecución, instala las dependencias de producción:

```bash
# Instala sólo dependencias de producción (si hace falta)
npm install --production
```

3) Generar cliente Prisma / ejecutar migraciones (dos opciones)

Opción A — Recomendado: ejecutar migraciones desde tu máquina local (más seguro):

    - En tu máquina local, con DATABASE_URL apuntando a la DB remota, ejecuta:

```bash
npx prisma migrate deploy
```

Opción B — Ejecutar migraciones en el VPS (si decides hacerlo allí):

```bash
# Generar client si es necesario
npx prisma generate

# Ejecutar migraciones ya aplicadas en el entorno de producción
npx prisma migrate deploy

# Alternativa si usas deploy sin migraciones (no recomendado si necesitas migraciones con cambios destructivos):
# npx prisma db push --accept-data-loss
```

4) Iniciar la aplicación con PM2

```bash
# Arranca la app con PM2, cargando las variables de entorno desde .env
pm2 start server.js --name "basket-app" --update-env --env production

# Verifica el estado
pm2 status basket-app
pm2 logs basket-app --lines 200
```

5) Guardar configuración para reinicio automático y habilitar startup

```bash
# Guarda la lista actual de procesos
pm2 save

# Genera el comando que debes ejecutar para registrar PM2 con systemd (o el init system equivalente)
pm2 startup

# IMPORTANTE: pm2 startup imprime un comando. Ejecuta exactamente el comando que muestre (normalmente requiere sudo).
# Ejemplo (no copies textualmente sin verificar):
# sudo env PATH=$PATH:/home/usuario/.nvm/versions/node/v20/bin pm2 startup systemd -u usuario --hp /home/usuario
```

Consejos y casos especiales

- Si usas NVM (Node Version Manager), el servicio systemd puede no ver el mismo PATH. Usa el comando impreso por `pm2 startup` y adapta la variable PATH o la opción `--hp` (home path) para que apunte al home del usuario que ejecuta PM2.
- Si no quieres ejecutar migraciones en el VPS, asegúrate de haber aplicado las migraciones desde tu entorno local antes de empezar la app en producción.
- Para reiniciar la app tras cambios de configuración: `pm2 restart basket-app`.
- Para eliminar y volver a crear el proceso (por ejemplo tras actualizar server.js):

```bash
pm2 delete basket-app || true
pm2 start server.js --name "basket-app" --update-env --env production
pm2 save
```

Comprobaciones rápidas

- `pm2 show basket-app` — ver detalles del proceso
- `pm2 logs basket-app` — ver salida y errores
- Revisa que el puerto (por defecto 3000) esté abierto o que Nginx haga reverse proxy hacia `http://localhost:3000`

Checklist breve

- [ ] `.env` presente y con `DATABASE_URL`
- [ ] Migraciones aplicadas (local o VPS)
- [ ] `pm2 start server.js --update-env` → proceso en estado `online`
- [ ] `pm2 save` y ejecutar el comando impreso por `pm2 startup`

Si quieres, puedo también:
- añadir ejemplos concretos del comando `pm2 startup` para usuarios con NVM/Ubuntu, o
- generar un pequeño script `deploy.sh` para automatizar estos pasos (instalación de deps mínimas, generate/migrate y PM2). Indícame cuál prefieres.

## 6. Configuración Nginx (Reverse Proxy)

Configura Nginx para redirigir el tráfico del puerto 80/443 al puerto 3000.

```nginx
server {
    server_name tu-dominio.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
