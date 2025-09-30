const express = require('express');
const router = express.Router();
const {
  crearCotizacion,
  obtenerMisCotizaciones,
  obtenerTodasCotizaciones,
  obtenerCotizacionPorId,
  actualizarEstadoCotizacion,
  eliminarCotizacion,
  obtenerEstadisticasCotizaciones,
  guardarPersonalizacion
} = require('../controllers/cotizacion_controller');
const { authenticateToken, requireAdminOrStaff } = require('../middleware/auth');

// Rutas protegidas (todos los usuarios autenticados)
router.post('/', authenticateToken, crearCotizacion);
router.get('/mis-cotizaciones', authenticateToken, obtenerMisCotizaciones);
// Rutas específicas deben declararse antes que '/:id'
router.put('/:id/personalizacion', authenticateToken, guardarPersonalizacion);
router.put('/:id/estado', authenticateToken, requireAdminOrStaff, actualizarEstadoCotizacion);
router.delete('/:id', authenticateToken, eliminarCotizacion);
router.get('/:id', authenticateToken, obtenerCotizacionPorId);

// Rutas solo para admin/staff
router.get('/admin/todas', authenticateToken, requireAdminOrStaff, obtenerTodasCotizaciones);
router.get('/admin/estadisticas', authenticateToken, requireAdminOrStaff, obtenerEstadisticasCotizaciones);

module.exports = router;
