const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { executeQuery } = require('../db');


// Validar correo según dominios permitidos
const validarCorreo = (correo) => {
  const regex = /^[^\s@]+@((gmail\.com)|(hotmail\.com)|(yahoo\.com)|(outlook\.com))$/;
  return regex.test(correo);
};

// Generar token JWT
const generateToken = (userId, rol) => {
  return jwt.sign(
    { userId, rol },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );
};

// Registrar nuevo usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombre_completo, correo, telefono, contrasena } = req.body;
    const role = 'Cliente';

    // Validaciones básicas
    if (!nombre_completo || !correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios: nombre_completo, correo, contrasena' 
      });
    }

    if (!validarCorreo(correo)) {
    return res.status(400).json({ 
    error: 'El correo debe ser válido y terminar en gmail.com, hotmail.com, yahoo.com o outlook.com' 
    });
}

    // Verificar si el correo ya existe
    const existingUser = await executeQuery(
      'SELECT id_usuario FROM Usuarios WHERE correo = ?',
      [correo]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const contrasena_hash = await bcrypt.hash(contrasena, saltRounds);

    // Insertar nuevo usuario
    const result = await executeQuery(
      `INSERT INTO Usuarios (nombre_completo, correo, telefono, contrasena_hash, rol) 
       VALUES (?, ?, ?, ?, ?)`,
      [nombre_completo, correo, telefono, contrasena_hash, role]
    );

    // Generar token
    const token = generateToken(result.insertId, role);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id_usuario: result.insertId,
        nombre_completo,
        correo,
        telefono,
        rol: role
      },
      token
    });

  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Iniciar sesión
const iniciarSesion = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Correo y contraseña son obligatorios' 
      });
    }

    // Validar formato de correo
    if (!validarCorreo(correo)) {
      return res.status(400).json({ 
        error: 'El correo debe ser válido y terminar en gmail.com, hotmail.com, yahoo.com o outlook.com' 
      });
    }

    // Buscar usuario por correo
    const users = await executeQuery(
      'SELECT id_usuario, nombre_completo, correo, telefono, contrasena_hash, rol FROM Usuarios WHERE correo = ?',
      [correo]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar contraseña (bcrypt o SHA-256 legado)
    let contrasenaValida = false;

    if (user.contrasena_hash && user.contrasena_hash.startsWith('$2')) {
      // Hash bcrypt
      contrasenaValida = await bcrypt.compare(contrasena, user.contrasena_hash);
    } else {
      // Hash SHA-256 (p.ej. insertado manualmente en MySQL)
      const sha256 = crypto.createHash('sha256').update(contrasena).digest('hex');
      contrasenaValida = (sha256.toLowerCase() === String(user.contrasena_hash).toLowerCase());
      if (contrasenaValida) {
        // Rehash transparente a bcrypt para futuras autenticaciones
        try {
          const newHash = await bcrypt.hash(contrasena, 10);
          await executeQuery('UPDATE Usuarios SET contrasena_hash = ? WHERE id_usuario = ?', [newHash, user.id_usuario]);
        } catch (e) {
          console.warn('No se pudo rehash a bcrypt:', e.message);
        }
      }
    }

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user.id_usuario, user.rol);

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id_usuario: user.id_usuario,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        telefono: user.telefono,
        rol: user.rol
      },
      token
    });

  } catch (error) {
    console.error('Error iniciando sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Obtener perfil del usuario
const obtenerPerfil = async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await executeQuery(
      'SELECT id_usuario, nombre_completo, correo, telefono, rol, fecha_registro FROM Usuarios WHERE id_usuario = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar perfil del usuario
const actualizarPerfil = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombre_completo, telefono } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (nombre_completo) {
      updateFields.push('nombre_completo = ?');
      updateValues.push(nombre_completo);
    }

    if (telefono) {
      updateFields.push('telefono = ?');
      updateValues.push(telefono);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updateValues.push(userId);

    await executeQuery(
      `UPDATE Usuarios SET ${updateFields.join(', ')} WHERE id_usuario = ?`,
      updateValues
    );

    res.json({ message: 'Perfil actualizado exitosamente' });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cambiar contraseña
const cambiarContrasena = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contrasena_actual, nueva_contrasena } = req.body;

    if (!contrasena_actual || !nueva_contrasena) {
      return res.status(400).json({ 
        error: 'Contraseña actual y nueva contraseña son obligatorias' 
      });
    }

    // Obtener contraseña actual
    const users = await executeQuery(
      'SELECT contrasena_hash FROM Usuarios WHERE id_usuario = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const contrasenaValida = await bcrypt.compare(contrasena_actual, users[0].contrasena_hash);

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const nueva_contrasena_hash = await bcrypt.hash(nueva_contrasena, saltRounds);

    // Actualizar contraseña
    await executeQuery(
      'UPDATE Usuarios SET contrasena_hash = ? WHERE id_usuario = ?',
      [nueva_contrasena_hash, userId]
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los usuarios (solo para admin)
const obtenerUsuarios = async (req, res) => {
  try {
    const { rol } = req.query;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offsetNum = (pageNum - 1) * limitNum;

    let query = 'SELECT id_usuario, nombre_completo, correo, telefono, rol, fecha_registro FROM Usuarios';
    let countQuery = 'SELECT COUNT(*) as total FROM Usuarios';
    const params = [];

    if (rol) {
      query += ' WHERE rol = ?';
      countQuery += ' WHERE rol = ?';
      params.push(rol);
    }

    query += ` ORDER BY fecha_registro DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const [users, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params)
    ]);

    const total = countResult[0].total;

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasena,
  obtenerUsuarios
};


