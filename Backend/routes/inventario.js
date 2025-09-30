const express = require('express');
const router = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStock,
  obtenerProductosStockBajo,
  obtenerEstadisticasInventario
} = require('../controllers/inventario_controller');
const { authenticateToken, requireAdminOrStaff, requireAdmin } = require('../middleware/auth');

// Rutas públicas (solo lectura)
router.get('/', obtenerProductos);
router.get('/stock-bajo', obtenerProductosStockBajo);
router.get('/estadisticas', obtenerEstadisticasInventario);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas (admin/staff)
router.post('/', authenticateToken, requireAdminOrStaff, crearProducto);
router.put('/:id', authenticateToken, requireAdminOrStaff, actualizarProducto);
router.put('/:id/stock', authenticateToken, requireAdminOrStaff, actualizarStock);

// Rutas solo para admin
router.delete('/:id', authenticateToken, requireAdmin, eliminarProducto);

module.exports = router;
