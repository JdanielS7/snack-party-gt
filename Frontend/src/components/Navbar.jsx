import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

export default function Navbar({ isAdmin, user, onLogout }) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 shadow-2xl backdrop-blur-sm z-50 border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-yellow-400/30">
            <img 
              src={logo} 
              alt="Snack Party Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Snack Party
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
                    <Link 
            to="/" 
            className="px-4 py-2 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
          >
            Inicio
          </Link>
          <Link 
            to="/catalog" 
            className="px-4 py-2 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
          >
            Catálogo
          </Link>
          <Link 
            to="/quote" 
            className="px-4 py-2 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
          >
            Cotización
          </Link>
          <Link 
            to="/snack-bar-customization" 
           className="px-4 py-2 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
  >
           Personalización
          </Link>

          <Link 
            to="/gallery" 
            className="px-4 py-2 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
          >
            Galería
          </Link>
          <Link 
            to="/contact" 
            className="px-4 py-2 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
          >
            Contacto
          </Link>
          
          



          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setAdminOpen((v) => !v)}
                className="px-4 py-2 rounded-lg font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105"
              >
                Panel administrativo
              </button>
              {adminOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-black/90 border border-yellow-400/20 rounded-lg shadow-xl backdrop-blur-sm">
                  <div className="py-2">
                    <Link
                      to="/inventory"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setAdminOpen(false)}
                    >
                      Inventario
                    </Link>
                    <Link
                      to="/admin/catalog"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setAdminOpen(false)}
                    >
                      Administrar catálogo
                    </Link>
                    <Link
                      to="/admin/gallery"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setAdminOpen(false)}
                    >
                      Administrar galería
                    </Link>
                    <Link
                      to="/admin/quotes"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setAdminOpen(false)}
                    >
                      Bandeja de cotizaciones
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Auth */}
          {user ? (
            <div className="ml-auto flex items-center space-x-3">
              <div className="flex items-center space-x-3 pr-3 mr-1 border-r border-white/10">
                <div className="w-9 h-9 rounded-full bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center text-yellow-300 font-bold">
                  {String(user.nombre_completo || user.correo || 'U').trim().charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col leading-tight text-white">
                  <span className="text-sm font-semibold">{user.nombre_completo || user.correo}</span>
                  <span className="text-xs text-yellow-400/90">{user.rol || (isAdmin ? 'Admin' : 'Cliente')}</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg font-semibold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-300 transform hover:scale-105"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="ml-auto flex items-center space-x-2">
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 rounded-lg font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-300"
          aria-label="Abrir menú"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 border-b border-yellow-500/20 z-50">
          <div className="px-6 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
              className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
            >
              Inicio
            </Link>
            <Link
              to="/catalog"
              onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
              className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
            >
              Catálogo
            </Link>
            <Link
              to="/quote"
              onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
              className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
            >
              Cotización
            </Link>
            <Link
              to="/snack-bar-customization"
              onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
              className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
            >
              Personalización
            </Link>
            <Link
              to="/gallery"
              onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
              className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
            >
              Galería
            </Link>
            <Link
              to="/contact"
              onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
              className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
            >
              Contacto
            </Link>

            {isAdmin && (
              <div className="pt-2 border-t border-white/10 mt-2">
                <div className="px-4 py-2 text-xs uppercase tracking-wider text-yellow-400/90">Panel administrativo</div>
                <Link
                  to="/inventory"
                  onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
                  className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
                >
                  Inventario
                </Link>
                <Link
                  to="/admin/catalog"
                  onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
                  className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
                >
                  Administrar catálogo
                </Link>
                <Link
                  to="/admin/gallery"
                  onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
                  className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
                >
                  Administrar galería
                </Link>
                <Link
                  to="/admin/quotes"
                  onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
                  className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
                >
                  Bandeja de cotizaciones
                </Link>
              </div>
            )}

            <div className="pt-2 border-t border-white/10 mt-2">
              {user ? (
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center text-yellow-300 font-bold">
                        {String(user.nombre_completo || user.correo || 'U').trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col leading-tight text-white">
                        <span className="text-sm font-semibold">{user.nombre_completo || user.correo}</span>
                        <span className="text-xs text-yellow-400/90">{user.rol || (isAdmin ? 'Admin' : 'Cliente')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); onLogout(); }}
                    className="w-full px-4 py-3 rounded-lg font-semibold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
                    className="block px-4 py-3 rounded-lg font-semibold text-white hover:text-yellow-400 hover:bg-white/10 transition-all"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => { setMobileOpen(false); setAdminOpen(false); }}
                    className="block px-4 py-3 rounded-lg font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition-all"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}