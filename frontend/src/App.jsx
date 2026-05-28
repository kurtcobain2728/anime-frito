import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useNavigate } from "react-router-dom";
import SakuraBackground from "./components/SakuraBackground";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import AnimeDetails from "./pages/AnimeDetails";
import SearchResults from "./pages/SearchResults";
import AdminPanel from "./pages/AdminPanel";
import UserSettings from "./pages/UserSettings";
import HentaiBrowser from "./pages/HentaiBrowser";

import "./App.css";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  if (!token || !userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const user = getUserFromToken();
  if (!user || user.role !== "superadmin") return <Navigate to="/" replace />;
  return children;
};

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = getUserFromToken();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`app-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <SakuraBackground />
      <div className="bg-overlay" />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
      <div className="main-content">
        <Navbar onMenuClick={toggleSidebar} user={user} />
        <div className="content-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Home filter="featured" />} />
          <Route path="/categories" element={<Home filter="categories" />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/anime" element={<AnimeDetails />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/hentai" element={<HentaiBrowser />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Route>
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
