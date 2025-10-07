const express = require('express');
const { sendEmailToAdmin, verifyTransporter, getEmailDebugInfo } = require('../utils/email');
const router = express.Router();

// sendEmailToAdmin ahora se importa desde utils/email con reintentos y timeouts

// POST /api/contact - Enviar mensaje de contacto
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Crear contenido del email
    const subject = `Nuevo mensaje de contacto - Snack Party`;
    const htmlContent = `
      <h2>Nuevo mensaje de contacto recibido</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>Enviado desde el formulario de contacto de Snack Party</em></p>
    `;
    const textContent = `
      Nuevo mensaje de contacto recibido
      
      Nombre: ${name}
      Email: ${email}
      Mensaje: ${message}
      
      Enviado desde el formulario de contacto de Snack Party
    `;

    // Enviar email al administrador (manejo de ETIMEDOUT con reintento 465/587)
    const emailResult = await sendEmailToAdmin(subject, htmlContent, textContent);
    
    if (!emailResult.success) {
      console.error('Error enviando email:', emailResult.error);
      // No fallar la operación si el email falla, solo loguear
    }

    res.json({ 
      message: 'Mensaje enviado correctamente',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Error en contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint de prueba para verificar configuración de email y conectividad
router.get('/test-email', async (req, res) => {
  try {
    const debugInfo = getEmailDebugInfo();
    const verify = await verifyTransporter();

    if (!debugInfo.user || !debugInfo.passConfigured) {
      return res.status(400).json({ success: false, error: 'EMAIL_USER/PASS faltantes', debugInfo, verify });
    }

    // no enviar correo real aquí para pruebas de conectividad
    res.json({ success: verify.ok, verify, debugInfo });
  } catch (error) {
    console.error('Error en prueba de email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

module.exports = router;
