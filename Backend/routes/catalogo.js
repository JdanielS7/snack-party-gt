const express = require('express');
const router = express.Router();
const {
  obtenerItems,
  obtenerItemPorId,
  crearItem,
  actualizarItem,
  eliminarItem,
  agregarProductoAItem,
  removerProductoDeItem,
  actualizarImagenItem
} = require('../controllers/catalogo_controller');
const { authenticateToken, requireAdminOrStaff } = require('../middleware/auth');

// Rutas públicas
router.get('/', obtenerItems);
router.get('/:id', obtenerItemPorId);

// Rutas protegidas (solo admin/staff)
router.post('/', authenticateToken, requireAdminOrStaff, crearItem);
router.put('/:id', authenticateToken, requireAdminOrStaff, actualizarItem);
router.delete('/:id', authenticateToken, requireAdminOrStaff, eliminarItem);
router.post('/:id/productos', authenticateToken, requireAdminOrStaff, agregarProductoAItem);
router.delete('/:id/productos/:id_producto', authenticateToken, requireAdminOrStaff, removerProductoDeItem);
router.put('/:id/imagen', authenticateToken, requireAdminOrStaff, actualizarImagenItem);

module.exports = router;
