const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configurar el transporter de nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Puedes cambiar a otro servicio
    auth: {
      user: process.env.EMAIL_USER, // Tu email
      pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación
    }
  });
};

// Función para enviar email al administrador
const sendEmailToAdmin = async (subject, htmlContent, textContent) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Email del administrador
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

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

    // Enviar email al administrador
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

// Endpoint de prueba para verificar configuración de email
router.get('/test-email', async (req, res) => {
  try {
    console.log('Variables de email:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configurada' : 'No configurada');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
    
    const transporter = createTransporter();
    
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'Prueba de Email - Snack Party',
      html: '<h2>Prueba de Email</h2><p>Este es un email de prueba para verificar la configuración.</p>',
      text: 'Prueba de Email - Este es un email de prueba para verificar la configuración.'
    };

    const result = await transporter.sendMail(testEmail);
    console.log('Email de prueba enviado:', result.messageId);
    
    res.json({ 
      success: true, 
      message: 'Email de prueba enviado correctamente',
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Error en prueba de email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: {
        emailUser: process.env.EMAIL_USER,
        emailPass: process.env.EMAIL_PASS ? 'Configurada' : 'No configurada',
        adminEmail: process.env.ADMIN_EMAIL
      }
    });
  }
});

module.exports = router;
