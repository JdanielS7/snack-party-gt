const db = require('../db');

// Utilidad para normalizar la categoría desde el frontend a los valores del ENUM
const normalizeCategory = (cat) => {
  if (!cat) return 'Alimentos';
  const val = String(cat).trim().toLowerCase();
  switch (val) {
    // Nuevas categorías canónicas
    case 'topping':
    case 'toppings':
      return 'toppings';
    case 'chip':
    case 'chips':
      return 'chips';
    case 'fruta/vegetales':
    case 'fruta':
    case 'frutas':
    case 'vegetales':
    case 'verduras':
      return 'Fruta/Vegetales';
    case 'escencias':
    case 'esencias':
    case 'escencia':
    case 'esencia':
      return 'escencias';
    case 'suplemento':
    case 'suplementos':
      return 'Suplementos';
    case 'alimento':
    case 'alimentos':
      return 'Alimentos';
    case 'bebida':
    case 'bebidas':
      return 'bebidas';
    case 'postre':
    case 'postres':
      return 'postres';

    // Compatibilidad retro con categorías antiguas
    case 'snack':
    case 'snacks':
      return 'chips';
    case 'ingrediente':
    case 'ingredientes':
      return 'Alimentos';
    case 'otro':
    case 'otros':
      return 'Alimentos';
    default:
      return 'Alimentos';
  }
};

// Mapear body del frontend a columnas reales
const mapBodyToColumns = (body = {}) => {
  const nombre = body.nombre ?? body.name ?? '';
  const categoria = normalizeCategory(body.categoria ?? body.category);
  const stock_actual = body.stock_actual ?? body.stock ?? 0;
  const stock_minimo = body.stock_minimo ?? body.minStock ?? 0;
  const unidad_medida = body.unidad_medida ?? body.unit ?? 'unidades';
  return { nombre, categoria, stock_actual, stock_minimo, unidad_medida };
};

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id_producto, nombre, categoria, stock_actual, stock_minimo, unidad_medida, ultima_actualizacion FROM Inventario_Productos ORDER BY nombre'
    );
    res.json({ productos: rows });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener producto por ID
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT id_producto, nombre, categoria, stock_actual, stock_minimo, unidad_medida, ultima_actualizacion FROM Inventario_Productos WHERE id_producto = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ producto: rows[0] });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo producto
const crearProducto = async (req, res) => {
  try {
    const { nombre, categoria, stock_actual, stock_minimo, unidad_medida } = mapBodyToColumns(req.body);

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const [result] = await db.execute(
      'INSERT INTO Inventario_Productos (nombre, categoria, stock_actual, stock_minimo, unidad_medida) VALUES (?, ?, ?, ?, ?)',
      [nombre, categoria, stock_actual, stock_minimo, unidad_medida]
    );

    res.status(201).json({
      message: 'Producto creado exitosamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, stock_actual, stock_minimo, unidad_medida } = mapBodyToColumns(req.body);

    const [result] = await db.execute(
      'UPDATE Inventario_Productos SET nombre = ?, categoria = ?, stock_actual = ?, stock_minimo = ?, unidad_medida = ? WHERE id_producto = ?',
      [nombre, categoria, stock_actual, stock_minimo, unidad_medida, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar producto
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      'DELETE FROM Inventario_Productos WHERE id_producto = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar stock
const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = req.body.stock_actual ?? req.body.stock;

    if (stock === undefined || stock === null || Number.isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ error: 'stock_actual (o stock) es requerido y debe ser >= 0' });
    }

    const [result] = await db.execute(
      'UPDATE Inventario_Productos SET stock_actual = ? WHERE id_producto = ?',
      [Number(stock), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Stock actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener productos con stock bajo
const obtenerProductosStockBajo = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id_producto, nombre, categoria, stock_actual, stock_minimo, unidad_medida, ultima_actualizacion FROM Inventario_Productos WHERE stock_actual <= stock_minimo ORDER BY stock_actual ASC'
    );
    res.json({ productos: rows });
  } catch (error) {
    console.error('Error obteniendo productos con stock bajo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas del inventario
const obtenerEstadisticasInventario = async (req, res) => {
  try {
    const [totalProductos] = await db.execute('SELECT COUNT(*) as total FROM Inventario_Productos');
    const [stockBajo] = await db.execute('SELECT COUNT(*) as total FROM Inventario_Productos WHERE stock_actual <= stock_minimo');
    const [unidades] = await db.execute('SELECT COALESCE(SUM(stock_actual), 0) as unidades_totales FROM Inventario_Productos');

    res.json({
      totalProductos: totalProductos[0].total,
      productosStockBajo: stockBajo[0].total,
      unidadesTotales: unidades[0].unidades_totales
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStock,
  obtenerProductosStockBajo,
  obtenerEstadisticasInventario
};
