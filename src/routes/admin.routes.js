const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../utils/db');
const { requireSuperAdmin } = require('../middlewares/jwt-auth');

const router = express.Router();

// Todas las rutas requieren superadmin
router.use(requireSuperAdmin);

// GET /api/v1/admin/users — Listar todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email, role, is_verified, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al listar usuarios' });
  }
});

// POST /api/v1/admin/users — Crear usuario
router.post('/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'El correo ya está en uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING id, username, email, role, created_at',
      [username, email, passwordHash, 'user']
    );

    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
});

// PUT /api/v1/admin/users/:id — Editar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Verificar que existe
    const existing = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    let query, params;
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING id, username, email, role, created_at';
      params = [username || existing.rows[0].username, email || existing.rows[0].email, passwordHash, id];
    } else {
      query = 'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, role, created_at';
      params = [username || existing.rows[0].username, email || existing.rows[0].email, id];
    }

    const result = await db.query(query, params);
    res.json({ success: true, message: 'Usuario actualizado', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
});

// DELETE /api/v1/admin/users/:id — Eliminar usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar superadmin
    const user = await db.query('SELECT role FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    if (user.rows[0].role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'No puedes eliminar al superadmin' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
});

module.exports = router;
