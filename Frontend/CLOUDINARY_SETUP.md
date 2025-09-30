# Configuración de Cloudinary para Subida de Imágenes

## 📋 Pasos para configurar Cloudinary

### 1. Crear cuenta en Cloudinary (si no tienes una)

1. Ve a [https://cloudinary.com/](https://cloudinary.com/)
2. Haz clic en "Sign Up" y crea una cuenta gratuita
3. Una vez dentro, ve a tu Dashboard

### 2. Obtener credenciales

En tu Dashboard de Cloudinary encontrarás:

- **Cloud Name** (Nombre de tu cloud)
- **API Key** (Clave de API)
- **API Secret** (Secreto de API)

### 3. Configurar variables de entorno en el Backend

1. Abre el archivo `Backend/.env` (créalo si no existe, puedes copiar `Backend/env.example`)

2. Agrega estas líneas con tus credenciales de Cloudinary:

```env
# Configuración de Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

3. **IMPORTANTE**: Nunca compartas estas credenciales públicamente ni las subas a GitHub

### 4. Configurar archivo .env en el Frontend (Opcional)

Si quieres personalizar la URL del API, crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3001
```

### 5. Estructura de carpetas en Cloudinary

Las imágenes se subirán automáticamente a la carpeta:
```
snack-party/galeria/
```

Cloudinary creará esta carpeta automáticamente la primera vez que subas una imagen.

## 🧪 Probar la configuración

1. Asegúrate de que el backend esté corriendo:
   ```bash
   cd Backend
   npm run dev
   ```

2. Asegúrate de que el frontend esté corriendo:
   ```bash
   npm run dev
   ```

3. Ve a la página de Administrar Galería
4. Inicia sesión con tu cuenta de administrador
5. Sube una imagen de prueba
6. Verifica en tu Dashboard de Cloudinary que la imagen apareció en la carpeta `snack-party/galeria`

## 🔒 Seguridad

Este sistema usa **Signed Upload** a través del backend, lo que significa que:

- ✅ Las credenciales de Cloudinary están protegidas en el servidor
- ✅ Los usuarios no pueden subir imágenes sin autenticación
- ✅ Solo los usuarios con rol Admin o Staff pueden subir imágenes
- ✅ Hay límite de tamaño de archivo (5MB)
- ✅ Solo se permiten archivos de imagen

## 📝 Características

- **Optimización automática**: Las imágenes se redimensionan a máximo 1200x800px
- **Calidad automática**: Cloudinary optimiza la calidad para web
- **Límite de tamaño**: 5MB por archivo
- **Formatos permitidos**: JPG, PNG, GIF, WEBP, etc.

## ❌ Solución de problemas

### Error: "Cannot find module 'cloudinary'"
```bash
cd Backend
npm install cloudinary
```

### Error: "Error subiendo imagen"
- Verifica que las credenciales en `Backend/.env` sean correctas
- Verifica que el servidor backend esté corriendo
- Verifica que tengas un token de autenticación válido

### Error: "Not allowed by CORS"
- Verifica que `CORS_ORIGIN` en `Backend/.env` incluya la URL de tu frontend
- Por defecto: `http://localhost:5173`

## 📚 Referencias

- [Documentación oficial de Cloudinary](https://cloudinary.com/documentation)
- [Node.js SDK de Cloudinary](https://cloudinary.com/documentation/node_integration)
