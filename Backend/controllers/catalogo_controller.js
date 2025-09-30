const { executeQuery } = require('../db');

// Obtener todos los items del catálogo
const obtenerItems = async (req, res) => {
  try {
    const { tipo, es_popular, estado = 'Activo' } = req.query;

    let query = `
      SELECT 
        ci.id_item,
        ci.nombre,
        ci.descripcion,
        ci.tipo,
        ci.es_popular,
        ci.detalles,
        ci.estado,
        ci.imagen_url
      FROM Catalogo_Items ci
      WHERE ci.estado = ?
    `;
    
    const params = [estado];

    if (tipo) {
      query += ' AND ci.tipo = ?';
      params.push(tipo);
    }

    if (es_popular !== undefined) {
      query += ' AND ci.es_popular = ?';
      params.push(es_popular === 'true');
    }

    query += ' ORDER BY ci.es_popular DESC, ci.nombre ASC';

    const items = await executeQuery(query, params);

    // Para cada item, obtener sus productos asociados
    for (let item of items) {
      const productos = await executeQuery(`
        SELECT 
          ip.id_producto,
          ip.nombre as producto_nombre,
          ip.categoria,
          cd.cantidad,
          ip.unidad_medida
        FROM Catalogo_Detalle cd
        JOIN Inventario_Productos ip ON cd.id_producto = ip.id_producto
        WHERE cd.id_item = ?
      `, [item.id_item]);

      item.productos = productos;
    }

    res.json({ items });

  } catch (error) {
    console.error('Error obteniendo items del catálogo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un item específico por ID
const obtenerItemPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await executeQuery(`
      SELECT 
        ci.id_item,
        ci.nombre,
        ci.descripcion,
        ci.tipo,
        ci.es_popular,
        ci.detalles,
        ci.estado,
        ci.imagen_url
      FROM Catalogo_Items ci
      WHERE ci.id_item = ?
    `, [id]);

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const item = items[0];

    // Obtener productos asociados
    const productos = await executeQuery(`
      SELECT 
        ip.id_producto,
        ip.nombre as producto_nombre,
        ip.categoria,
        cd.cantidad,
        ip.unidad_medida,
        ip.stock_actual
      FROM Catalogo_Detalle cd
      JOIN Inventario_Productos ip ON cd.id_producto = ip.id_producto
      WHERE cd.id_item = ?
    `, [id]);

    item.productos = productos;

    res.json({ item });

  } catch (error) {
    console.error('Error obteniendo item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo item del catálogo (solo admin)
const crearItem = async (req, res) => {
  try {
    const { nombre, descripcion, tipo, es_popular, detalles, productos } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({ 
        error: 'Nombre y tipo son campos obligatorios' 
      });
    }

    if (!['Barra', 'Combo'].includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo debe ser "Barra" o "Combo"' 
      });
    }

    // Insertar el item
    const result = await executeQuery(`
      INSERT INTO Catalogo_Items (nombre, descripcion, tipo, es_popular, detalles)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, descripcion, tipo, es_popular || false, detalles]);

    const itemId = result.insertId;

    // Si se proporcionan productos, agregarlos al detalle
    if (productos && productos.length > 0) {
      for (const producto of productos) {
        await executeQuery(`
          INSERT INTO Catalogo_Detalle (id_item, id_producto, cantidad)
          VALUES (?, ?, ?)
        `, [itemId, producto.id_producto, producto.cantidad || 1]);
      }
    }

    res.status(201).json({
      message: 'Item creado exitosamente',
      item: {
        id_item: itemId,
        nombre,
        descripcion,
        tipo,
        es_popular,
        detalles
      }
    });

  } catch (error) {
    console.error('Error creando item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar item del catálogo (solo admin)
const actualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, tipo, es_popular, detalles, estado } = req.body;

    // Verificar que el item existe
    const existingItems = await executeQuery(
      'SELECT id_item FROM Catalogo_Items WHERE id_item = ?',
      [id]
    );

    if (existingItems.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const updateFields = [];
    const updateValues = [];

    if (nombre) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre);
    }

    if (descripcion !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }

    if (tipo) {
      if (!['Barra', 'Combo'].includes(tipo)) {
        return res.status(400).json({ 
          error: 'Tipo debe ser "Barra" o "Combo"' 
        });
      }
      updateFields.push('tipo = ?');
      updateValues.push(tipo);
    }

    if (es_popular !== undefined) {
      updateFields.push('es_popular = ?');
      updateValues.push(es_popular);
    }

    if (detalles !== undefined) {
      updateFields.push('detalles = ?');
      updateValues.push(detalles);
    }

    if (estado) {
      if (!['Activo', 'Inactivo'].includes(estado)) {
        return res.status(400).json({ 
          error: 'Estado debe ser "Activo" o "Inactivo"' 
        });
      }
      updateFields.push('estado = ?');
      updateValues.push(estado);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updateValues.push(id);

    await executeQuery(
      `UPDATE Catalogo_Items SET ${updateFields.join(', ')} WHERE id_item = ?`,
      updateValues
    );

    res.json({ message: 'Item actualizado exitosamente' });

  } catch (error) {
    console.error('Error actualizando item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar item del catálogo (solo admin)
const eliminarItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el item existe
    const existingItems = await executeQuery(
      'SELECT id_item FROM Catalogo_Items WHERE id_item = ?',
      [id]
    );

    if (existingItems.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Eliminar el item (CASCADE eliminará automáticamente los detalles)
    await executeQuery('DELETE FROM Catalogo_Items WHERE id_item = ?', [id]);

    res.json({ message: 'Item eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Agregar producto a un item del catálogo (solo admin)
const agregarProductoAItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_producto, cantidad = 1 } = req.body;

    if (!id_producto) {
      return res.status(400).json({ error: 'id_producto es obligatorio' });
    }

    // Verificar que el item existe
    const items = await executeQuery(
      'SELECT id_item FROM Catalogo_Items WHERE id_item = ?',
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Verificar que el producto existe
    const productos = await executeQuery(
      'SELECT id_producto FROM Inventario_Productos WHERE id_producto = ?',
      [id_producto]
    );

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar que no existe ya esta relación
    const existing = await executeQuery(
      'SELECT id_detalle FROM Catalogo_Detalle WHERE id_item = ? AND id_producto = ?',
      [id, id_producto]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'El producto ya está asociado a este item' });
    }

    // Agregar la relación
    await executeQuery(
      'INSERT INTO Catalogo_Detalle (id_item, id_producto, cantidad) VALUES (?, ?, ?)',
      [id, id_producto, cantidad]
    );

    res.status(201).json({ message: 'Producto agregado al item exitosamente' });

  } catch (error) {
    console.error('Error agregando producto al item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Remover producto de un item del catálogo (solo admin)
const removerProductoDeItem = async (req, res) => {
  try {
    const { id, id_producto } = req.params;

    // Verificar que la relación existe
    const existing = await executeQuery(
      'SELECT id_detalle FROM Catalogo_Detalle WHERE id_item = ? AND id_producto = ?',
      [id, id_producto]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Relación no encontrada' });
    }

    // Eliminar la relación
    await executeQuery(
      'DELETE FROM Catalogo_Detalle WHERE id_item = ? AND id_producto = ?',
      [id, id_producto]
    );

    res.json({ message: 'Producto removido del item exitosamente' });

  } catch (error) {
    console.error('Error removiendo producto del item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar imagen del item (solo admin)
const actualizarImagenItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagen_url } = req.body;

    if (!imagen_url) {
      return res.status(400).json({ error: 'imagen_url es obligatorio' });
    }

    // Verificar que el item existe
    const items = await executeQuery(
      'SELECT id_item FROM Catalogo_Items WHERE id_item = ?',
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Actualizar la imagen
    await executeQuery(
      'UPDATE Catalogo_Items SET imagen_url = ? WHERE id_item = ?',
      [imagen_url, id]
    );

    res.json({ message: 'Imagen actualizada exitosamente' });

  } catch (error) {
    console.error('Error actualizando imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerItems,
  obtenerItemPorId,
  crearItem,
  actualizarItem,
  eliminarItem,
  agregarProductoAItem,
  removerProductoDeItem,
  actualizarImagenItem
};


