import React, { useState, useEffect } from 'react';
import { Settings, User, Mail, Lock } from 'lucide-react';
import './AdminPanel.css'; // Re-using styles for consistency

const UserSettings = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const API_URL = '/api/v1';
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(API_URL + '/auth/me', { headers: getHeaders() });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setFormData({ username: data.user.username, email: data.user.email, password: '' });
        } else {
          showMsg('No se pudo cargar tu información', 'error');
        }
      } catch (err) {
        showMsg('Error de conexión', 'error');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const changes = {};
    if (formData.username !== user.username) changes.username = formData.username;
    if (formData.email !== user.email) changes.email = formData.email;
    if (formData.password) changes.password = formData.password;

    if (Object.keys(changes).length === 0) {
      showMsg('No has realizado ningún cambio.', 'error');
      return;
    }

    try {
      const res = await fetch(API_URL + '/auth/me', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(changes),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Perfil actualizado con éxito!');
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setFormData({ username: data.user.username, email: data.user.email, password: '' });
      } else {
        showMsg(data.message, 'error');
      }
    } catch (err) {
      showMsg('Error de conexión', 'error');
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '5rem' }}>Cargando tu perfil...</div>;
  if (!user) return <div style={{ color: 'white', textAlign: 'center', marginTop: '5rem' }}>Debes iniciar sesión para ver esta página.</div>;

  return (
    <div className="admin-panel" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div className="admin-header">
        <h1><Settings size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Configuración de Perfil</h1>
      </div>

      {message.text && (
        <div className={`admin-msg ${message.type === 'error' ? 'admin-msg-error' : 'admin-msg-success'}`}>
          {message.text}
        </div>
      )}

      <div className="glass" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><User size={16}/> Nombre de Usuario</label>
            <input
              className="modal-input"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label><Mail size={16}/> Correo Electrónico</label>
            <input
              className="modal-input"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label><Lock size={16}/> Nueva Contraseña</label>
            <input
              className="modal-input"
              type="password"
              placeholder="Dejar vacío para no cambiar"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
