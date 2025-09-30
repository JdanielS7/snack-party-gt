const express = require('express');
const router = express.Router();
const {
  obtenerEventos,
  obtenerEventoPorId,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  obtenerEventosDestacados,
  obtenerTiposEventos,
  buscarEventos,
  obtenerEstadisticasGaleria
} = require('../controllers/galeria_controller');
const { authenticateToken, requireAdminOrStaff, requireAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', obtenerEventos);
router.get('/destacados', obtenerEventosDestacados);
router.get('/tipos', obtenerTiposEventos);
router.get('/buscar', buscarEventos);
router.get('/:id', obtenerEventoPorId);

// Rutas protegidas (admin/staff)
router.post('/', authenticateToken, requireAdminOrStaff, crearEvento);
router.put('/:id', authenticateToken, requireAdminOrStaff, actualizarEvento);
router.get('/admin/estadisticas', authenticateToken, requireAdminOrStaff, obtenerEstadisticasGaleria);

// Rutas solo para admin
router.delete('/:id', authenticateToken, requireAdmin, eliminarEvento);

module.exports = router;
