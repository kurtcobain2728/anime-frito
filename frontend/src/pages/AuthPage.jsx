import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import SakuraBackground from "../components/SakuraBackground";
import "./AuthPage.css";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("reset");
  const [view, setView] = useState(resetToken ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "/api/v1";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !resetToken) navigate("/");
  }, [navigate, resetToken]);

  const showMsg = (msg, type = "error") => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        showMsg(data.message);
      }
    } catch (err) {
      showMsg("Error de conexión al servidor");
    }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      showMsg(data.message, "success");
    } catch (err) {
      showMsg("Error de conexión");
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMsg("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      showMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg("Contraseña actualizada. Redirigiendo al login...", "success");
        setTimeout(() => {
          setView("login");
          navigate("/auth");
        }, 2000);
      } else {
        showMsg(data.message);
      }
    } catch (err) {
      showMsg("Error de conexión");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <SakuraBackground />
      <div className="auth-overlay" />

      <div className="auth-box glass">
        <h1 className="auth-logo">AnimeFrito</h1>
        <p className="auth-subtitle">Solo para invitados 🍟</p>

        {message && (
          <div className={`auth-message ${messageType === "success" ? "auth-success" : ""}`}>
            {message}
          </div>
        )}

        {view === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <h2>Iniciar Sesión</h2>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input type="email" placeholder="Correo electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input type="password" placeholder="Contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <div className="auth-links">
              <span onClick={() => { setView("forgot"); showMsg(""); }}>¿Olvidaste tu contraseña?</span>
            </div>
          </form>
        )}

        {view === "forgot" && (
          <form className="auth-form" onSubmit={handleForgot}>
            <h2>Recuperar Contraseña</h2>
            <p className="auth-desc">Te enviaremos un enlace de recuperación a tu correo</p>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input type="email" placeholder="Correo electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Enlace"}
            </button>
            <div className="auth-links">
              <span onClick={() => { setView("login"); showMsg(""); }}>Volver al Login</span>
            </div>
          </form>
        )}

        {view === "reset" && (
          <form className="auth-form" onSubmit={handleReset}>
            <h2>Nueva Contraseña</h2>
            <p className="auth-desc">Ingresa tu nueva contraseña</p>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input type="password" placeholder="Nueva contraseña" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input type="password" placeholder="Confirmar contraseña" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Guardando..." : "Cambiar Contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
