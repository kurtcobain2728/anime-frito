import React, { useState, useEffect } from "react";
import { UserPlus, Pencil, Trash2, Shield } from "lucide-react";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });

  const API_URL = "/api/v1";
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL + "/admin/users", { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ username: "", email: "", password: "" });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, password: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingUser) {
        res = await fetch(API_URL + "/admin/users/" + editingUser.id, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(formData),
        });
      } else {
        if (!formData.password) {
          showMsg("La contraseña es obligatoria para nuevos usuarios", "error");
          return;
        }
        res = await fetch(API_URL + "/admin/users", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(formData),
        });
      }
      const data = await res.json();
      if (data.success) {
        showMsg(data.message);
        setShowModal(false);
        fetchUsers();
      } else {
        showMsg(data.message, "error");
      }
    } catch (err) {
      showMsg("Error de conexión", "error");
    }
  };

  const handleDelete = async (userId, username) => {
    if (!confirm("¿Estás seguro de eliminar al usuario " + username + "?")) return;
    try {
      const res = await fetch(API_URL + "/admin/users/" + userId, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showMsg("Usuario eliminado");
        fetchUsers();
      } else {
        showMsg(data.message, "error");
      }
    } catch (err) {
      showMsg("Error al eliminar", "error");
    }
  };

  if (loading) return <div style={{ color: "white", textAlign: "center", marginTop: "5rem" }}>Cargando panel admin...</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1><Shield size={28} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />Panel de Administración</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          <UserPlus size={18} /> Agregar Usuario
        </button>
      </div>

      {message.text && (
        <div className={"admin-msg " + (message.type === "error" ? "admin-msg-error" : "admin-msg-success")}>
          {message.text}
        </div>
      )}

      {users.length === 0 ? (
        <div className="admin-empty">No hay usuarios registrados aún.</div>
      ) : (
        <div className="users-table-wrapper glass">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={"role-badge " + (u.role === "superadmin" ? "role-superadmin" : "role-user")}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString("es-VE")}</td>
                  <td>
                    <div className="action-btns">
                      <button className="admin-btn admin-btn-edit admin-btn-sm" onClick={() => openEdit(u)} title="Editar">
                        <Pencil size={14} />
                      </button>
                      {u.role !== "superadmin" && (
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(u.id, u.username)} title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                className="modal-input"
                type="text"
                placeholder="Nombre de usuario"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <input
                className="modal-input"
                type="email"
                placeholder="Correo electrónico"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                className="modal-input"
                type="password"
                placeholder={editingUser ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <div className="modal-actions">
                <button type="button" className="admin-btn modal-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingUser ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
