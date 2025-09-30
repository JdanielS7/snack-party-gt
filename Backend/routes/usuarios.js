const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasena,
  obtenerUsuarios
} = require('../controllers/usuarios_controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Rutas públicas
router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);

// Rutas protegidas
router.get('/perfil', authenticateToken, obtenerPerfil);
router.put('/perfil', authenticateToken, actualizarPerfil);
router.put('/cambiar-contrasena', authenticateToken, cambiarContrasena);

// Rutas de administrador
router.get('/', authenticateToken, requireAdmin, obtenerUsuarios);

module.exports = router;
