const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'snack_party',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('🔧 Configuración de DB:', {
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password ? '***' : 'NO PASSWORD',
  database: dbConfig.database,
  port: dbConfig.port
});

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Crear una promesa para usar async/await
const promisePool = pool.promise();

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
};

// Función para ejecutar consultas
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await promisePool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error ejecutando consulta:', error.message);
    throw error;
  }
};

// Función para obtener una conexión del pool
const getConnection = async () => {
  try {
    return await promisePool.getConnection();
  } catch (error) {
    console.error('Error obteniendo conexión:', error.message);
    throw error;
  }
};

// Función para cerrar el pool de conexiones
const closePool = async () => {
  try {
    await promisePool.end();
    console.log('Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error cerrando pool:', error.message);
  }
};

module.exports = {
  pool: promisePool,
  execute: promisePool.execute.bind(promisePool),
  executeQuery,
  getConnection,
  testConnection,
  closePool
};


