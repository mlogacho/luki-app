# Luki Server — Guía de instalación en EC2 (Debian)

Backend Node.js + Express + SQLite para la app Luki.  
Corre en tu instancia EC2 con **Debian** (`ec2-3-135-214-120.us-east-2.compute.amazonaws.com`).

---

## Endpoints disponibles

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Iniciar sesión |
| POST | `/auth/logout` | — | Cerrar sesión |
| POST | `/auth/refresh` | — | Renovar tokens |
| GET | `/auth/me` | ✅ | Datos del usuario actual |
| POST | `/auth/change-password` | ✅ | Cambiar contraseña |
| GET | `/users` | ✅ admin | Listar usuarios |
| POST | `/users` | ✅ admin | Crear usuario + email de bienvenida |
| GET | `/users/:id` | ✅ admin | Ver usuario |
| PUT | `/users/:id` | ✅ admin | Editar usuario |
| DELETE | `/users/:id` | ✅ admin | Eliminar usuario |
| POST | `/users/:id/resend-welcome` | ✅ admin | Reenviar credenciales |
| GET | `/profiles` | ✅ | Perfiles del usuario |
| POST | `/profiles/select` | ✅ | Seleccionar perfil activo |
| GET | `/channels` | ✅ | Listar canales |
| GET | `/channels/:id` | ✅ | Ver canal |
| POST | `/channels` | ✅ admin | Crear canal |
| PUT | `/channels/:id` | ✅ admin | Editar canal |
| DELETE | `/channels/:id` | ✅ admin | Eliminar canal |
| GET | `/health` | — | Estado del servidor |

---

## Paso a paso: instalación en EC2 con Debian

### 1. Conectarse a la instancia

```bash
# Desde tu computadora, en la carpeta donde guardaste tu .pem
chmod 400 tu-clave.pem
ssh -i tu-clave.pem admin@3.135.214.120
```

> El usuario SSH por defecto en Debian (AWS) es `admin`. Si tu instancia usa otro usuario, cámbialo aquí.

---

### 2. Instalar Node.js 20

```bash
# Actualizar lista de paquetes
sudo apt-get update

# Instalar dependencias necesarias para añadir el repositorio de NodeSource
sudo apt-get install -y ca-certificates curl gnupg

# Añadir el repositorio oficial de NodeSource para Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt-get install -y nodejs

# Verificar la instalación
node --version   # debe mostrar v20.x.x
npm --version
```

---

### 3. Instalar PM2 (gestor de procesos)

```bash
sudo npm install -g pm2
```

---

### 4. Clonar o actualizar el repositorio en la instancia

Desde tu **sesión SSH en el servidor**, ejecuta este bloque tal cual —
detecta automáticamente si ya existe el repositorio:

```bash
if [ -d "$HOME/luki-app/.git" ]; then
  # El repo ya existe → solo traer cambios
  cd ~/luki-app && git pull
else
  # Primera vez → clonar
  git clone https://github.com/mlogacho/luki-app.git ~/luki-app
fi

# Entrar al backend
cd ~/luki-app/backend
```

> **¿Error "already exists and is not an empty directory"?**
> Significa que hay una carpeta `~/luki-app` pero sin historial de git.
> Elimínala y vuelve a ejecutar el bloque de arriba:
> ```bash
> rm -rf ~/luki-app
> git clone https://github.com/mlogacho/luki-app.git ~/luki-app
> cd ~/luki-app/backend
> ```

---

### 5. Instalar dependencias en el servidor

```bash
# Ya deberías estar en ~/luki-app/backend (del paso anterior)
# Si no, entra aquí:
cd ~/luki-app/backend

npm install --production
```

---

### 6. Crear el archivo .env

```bash
cp .env.example .env
nano .env
```

Edita los valores importantes:

```dotenv
PORT=3000
NODE_ENV=production

# Genera secretos seguros con:
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_ACCESS_SECRET=pega_aqui_un_secreto_largo_y_aleatorio
JWT_REFRESH_SECRET=pega_aqui_otro_secreto_largo_y_diferente

DB_PATH=./data/luki.db
CORS_ORIGIN=*

# SMTP — solo si quieres que los emails lleguen de verdad
# Si no lo configuras, las contraseñas temporales se muestran en los logs del servidor
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-app-password-de-gmail
EMAIL_FROM_NAME=Luki App
EMAIL_FROM_ADDRESS=tu-correo@gmail.com
```

Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`.

---

### 7. Crear el primer usuario superadmin

```bash
SEED_EMAIL=admin@tu-dominio.com \
SEED_PASSWORD=UnaContraseñaSegura123! \
SEED_NAME="Tu Nombre" \
node src/seed.js
```

Verás en pantalla las credenciales creadas. **Guárdalas**, las necesitas para entrar a la app.

> `SEED_EMAIL` y `SEED_PASSWORD` son **obligatorios** — el script no inicia sin ellos.

---

### 8. Iniciar el servidor con PM2

```bash
# Desde ~/luki-app/backend
pm2 start src/index.js --name luki-server
pm2 save
pm2 startup   # Copia y ejecuta el comando que te muestre para que arranque al reiniciar
```

Verifica que está corriendo:
```bash
pm2 status
curl http://localhost:3000/health
# Debe responder: {"status":"ok","ts":"..."}
```

---

### 9. Abrir el puerto 3000 en el Security Group de AWS

1. Ve a **AWS Console → EC2 → Instances** y haz clic en tu instancia `i-06774538884bd9a6c`.
2. En la pestaña **Security**, haz clic en el enlace del Security Group.
3. Haz clic en **Edit inbound rules**.
4. Agrega una regla:
   - **Type:** Custom TCP
   - **Port range:** 3000
   - **Source:** `0.0.0.0/0` (o la IP de tu app si quieres restringirlo)
5. Guarda los cambios.

---

### 10. Configurar la app Expo para que apunte a tu servidor

En el archivo `.env` de la app (en la raíz del proyecto, **no** en `backend/`):

```dotenv
EXPO_PUBLIC_API_URL=http://3.135.214.120:3000
```

> **Tip:** Para producción, usa HTTPS. Puedes colocar Nginx como reverse proxy en el mismo EC2 con un certificado Let's Encrypt.

---

## Comandos útiles en el servidor

```bash
# Ver logs en tiempo real
pm2 logs luki-server

# Ver contraseña temporal de un usuario (cuando SMTP no está configurado)
pm2 logs luki-server | grep "Password:"

# Reiniciar tras cambios
pm2 restart luki-server

# Ver estado
pm2 status
```

### Actualizar el servidor desde GitHub

Cuando hagas cambios en el código y los subas a GitHub, aplícalos en el servidor con:

```bash
cd ~/luki-app
git pull
cd backend
npm install --production   # solo si cambiaron dependencias en package.json
pm2 restart luki-server
```

---

## Configurar SMTP con Gmail (opcional pero recomendado)

1. Ve a tu cuenta Google → **Seguridad → Verificación en dos pasos** (actívala si no la tienes).
2. Busca "**Contraseñas de aplicaciones**" y crea una para "Correo / Windows Computer".
3. Copia la contraseña de 16 caracteres.
4. En el `.env` del servidor:
   ```dotenv
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=tu-correo@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop   # la contraseña de app de 16 caracteres
   ```
5. Reinicia: `pm2 restart luki-server`

---

## Estructura de archivos

```
backend/
├── src/
│   ├── index.js              # Entrada principal
│   ├── config.js             # Variables de entorno
│   ├── database.js           # SQLite + migraciones automáticas
│   ├── seed.js               # Crear primer superadmin
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── profiles.controller.js
│   │   └── channels.controller.js
│   ├── middleware/
│   │   ├── auth.js           # requireAuth / requireAdmin
│   │   └── asyncHandler.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── profiles.routes.js
│   │   └── channels.routes.js
│   ├── services/
│   │   ├── token.service.js  # JWT sign/verify
│   │   └── email.service.js  # Nodemailer welcome email
│   └── utils/
│       ├── response.js       # { data, message, success } envelope
│       └── password.js       # generateTempPassword
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
