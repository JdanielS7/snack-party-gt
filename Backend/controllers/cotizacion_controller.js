const { executeQuery } = require('../db');
const nodemailer = require('nodemailer');

// Configurar el transporter de nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Función para enviar email al administrador
const sendEmailToAdmin = async (subject, htmlContent, textContent) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
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

// Crear nueva cotización
const crearCotizacion = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      direccion_evento,
      fecha_evento,
      hora_evento,
      tipo_evento,
      num_invitados,
      solicitudes_especiales,
      items,
      personalizacion_snacks
    } = req.body;

    // Validaciones básicas
    if (!direccion_evento || !fecha_evento || !tipo_evento || !num_invitados) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: direccion_evento, fecha_evento, tipo_evento, num_invitados'
      });
    }

    if (num_invitados <= 0) {
      return res.status(400).json({ error: 'El número de invitados debe ser mayor a 0' });
    }

    // Validar fecha del evento (no puede ser en el pasado)
    const fechaEvento = new Date(fecha_evento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaEvento < hoy) {
      return res.status(400).json({ error: 'La fecha del evento no puede ser en el pasado' });
    }

    // Iniciar transacción
    const connection = await require('../db').getConnection();
    await connection.beginTransaction();

    try {
      // Crear la cotización
      const cotizacionResult = await connection.execute(`
        INSERT INTO Cotizaciones (
          id_usuario, direccion_evento, fecha_evento, hora_evento, 
          tipo_evento, num_invitados, solicitudes_especiales
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [userId, direccion_evento, fecha_evento, hora_evento, tipo_evento, num_invitados, solicitudes_especiales]);

      const cotizacionId = cotizacionResult[0].insertId;

      // Agregar items a la cotización si se proporcionan
      if (items && items.length > 0) {
        for (const item of items) {
          if (!item.id_item || !item.cantidad || item.cantidad <= 0) {
            throw new Error('Cada item debe tener id_item y cantidad válida');
          }

          // Verificar que el item existe y está activo
          const itemExists = await connection.execute(
            'SELECT id_item FROM Catalogo_Items WHERE id_item = ? AND estado = "Activo"',
            [item.id_item]
          );

          if (itemExists[0].length === 0) {
            throw new Error(`Item con ID ${item.id_item} no encontrado o inactivo`);
          }

          await connection.execute(`
            INSERT INTO Cotizacion_Detalle (id_cotizacion, id_item, cantidad)
            VALUES (?, ?, ?)
          `, [cotizacionId, item.id_item, item.cantidad]);
        }
      }

      // No exigir personalización en creación de cotización. Se gestionará en endpoint dedicado.
      if (personalizacion_snacks) {
        // Opcionalmente se puede ignorar en este paso para forzar flujo en página de personalización.
        // Dejamos sin insertar aquí para evitar datos inconsistentes si luego cambian items.
      }

      await connection.commit();

      // Obtener datos del usuario para el email
      const [usuario] = await connection.execute(
        'SELECT nombre_completo, correo FROM Usuarios WHERE id_usuario = ?',
        [userId]
      );

      // Enviar notificación por email al administrador
      const subject = `Nueva cotización recibida - Snack Party #${cotizacionId}`;
      const htmlContent = `
        <h2>Nueva cotización recibida</h2>
        <p><strong>Número de cotización:</strong> #${cotizacionId}</p>
        <p><strong>Cliente:</strong> ${usuario[0]?.nombre_completo || 'N/A'}</p>
        <p><strong>Email:</strong> ${usuario[0]?.correo || 'N/A'}</p>
        <p><strong>Tipo de evento:</strong> ${tipo_evento}</p>
        <p><strong>Fecha del evento:</strong> ${fecha_evento}</p>
        <p><strong>Número de invitados:</strong> ${num_invitados}</p>
        <p><strong>Dirección:</strong> ${direccion_evento}</p>
        ${solicitudes_especiales ? `<p><strong>Solicitudes especiales:</strong> ${solicitudes_especiales}</p>` : ''}
        <p><strong>Items solicitados:</strong> ${items.length} items</p>
        ${personalizacion_snacks ? '<p><strong>Incluye personalización de snacks</strong></p>' : ''}
        <hr>
        <p><em>Revisa la bandeja de cotizaciones para más detalles</em></p>
      `;
      const textContent = `
        Nueva cotización recibida
        
        Número de cotización: #${cotizacionId}
        Cliente: ${usuario[0]?.nombre_completo || 'N/A'}
        Email: ${usuario[0]?.correo || 'N/A'}
        Tipo de evento: ${tipo_evento}
        Fecha del evento: ${fecha_evento}
        Número de invitados: ${num_invitados}
        Dirección: ${direccion_evento}
        ${solicitudes_especiales ? `Solicitudes especiales: ${solicitudes_especiales}` : ''}
        Items solicitados: ${items.length} items
        ${personalizacion_snacks ? 'Incluye personalización de snacks' : ''}
        
        Revisa la bandeja de cotizaciones para más detalles
      `;

      // Enviar email (no bloquear la respuesta si falla)
      sendEmailToAdmin(subject, htmlContent, textContent).catch(err => {
        console.error('Error enviando email de cotización:', err);
      });

      res.status(201).json({
        message: 'Cotización creada exitosamente',
        cotizacion: {
          id_cotizacion: cotizacionId,
          id_usuario: userId,
          direccion_evento,
          fecha_evento,
          hora_evento,
          tipo_evento,
          num_invitados,
          solicitudes_especiales,
          estado: 'Pendiente'
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creando cotización:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};

// Obtener cotizaciones del usuario autenticado
const obtenerMisCotizaciones = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { estado } = req.query;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offsetNum = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        c.id_cotizacion,
        c.direccion_evento,
        c.fecha_evento,
        c.hora_evento,
        c.tipo_evento,
        c.num_invitados,
        c.solicitudes_especiales,
        c.estado,
        c.fecha_creacion
      FROM Cotizaciones c
      WHERE c.id_usuario = ?
    `;
    
    const params = [userId];

    if (estado) {
      query += ' AND c.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY c.fecha_creacion DESC';

    // Obtener total para paginación
    let countQuery = 'SELECT COUNT(*) as total FROM Cotizaciones WHERE id_usuario = ?';
    const countParams = [userId];
    
    if (estado) {
      countQuery += ' AND estado = ?';
      countParams.push(estado);
    }

    const [cotizaciones, countResult] = await Promise.all([
      executeQuery(`${query} LIMIT ${limitNum} OFFSET ${offsetNum}`, params),
      executeQuery(countQuery, countParams)
    ]);

    // Para cada cotización, obtener los items
    for (let cotizacion of cotizaciones) {
      const items = await executeQuery(`
        SELECT 
          cd.cantidad,
          ci.id_item,
          ci.nombre,
          ci.descripcion,
          ci.tipo,
          ci.imagen_url
        FROM Cotizacion_Detalle cd
        JOIN Catalogo_Items ci ON cd.id_item = ci.id_item
        WHERE cd.id_cotizacion = ?
      `, [cotizacion.id_cotizacion]);

      cotizacion.items = items;

      // Obtener personalización si existe
      const personalizacion = await executeQuery(`
        SELECT frutas_seleccionadas, chips_seleccionados, toppings_seleccionados
        FROM Personalizacion_Snacks
        WHERE id_cotizacion = ?
      `, [cotizacion.id_cotizacion]);

      cotizacion.personalizacion_snacks = personalizacion[0] || null;
    }

    const total = countResult[0].total;

    res.json({
      cotizaciones,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error obteniendo cotizaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todas las cotizaciones (solo admin/staff)
const obtenerTodasCotizaciones = async (req, res) => {
  try {
    const { estado } = req.query;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offsetNum = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        c.id_cotizacion,
        c.id_usuario,
        c.direccion_evento,
        c.fecha_evento,
        c.hora_evento,
        c.tipo_evento,
        c.num_invitados,
        c.solicitudes_especiales,
        c.estado,
        c.fecha_creacion,
        u.nombre_completo,
        u.correo,
        u.telefono
      FROM Cotizaciones c
      JOIN Usuarios u ON c.id_usuario = u.id_usuario
      WHERE 1=1
    `;
    
    const params = [];

    if (estado) {
      query += ' AND c.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY c.fecha_creacion DESC';

    // Obtener total para paginación
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Cotizaciones c
      JOIN Usuarios u ON c.id_usuario = u.id_usuario
      WHERE 1=1
    `;
    const countParams = [];
    
    if (estado) {
      countQuery += ' AND c.estado = ?';
      countParams.push(estado);
    }

    const [cotizaciones, countResult] = await Promise.all([
      executeQuery(`${query} LIMIT ${limitNum} OFFSET ${offsetNum}`, params),
      executeQuery(countQuery, countParams)
    ]);

    // Para cada cotización, obtener los items
    for (let cotizacion of cotizaciones) {
      const items = await executeQuery(`
        SELECT 
          cd.cantidad,
          ci.id_item,
          ci.nombre,
          ci.descripcion,
          ci.tipo,
          ci.imagen_url
        FROM Cotizacion_Detalle cd
        JOIN Catalogo_Items ci ON cd.id_item = ci.id_item
        WHERE cd.id_cotizacion = ?
      `, [cotizacion.id_cotizacion]);

      cotizacion.items = items;

      // Obtener personalización si existe
      const personalizacion = await executeQuery(`
        SELECT frutas_seleccionadas, chips_seleccionados, toppings_seleccionados
        FROM Personalizacion_Snacks
        WHERE id_cotizacion = ?
      `, [cotizacion.id_cotizacion]);

      cotizacion.personalizacion_snacks = personalizacion[0] || null;
    }

    const total = countResult[0].total;

    res.json({
      cotizaciones,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error obteniendo todas las cotizaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una cotización específica por ID
const obtenerCotizacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRol = req.user.rol;

    let query = `
      SELECT 
        c.id_cotizacion,
        c.id_usuario,
        c.direccion_evento,
        c.fecha_evento,
        c.hora_evento,
        c.tipo_evento,
        c.num_invitados,
        c.solicitudes_especiales,
        c.estado,
        c.fecha_creacion,
        u.nombre_completo,
        u.correo,
        u.telefono
      FROM Cotizaciones c
      JOIN Usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_cotizacion = ?
    `;

    const params = [id];

    // Si no es admin/staff, solo puede ver sus propias cotizaciones
    if (userRol === 'Cliente') {
      query += ' AND c.id_usuario = ?';
      params.push(userId);
    }

    const cotizaciones = await executeQuery(query, params);

    if (cotizaciones.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const cotizacion = cotizaciones[0];

    // Obtener items de la cotización
    const items = await executeQuery(`
      SELECT 
        cd.cantidad,
        ci.id_item,
        ci.nombre,
        ci.descripcion,
        ci.tipo,
        ci.imagen_url
      FROM Cotizacion_Detalle cd
      JOIN Catalogo_Items ci ON cd.id_item = ci.id_item
      WHERE cd.id_cotizacion = ?
    `, [id]);

    cotizacion.items = items;

    // Obtener personalización si existe
    const personalizacion = await executeQuery(`
      SELECT frutas_seleccionadas, chips_seleccionados, toppings_seleccionados
      FROM Personalizacion_Snacks
      WHERE id_cotizacion = ?
    `, [id]);

    cotizacion.personalizacion_snacks = personalizacion[0] || null;

    res.json({ cotizacion });

  } catch (error) {
    console.error('Error obteniendo cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar estado de cotización (solo admin/staff)
const actualizarEstadoCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'Estado es obligatorio' });
    }

    if (!['Pendiente', 'Enviada', 'Aceptada', 'Rechazada'].includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado debe ser: Pendiente, Enviada, Aceptada o Rechazada' 
      });
    }

    // Verificar que la cotización existe
    const cotizaciones = await executeQuery(
      'SELECT id_cotizacion FROM Cotizaciones WHERE id_cotizacion = ?',
      [id]
    );

    if (cotizaciones.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    await executeQuery(
      'UPDATE Cotizaciones SET estado = ? WHERE id_cotizacion = ?',
      [estado, id]
    );

    res.json({ message: 'Estado de cotización actualizado exitosamente' });

  } catch (error) {
    console.error('Error actualizando estado de cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar cotización (solo el propietario o admin)
const eliminarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRol = req.user.rol;

    // Verificar que la cotización existe
    const cotizaciones = await executeQuery(
      'SELECT id_usuario FROM Cotizaciones WHERE id_cotizacion = ?',
      [id]
    );

    if (cotizaciones.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    // Si no es admin, solo puede eliminar sus propias cotizaciones
    if (userRol === 'Cliente' && cotizaciones[0].id_usuario !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta cotización' });
    }

    // Solo se pueden eliminar cotizaciones pendientes
    const cotizacionEstado = await executeQuery(
      'SELECT estado FROM Cotizaciones WHERE id_cotizacion = ?',
      [id]
    );

    if (cotizacionEstado[0].estado !== 'Pendiente') {
      return res.status(400).json({ 
        error: 'Solo se pueden eliminar cotizaciones con estado "Pendiente"' 
      });
    }

    await executeQuery('DELETE FROM Cotizaciones WHERE id_cotizacion = ?', [id]);

    res.json({ message: 'Cotización eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas de cotizaciones (solo admin/staff)
const obtenerEstadisticasCotizaciones = async (req, res) => {
  try {
    const [
      totalCotizaciones,
      porEstado,
      porTipoEvento,
      cotizacionesRecientes
    ] = await Promise.all([
      executeQuery('SELECT COUNT(*) as total FROM Cotizaciones'),
      executeQuery(`
        SELECT estado, COUNT(*) as cantidad 
        FROM Cotizaciones 
        GROUP BY estado
      `),
      executeQuery(`
        SELECT tipo_evento, COUNT(*) as cantidad 
        FROM Cotizaciones 
        GROUP BY tipo_evento
        ORDER BY cantidad DESC
        LIMIT 5
      `),
      executeQuery(`
        SELECT COUNT(*) as cantidad
        FROM Cotizaciones 
        WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `)
    ]);

    res.json({
      estadisticas: {
        total_cotizaciones: totalCotizaciones[0].total,
        por_estado: porEstado,
        por_tipo_evento: porTipoEvento,
        cotizaciones_ultimo_mes: cotizacionesRecientes[0].cantidad
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de cotizaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Guardar o actualizar la personalización de snacks para una cotización existente
const guardarPersonalizacion = async (req, res) => {
  try {
    const { id } = req.params; // id_cotizacion
    const userId = req.user.userId;
    const userRol = req.user.rol;
    const { frutas_seleccionadas, chips_seleccionados, toppings_seleccionados } = req.body || {};

    // Validar cotización y propiedad
    const cot = await executeQuery('SELECT id_usuario FROM Cotizaciones WHERE id_cotizacion = ?', [id]);
    if (cot.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    if (userRol === 'Cliente' && cot[0].id_usuario !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para personalizar esta cotización' });
    }

    // Validación mínima: al menos un campo debe tener contenido
    const hasAny = [frutas_seleccionadas, chips_seleccionados, toppings_seleccionados]
      .some(v => v && String(v).trim().length > 0);
    if (!hasAny) {
      return res.status(400).json({ error: 'Debes seleccionar al menos una fruta, chip o topping' });
    }

    // Insertar o actualizar
    const existing = await executeQuery(
      'SELECT id_personalizacion FROM Personalizacion_Snacks WHERE id_cotizacion = ?',
      [id]
    );

    if (existing.length > 0) {
      const result = await executeQuery(
        'UPDATE Personalizacion_Snacks SET frutas_seleccionadas = ?, chips_seleccionados = ?, toppings_seleccionados = ? WHERE id_cotizacion = ?',
        [frutas_seleccionadas || null, chips_seleccionados || null, toppings_seleccionados || null, id]
      );
      if (!result || (result.affectedRows !== 1 && result.affectedRows !== 2)) {
        return res.status(500).json({ error: 'No se pudo actualizar la personalización' });
      }
    } else {
      const result = await executeQuery(
        'INSERT INTO Personalizacion_Snacks (id_cotizacion, frutas_seleccionadas, chips_seleccionados, toppings_seleccionados) VALUES (?, ?, ?, ?)',
        [id, frutas_seleccionadas || null, chips_seleccionados || null, toppings_seleccionados || null]
      );
      if (!result || result.affectedRows !== 1) {
        return res.status(500).json({ error: 'No se pudo guardar la personalización' });
      }
    }

    // Obtener datos de la cotización y usuario para el email
    const [cotizacionData] = await executeQuery(`
      SELECT c.*, u.nombre_completo, u.correo 
      FROM Cotizaciones c 
      JOIN Usuarios u ON c.id_usuario = u.id_usuario 
      WHERE c.id_cotizacion = ?
    `, [id]);

    if (cotizacionData.length > 0) {
      const cot = cotizacionData[0];
      
      // Enviar notificación por email al administrador
      const subject = `Personalización de snacks actualizada - Cotización #${id}`;
      const htmlContent = `
        <h2>Personalización de snacks actualizada</h2>
        <p><strong>Número de cotización:</strong> #${id}</p>
        <p><strong>Cliente:</strong> ${cot.nombre_completo || 'N/A'}</p>
        <p><strong>Email:</strong> ${cot.correo || 'N/A'}</p>
        <p><strong>Tipo de evento:</strong> ${cot.tipo_evento}</p>
        <p><strong>Fecha del evento:</strong> ${cot.fecha_evento}</p>
        <p><strong>Número de invitados:</strong> ${cot.num_invitados}</p>
        <p><strong>Dirección:</strong> ${cot.direccion_evento}</p>
        <hr>
        <h3>Personalización de Snacks:</h3>
        <p><strong>Frutas/Verduras seleccionadas:</strong> ${frutas_seleccionadas || 'Ninguna'}</p>
        <p><strong>Chips seleccionados:</strong> ${chips_seleccionados || 'Ninguno'}</p>
        <p><strong>Toppings seleccionados:</strong> ${toppings_seleccionados || 'Ninguno'}</p>
        <hr>
        <p><em>Revisa la bandeja de cotizaciones para más detalles</em></p>
      `;
      const textContent = `
        Personalización de snacks actualizada
        
        Número de cotización: #${id}
        Cliente: ${cot.nombre_completo || 'N/A'}
        Email: ${cot.correo || 'N/A'}
        Tipo de evento: ${cot.tipo_evento}
        Fecha del evento: ${cot.fecha_evento}
        Número de invitados: ${cot.num_invitados}
        Dirección: ${cot.direccion_evento}
        
        Personalización de Snacks:
        Frutas/Verduras seleccionadas: ${frutas_seleccionadas || 'Ninguna'}
        Chips seleccionados: ${chips_seleccionados || 'Ninguno'}
        Toppings seleccionados: ${toppings_seleccionados || 'Ninguno'}
        
        Revisa la bandeja de cotizaciones para más detalles
      `;

      // Enviar email (no bloquear la respuesta si falla)
      sendEmailToAdmin(subject, htmlContent, textContent).catch(err => {
        console.error('Error enviando email de personalización:', err);
      });
    }

    res.json({ message: 'Personalización guardada exitosamente' });

  } catch (error) {
    console.error('Error guardando personalización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  crearCotizacion,
  obtenerMisCotizaciones,
  obtenerTodasCotizaciones,
  obtenerCotizacionPorId,
  actualizarEstadoCotizacion,
  eliminarCotizacion,
  obtenerEstadisticasCotizaciones,
  guardarPersonalizacion
};






