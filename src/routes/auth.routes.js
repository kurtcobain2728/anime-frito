const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../utils/db");
const mail = require("../utils/mail");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "animefrito_super_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.json({ success: true, message: "Si el correo existe, se envió un enlace de recuperación." });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await db.query("UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3", [resetToken, expires, user.rows[0].id]);
    const resetLink = "https://animefrito.grasa.engineer/auth?reset=" + resetToken;
    try {
      await mail.sendPasswordResetEmail(email, resetLink);
    } catch (e) {
      console.error("Error enviando correo de reset:", e);
    }
    res.json({ success: true, message: "Si el correo existe, se envió un enlace de recuperación." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token y nueva contraseña son requeridos" });
    }
    const user = await db.query("SELECT * FROM users WHERE reset_token = $1", [token]);
    if (user.rows.length === 0 || new Date() > new Date(user.rows[0].reset_expires)) {
      return res.status(400).json({ success: false, message: "Token inválido o expirado" });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await db.query("UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2", [passwordHash, user.rows[0].id]);
    res.json({ success: true, message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token requerido" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await db.query("SELECT id, username, email, role, created_at FROM users WHERE id = $1", [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
});

router.put("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token requerido" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { username, email, password } = req.body;
    if (!username && !email && !password) {
      return res.status(400).json({ success: false, message: "Nada que actualizar" });
    }

    let queryStr = "UPDATE users SET ";
    const queryParams = [];
    let paramIndex = 1;

    if (username) {
      queryStr += `username = $${paramIndex++}`;
      queryParams.push(username);
    }
    if (email) {
      if (queryParams.length > 0) queryStr += ", ";
      queryStr += `email = $${paramIndex++}`;
      queryParams.push(email);
    }
    if (password) {
      if (queryParams.length > 0) queryStr += ", ";
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      queryStr += `password_hash = $${paramIndex++}`;
      queryParams.push(passwordHash);
    }

    queryStr += ` WHERE id = $${paramIndex++}`;
    queryParams.push(decoded.id);

    await db.query(queryStr, queryParams);

    const updatedUser = await db.query("SELECT id, username, email, role FROM users WHERE id = $1", [decoded.id]);

    const newToken = jwt.sign(
      { id: updatedUser.rows[0].id, email: updatedUser.rows[0].email, username: updatedUser.rows[0].username, role: updatedUser.rows[0].role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ 
      success: true, 
      message: "Perfil actualizado",
      token: newToken,
      user: updatedUser.rows[0]
    });

  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: "Token inválido" });
    if (err.code === '23505') return res.status(400).json({ success: false, message: "El email o usuario ya existe" });
    return res.status(500).json({ success: false, message: "Error interno" });
  }
});

module.exports = router;
