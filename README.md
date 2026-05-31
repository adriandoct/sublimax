# SUBLIMAX Studio - Plataforma de Sublimación Interactiva 3D

SUBLIMAX Studio es una plataforma web innovadora para la personalización y venta de productos por sublimación (tazas, playeras, gorras, termos, etc.). Permite a los usuarios diseñar sus productos en 3D en tiempo real, generar artes con Inteligencia Artificial, visualizar maquetas con Realidad Aumentada y gestionar presupuestos masivos B2B.

---

## 🚀 Instalación y Desarrollo Local

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre tu navegador en [http://localhost:5173](http://localhost:5173).

---

## 🛢️ Configuración de Base de Datos Supabase (Opcional)

Por defecto, la plataforma se ejecuta en **Modo Sandbox Local** usando `localStorage`, permitiendo que sea interactiva desde el primer instante sin credenciales.

Para conectarla con tu base de datos en Supabase:
1. Crea las tablas ejecutando las consultas del archivo [supabase_schema.sql](file:///c:/Users/Dell/Latitude/i7/8th/Documents/tsublimi/supabase_schema.sql) en el **SQL Editor** de tu consola de Supabase.
2. Copia tus credenciales desde Supabase (**Settings -> API**).
3. Renombra o crea el archivo `.env` en la raíz del proyecto y agrega tus claves:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-public-key
   ```
La aplicación detectará las variables de entorno y cambiará automáticamente al modo sincronizado con Supabase.

---

## 🐙 Cómo subir el código a GitHub

Para sincronizar este proyecto local con tu repositorio remoto de GitHub (`https://github.com/adriandoct/sublimax.git`):

1. Inicializa el repositorio Git en la carpeta del proyecto (si no está inicializado):
   ```bash
   git init
   ```

2. Añade la dirección de tu repositorio remoto:
   ```bash
   git remote add origin https://github.com/adriandoct/sublimax.git
   ```

3. Agrega todos los archivos al commit (el archivo `.gitignore` evitará que subas el archivo `.env` con tus credenciales secretas):
   ```bash
   git add .
   ```

4. Crea tu primer commit:
   ```bash
   git commit -m "feat: initial commit sublimax studio 3d"
   ```

5. Sube tus cambios a la rama principal (usualmente `main` o `master`):
   ```bash
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Despliegue en Render (Static Site)

Al ser una aplicación basada en React, TypeScript y Vite, puedes alojarla en Render como un sitio estático gratuito:

1. Ve a tu panel de [Render](https://dashboard.render.com) y selecciona **New -> Static Site**.
2. Conecta tu cuenta de GitHub y selecciona el repositorio **sublimax**.
3. En la configuración del despliegue ingresa los siguientes campos:
   * **Build Command (Comando de compilación):** `npm run build`
   * **Publish Directory (Carpeta de publicación):** `dist`
4. **Redirecciones de Rutas (SPA Rewrites)** (Importante para evitar errores 404 al recargar):
   * Ve a la pestaña **Redirects/Rewrites** de tu servicio en Render.
   * Haz clic en **Add Rule**.
   * Configura:
     * **Source:** `/*`
     * **Destination:** `/index.html`
     * **Action:** `Rewrite`
5. **Variables de Entorno en Producción:**
   * Si conectas Supabase, ve a la pestaña **Environment** en Render.
   * Añade las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con tus claves reales. Render compilará tu aplicación con estas variables listas para producción.
