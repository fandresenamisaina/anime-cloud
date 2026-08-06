import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Menu items for mobile
  const menuItems = token ? (
    <>
      <Link
        to="/catalogue"
        onClick={closeMenu}
        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-red-900/20 transition border-b border-red-900/20"
      >
        Catalogue
      </Link>
      <Link
        to="/favorites"
        onClick={closeMenu}
        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-red-900/20 transition border-b border-red-900/20"
      >
        Favoris
      </Link>
      <Link
        to="/watchlist"
        onClick={closeMenu}
        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-red-900/20 transition border-b border-red-900/20"
      >
        A regarder
      </Link>
      <Link
        to="/profile"
        onClick={closeMenu}
        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-red-900/20 transition border-b border-red-900/20"
      >
        Profil
      </Link>
      {isAdmin && (
        <Link
          to="/admin"
          onClick={closeMenu}
          className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-red-900/20 transition border-b border-red-900/20"
        >
          Admin
        </Link>
      )}
      <Link
        to="/series/new"
        onClick={closeMenu}
        className="block px-4 py-3 text-red-400 font-semibold hover:text-red-300 transition border-b border-red-900/20"
      >
        + Ajouter
      </Link>
      <button
        onClick={() => {
          handleLogout();
          closeMenu();
        }}
        className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-red-900/20 transition"
      >
        Deconnexion
      </button>
    </>
  ) : (
    <Link
      to="/login"
      onClick={closeMenu}
      className="block px-4 py-3 text-center font-semibold bg-gradient-to-r from-red-600 via-red-700 to-red-500 hover:opacity-90 transition shadow-lg shadow-red-900/40 mx-4 rounded-xl"
    >
      Rejoindre
    </Link>
  );

  return (
    <nav className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-red-900/30 px-4 md:px-8 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
        <img src="/assets/logo.png" alt="AnimeShare Logo" className="w-9 h-9" />
        <span className="text-lg font-extrabold whitespace-nowrap">
          Anime<span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-400">Share</span>
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-1.5 md:gap-2 items-center">
        {token ? (
          <>
            <Link
              to="/catalogue"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-red-900/20 transition"
            >
              Catalogue
            </Link>
            <Link
              to="/favorites"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-red-900/20 transition"
            >
              Favoris
            </Link>
            <Link
              to="/watchlist"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-red-900/20 transition"
            >
              A regarder
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-red-900/20 transition"
            >
              Profil
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-red-900/20 transition"
              >
                Admin
              </Link>
            )}
            <Link
              to="/series/new"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 via-red-700 to-red-500 hover:opacity-90 transition shadow-lg shadow-red-900/40"
            >
              + Ajouter
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-dark-800/70 border border-red-900/30 hover:bg-red-900/30 transition"
            >
              Deconnexion
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 via-red-700 to-red-500 hover:opacity-90 transition shadow-lg shadow-red-900/40"
          >
            Rejoindre
          </Link>
        )}
      </div>

      {/* Hamburger Button - Mobile Only */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-dark-800/70 border border-red-900/30 hover:bg-red-900/30 transition z-50"
        aria-label="Toggle menu"
      >
        <span
          className={`w-5 h-0.5 bg-gray-300 transition-all duration-300 ${
            isMenuOpen ? "rotate-45 translate-y-1.5" : ""
          }`}
        ></span>
        <span
          className={`w-5 h-0.5 bg-gray-300 transition-all duration-300 my-1 ${
            isMenuOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`w-5 h-0.5 bg-gray-300 transition-all duration-300 ${
            isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
          }`}
        ></span>
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-dark-900/95 backdrop-blur-xl z-40 md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ top: "73px" }}
      >
        <div className="flex flex-col py-4">
          {menuItems}
        </div>
      </div>
    </nav>
  );
}
