import React from "react";
import { Home, Flame, LayoutGrid, Search, Settings, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: <Home size={24} />, label: "Inicio" },
    { path: "/trending", icon: <Flame size={24} />, label: "Destacados" },
    { path: "/categories", icon: <LayoutGrid size={24} />, label: "Categorías" },
    { path: "/search", icon: <Search size={24} />, label: "Buscar" },
  ];

  // Agregar opcion admin solo para superadmin
  if (user && user.role === "superadmin") {
    navItems.push({ path: "/admin", icon: <Shield size={24} />, label: "Admin" });
  }


  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={onClose}></div>
      <aside className={`sidebar glass ${isOpen ? "expanded" : ""}`}>
        <div className="sidebar-icons">
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`icon-wrapper ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => { navigate(item.path); onClose(); }}
              title={item.label}
            >
              {item.icon}
              {isOpen && <span className="sidebar-label">{item.label}</span>}
            </div>
          ))}

          <div
            className="icon-wrapper"
            style={{ marginTop: "2rem", color: "#ff4d4d", border: "1px solid #ff4d4d" }}
            onClick={() => { navigate("/hentai"); onClose(); }}
            title="+18"
          >
            <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>+18</span>
            {isOpen && <span className="sidebar-label" style={{ color: "#ff4d4d" }}>Contenido +18</span>}
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="icon-wrapper" title="Configuraciones" onClick={() => { navigate("/settings"); onClose(); }}>
            <Settings size={24} />
            {isOpen && <span className="sidebar-label">Ajustes</span>}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
