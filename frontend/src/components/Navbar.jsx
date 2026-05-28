import React, { useState } from "react";
import { Menu, Search as SearchIcon, User, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../components/Navbar.css";

const Navbar = ({ onMenuClick, user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate("/search?q=" + encodeURIComponent(searchTerm));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <header className="navbar glass">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <h1 className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>AnimeFrito</h1>
      </div>

      <div className="navbar-center">
        <form className="search-bar" onSubmit={handleSearch}>
          <SearchIcon size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar anime..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="nav-user-section">
            {user.role === "superadmin" && (
              <div className="profile-btn" onClick={() => navigate("/admin")} title="Panel Admin">
                <Shield size={20} />
              </div>
            )}
            <span className="nav-username">{user.username}</span>
            <div className="profile-btn" onClick={handleLogout} title="Cerrar Sesión">
              <LogOut size={20} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
