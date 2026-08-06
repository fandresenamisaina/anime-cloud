import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
        <img src="/favicon.svg" alt="AnimeShare Logo" className="w-9 h-9" />
        <span className="text-lg font-extrabold whitespace-nowrap">
          Anime<span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300">Share</span>
        </span>
      </Link>

      <div className="flex gap-1.5 md:gap-2 items-center">
        {token ? (
          <>
            <Link
              to="/catalogue"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Catalogue
            </Link>
            <Link
              to="/favorites"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Favoris
            </Link>
            <Link
              to="/watchlist"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              A regarder
            </Link>
            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              Profil
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
              >
                Admin
              </Link>
            )}
            <Link
              to="/series/new"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:opacity-90 transition shadow-lg shadow-purple-900/30"
            >
              + Ajouter
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-dark-800/70 border border-white/10 hover:bg-dark-700/60 transition"
            >
              Deconnexion
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:opacity-90 transition shadow-lg shadow-purple-900/30"
          >
            Rejoindre
          </Link>
        )}
      </div>
    </nav>
  );
}
