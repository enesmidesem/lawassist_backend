import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ScalesIcon } from "./ScalesLogo";

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/lawyers", label: "Avukatlar" },
    { to: "/admin/listings", label: "İlanlar" },
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7"><ScalesIcon color="#1d4ed8" /></div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</h1>
          </Link>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] sm:text-xs font-semibold text-blue-600">Admin</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(link.to) ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}>
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ml-1">
            Çıkış
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1 bg-white">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(link.to) ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50"}`}>
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 text-left">
            Çıkış Yap
          </button>
        </div>
      )}
    </header>
  );
}
