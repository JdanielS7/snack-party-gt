# Snack Party Backend

Backend para el sistema de cotizaciones y gestión de eventos de Snack Party, desarrollado con Node.js, Express y MySQL.

## 🚀 Características

- **Autenticación JWT**: Sistema de login/registro seguro
- **Gestión de Usuarios**: Roles (Admin, Staff, Cliente)
- **Catálogo de Productos**: Barras y combos de snacks
- **Inventario**: Control de stock y productos
- **Cotizaciones**: Sistema completo de cotizaciones con personalización
- **Galería de Eventos**: Gestión de eventos realizados
- **API RESTful**: Endpoints bien documentados
- **Base de Datos MySQL**: Esquema optimizado con índices

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- MySQL (versión 8.0 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio y navegar al directorio backend:**
   ```bash
   cd Backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   # Configuración de la base de datos MySQL
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password_aqui
   DB_NAME=snack_party
   DB_PORT=3306

   # Configuración del servidor
   PORT=3001
   NODE_ENV=development

   # JWT Secret para autenticación
   JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

   # Configuración de CORS
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Configurar la base de datos:**
   - Crear la base de datos MySQL ejecutando el script `database/schema.sql`
   - O ejecutar manualmente en MySQL:
   ```sql
   mysql -u root -p < database/schema.sql
   ```

5. **Ejecutar el servidor:**
   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev
   
   # Modo producción
   npm start
   ```

## 📊 Estructura de la Base de Datos

### Tablas Principales:
- **Usuarios**: Gestión de usuarios con roles
- **Inventario_Productos**: Productos disponibles
- **Catalogo_Items**: Items del catálogo (Barras/Combos)
- **Catalogo_Detalle**: Relación entre items y productos
- **Cotizaciones**: Solicitudes de cotización
- **Cotizacion_Detalle**: Items en cada cotización
- **Personalizacion_Snacks**: Personalización de barras
- **Galeria_Eventos**: Eventos realizados

## 🔗 Endpoints de la API

### Autenticación
- `POST /api/usuarios/registro` - Registrar nuevo usuario
- `POST /api/usuarios/login` - Iniciar sesión
- `GET /api/usuarios/perfil` - Obtener perfil (requiere auth)
- `PUT /api/usuarios/perfil` - Actualizar perfil (requiere auth)

### Catálogo
- `GET /api/catalogo` - Obtener todos los items
- `GET /api/catalogo/:id` - Obtener item específico
- `POST /api/catalogo` - Crear item (Admin/Staff)
- `PUT /api/catalogo/:id` - Actualizar item (Admin/Staff)
- `DELETE /api/catalogo/:id` - Eliminar item (Admin/Staff)

### Inventario
- `GET /api/inventario` - Obtener productos
- `GET /api/inventario/stock-bajo` - Productos con stock bajo
- `GET /api/inventario/estadisticas` - Estadísticas del inventario
- `POST /api/inventario` - Crear producto (Admin/Staff)
- `PUT /api/inventario/:id/stock` - Actualizar stock (Admin/Staff)

### Cotizaciones
- `POST /api/cotizaciones` - Crear cotización (requiere auth)
- `GET /api/cotizaciones/mis-cotizaciones` - Mis cotizaciones (requiere auth)
- `GET /api/cotizaciones/:id` - Obtener cotización específica
- `PUT /api/cotizaciones/:id/estado` - Actualizar estado (Admin/Staff)

### Galería
- `GET /api/galeria` - Obtener eventos
- `GET /api/galeria/destacados` - Eventos destacados
- `GET /api/galeria/buscar?q=texto` - Buscar eventos
- `POST /api/galeria` - Crear evento (Admin/Staff)

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header:

```
Authorization: Bearer tu_token_aqui
```

### Roles de Usuario:
- **Cliente**: Puede crear cotizaciones y ver su perfil
- **Staff**: Puede gestionar inventario, catálogo y cotizaciones
- **Admin**: Acceso completo al sistema

## 📝 Ejemplos de Uso

### Registrar Usuario:
```bash
curl -X POST http://localhost:3001/api/usuarios/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_completo": "Juan Pérez",
    "correo": "juan@ejemplo.com",
    "telefono": "1234567890",
    "contrasena": "mi_password"
  }'
```

### Crear Cotización:
```bash
curl -X POST http://localhost:3001/api/cotizaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token" \
  -d '{
    "direccion_evento": "Calle 123, Ciudad",
    "fecha_evento": "2024-12-25",
    "hora_evento": "18:00",
    "tipo_evento": "Cumpleaños",
    "num_invitados": 50,
    "items": [
      {"id_item": 1, "cantidad": 2},
      {"id_item": 3, "cantidad": 1}
    ]
  }'
```

## 🧪 Testing

Para probar la API, puedes usar:
- **Postman**: Importa la colección de endpoints
- **Thunder Client** (VS Code): Cliente REST integrado
- **curl**: Comandos de línea de comandos

## 🔧 Configuración de Desarrollo

### Variables de Entorno Importantes:
- `DB_HOST`: Host de MySQL (default: localhost)
- `DB_USER`: Usuario de MySQL (default: root)
- `DB_PASSWORD`: Contraseña de MySQL
- `DB_NAME`: Nombre de la base de datos (default: snack_party)
- `JWT_SECRET`: Clave secreta para JWT (¡cambiar en producción!)
- `CORS_ORIGIN`: Origen permitido para CORS

### Usuario Admin por Defecto:
- **Email**: admin@snackparty.com
- **Contraseña**: admin123
- **Rol**: Admin

⚠️ **Importante**: Cambiar la contraseña del admin en producción.

## 📁 Estructura del Proyecto

```
Backend/
├── controllers/          # Controladores de la API
├── routes/              # Definición de rutas
├── database/            # Scripts de base de datos
├── uploads/             # Archivos subidos (imágenes)
├── db.js               # Configuración de MySQL
├── server.js           # Servidor principal
├── package.json        # Dependencias y scripts
└── README.md          # Este archivo
```

## 🚨 Solución de Problemas

### Error de Conexión a MySQL:
1. Verificar que MySQL esté ejecutándose
2. Comprobar credenciales en `.env`
3. Verificar que la base de datos `snack_party` existe

### Error de CORS:
1. Verificar `CORS_ORIGIN` en `.env`
2. Asegurar que el frontend esté en el puerto correcto

### Error de JWT:
1. Verificar que `JWT_SECRET` esté configurado
2. Comprobar que el token esté en el header correcto

## 📞 Soporte

Para soporte técnico o reportar bugs, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la licencia ISC.










