const express = require('express');
const router = express.Router();
const multer = require('multer');
const { subirImagen, eliminarImagen } = require('../controllers/upload_controller');
const { authenticateToken, requireAdminOrStaff } = require('../middleware/auth');

// Configurar multer para guardar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Rutas protegidas (admin/staff)
router.post('/imagen', authenticateToken, requireAdminOrStaff, upload.single('file'), subirImagen);
router.delete('/imagen', authenticateToken, requireAdminOrStaff, eliminarImagen);

module.exports = router;
