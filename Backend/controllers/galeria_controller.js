const { executeQuery } = require('../db');

// Obtener todos los eventos de la galería
const obtenerEventos = async (req, res) => {
  try {
    const { tipo_evento } = req.query;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offsetNum = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        id_evento,
        titulo_evento,
        tipo_evento,
        fecha_evento,
        descripcion,
        nombre_cliente,
        imagen_url
      FROM Galeria_Eventos
      WHERE 1=1
    `;
    
    const params = [];

    if (tipo_evento) {
      query += ' AND tipo_evento = ?';
      params.push(tipo_evento);
    }

    query += ' ORDER BY fecha_evento DESC';

    // Obtener total para paginación
    let countQuery = 'SELECT COUNT(*) as total FROM Galeria_Eventos WHERE 1=1';
    const countParams = [];
    
    if (tipo_evento) {
      countQuery += ' AND tipo_evento = ?';
      countParams.push(tipo_evento);
    }

    const [eventos, countResult] = await Promise.all([
      executeQuery(`${query} LIMIT ${limitNum} OFFSET ${offsetNum}`, params),
      executeQuery(countQuery, countParams)
    ]);

    const total = countResult[0].total;

    res.json({
      eventos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un evento específico por ID
const obtenerEventoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const eventos = await executeQuery(`
      SELECT 
        id_evento,
        titulo_evento,
        tipo_evento,
        fecha_evento,
        descripcion,
        nombre_cliente,
        imagen_url
      FROM Galeria_Eventos
      WHERE id_evento = ?
    `, [id]);

    if (eventos.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ evento: eventos[0] });

  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo evento en la galería (solo admin/staff)
const crearEvento = async (req, res) => {
  try {
    const {
      titulo_evento,
      tipo_evento,
      fecha_evento,
      descripcion,
      nombre_cliente,
      imagen_url
    } = req.body;

    if (!titulo_evento || !tipo_evento) {
      return res.status(400).json({
        error: 'Título del evento y tipo de evento son campos obligatorios'
      });
    }

    const result = await executeQuery(`
      INSERT INTO Galeria_Eventos (
        titulo_evento, tipo_evento, fecha_evento, descripcion, nombre_cliente, imagen_url
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [titulo_evento, tipo_evento, fecha_evento, descripcion, nombre_cliente, imagen_url]);

    res.status(201).json({
      message: 'Evento creado exitosamente',
      evento: {
        id_evento: result.insertId,
        titulo_evento,
        tipo_evento,
        fecha_evento,
        descripcion,
        nombre_cliente,
        imagen_url
      }
    });

  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar evento (solo admin/staff)
const actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo_evento,
      tipo_evento,
      fecha_evento,
      descripcion,
      nombre_cliente,
      imagen_url
    } = req.body;

    // Verificar que el evento existe
    const existingEvents = await executeQuery(
      'SELECT id_evento FROM Galeria_Eventos WHERE id_evento = ?',
      [id]
    );

    if (existingEvents.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const updateFields = [];
    const updateValues = [];

    if (titulo_evento) {
      updateFields.push('titulo_evento = ?');
      updateValues.push(titulo_evento);
    }

    if (tipo_evento) {
      updateFields.push('tipo_evento = ?');
      updateValues.push(tipo_evento);
    }

    if (fecha_evento) {
      updateFields.push('fecha_evento = ?');
      updateValues.push(fecha_evento);
    }

    if (descripcion !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }

    if (nombre_cliente !== undefined) {
      updateFields.push('nombre_cliente = ?');
      updateValues.push(nombre_cliente);
    }

    if (imagen_url !== undefined) {
      updateFields.push('imagen_url = ?');
      updateValues.push(imagen_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updateValues.push(id);

    await executeQuery(
      `UPDATE Galeria_Eventos SET ${updateFields.join(', ')} WHERE id_evento = ?`,
      updateValues
    );

    res.json({ message: 'Evento actualizado exitosamente' });

  } catch (error) {
    console.error('Error actualizando evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar evento (solo admin)
const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el evento existe
    const existingEvents = await executeQuery(
      'SELECT id_evento FROM Galeria_Eventos WHERE id_evento = ?',
      [id]
    );

    if (existingEvents.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await executeQuery('DELETE FROM Galeria_Eventos WHERE id_evento = ?', [id]);

    res.json({ message: 'Evento eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener eventos destacados (últimos 6 eventos)
const obtenerEventosDestacados = async (req, res) => {
  try {
    const eventos = await executeQuery(`
      SELECT 
        id_evento,
        titulo_evento,
        tipo_evento,
        fecha_evento,
        descripcion,
        nombre_cliente,
        imagen_url
      FROM Galeria_Eventos
      ORDER BY fecha_evento DESC
      LIMIT 6
    `);

    res.json({ eventos });

  } catch (error) {
    console.error('Error obteniendo eventos destacados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tipos de eventos únicos
const obtenerTiposEventos = async (req, res) => {
  try {
    const tipos = await executeQuery(`
      SELECT DISTINCT tipo_evento, COUNT(*) as cantidad
      FROM Galeria_Eventos
      GROUP BY tipo_evento
      ORDER BY cantidad DESC
    `);

    res.json({ tipos_eventos: tipos });

  } catch (error) {
    console.error('Error obteniendo tipos de eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Buscar eventos por texto
const buscarEventos = async (req, res) => {
  try {
    const { q, tipo_evento } = req.query;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offsetNum = (pageNum - 1) * limitNum;

    if (!q) {
      return res.status(400).json({ error: 'Parámetro de búsqueda "q" es obligatorio' });
    }

    let query = `
      SELECT 
        id_evento,
        titulo_evento,
        tipo_evento,
        fecha_evento,
        descripcion,
        nombre_cliente,
        imagen_url
      FROM Galeria_Eventos
      WHERE (
        titulo_evento LIKE ? OR 
        descripcion LIKE ? OR 
        nombre_cliente LIKE ?
      )
    `;
    
    const searchTerm = `%${q}%`;
    const params = [searchTerm, searchTerm, searchTerm];

    if (tipo_evento) {
      query += ' AND tipo_evento = ?';
      params.push(tipo_evento);
    }

    query += ' ORDER BY fecha_evento DESC';

    // Obtener total para paginación
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Galeria_Eventos
      WHERE (
        titulo_evento LIKE ? OR 
        descripcion LIKE ? OR 
        nombre_cliente LIKE ?
      )
    `;
    const countParams = [searchTerm, searchTerm, searchTerm];
    
    if (tipo_evento) {
      countQuery += ' AND tipo_evento = ?';
      countParams.push(tipo_evento);
    }

    const [eventos, countResult] = await Promise.all([
      executeQuery(`${query} LIMIT ${limitNum} OFFSET ${offsetNum}`, params),
      executeQuery(countQuery, countParams)
    ]);

    const total = countResult[0].total;

    res.json({
      eventos,
      query: q,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error buscando eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas de la galería (solo admin/staff)
const obtenerEstadisticasGaleria = async (req, res) => {
  try {
    const [
      totalEventos,
      porTipoEvento,
      eventosRecientes
    ] = await Promise.all([
      executeQuery('SELECT COUNT(*) as total FROM Galeria_Eventos'),
      executeQuery(`
        SELECT tipo_evento, COUNT(*) as cantidad 
        FROM Galeria_Eventos 
        GROUP BY tipo_evento
        ORDER BY cantidad DESC
      `),
      executeQuery(`
        SELECT COUNT(*) as cantidad
        FROM Galeria_Eventos 
        WHERE fecha_evento >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `)
    ]);

    res.json({
      estadisticas: {
        total_eventos: totalEventos[0].total,
        por_tipo_evento: porTipoEvento,
        eventos_ultimo_mes: eventosRecientes[0].cantidad
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerEventos,
  obtenerEventoPorId,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  obtenerEventosDestacados,
  obtenerTiposEventos,
  buscarEventos,
  obtenerEstadisticasGaleria
};










