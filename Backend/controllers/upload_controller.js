const cloudinary = require('../config/cloudinary');

// Subir imagen a Cloudinary
const subirImagen = async (req, res) => {
  try {
    // Verificar que se envió un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Opciones de subida
    const options = {
      folder: 'snack-party/galeria',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    };

    // Subir imagen a Cloudinary usando buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      message: 'Imagen subida exitosamente',
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Error subiendo imagen a Cloudinary:', error);
    res.status(500).json({ 
      error: 'Error subiendo imagen', 
      details: error.message 
    });
  }
};

// Eliminar imagen de Cloudinary
const eliminarImagen = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: 'public_id es requerido' });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.json({ message: 'Imagen eliminada exitosamente' });
    } else {
      res.status(404).json({ error: 'Imagen no encontrada' });
    }

  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    res.status(500).json({ 
      error: 'Error eliminando imagen', 
      details: error.message 
    });
  }
};

module.exports = {
  subirImagen,
  eliminarImagen
};
