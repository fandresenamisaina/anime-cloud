import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-accent-500">
        AnimeCloud
      </Link>
      <div className="flex gap-4 items-center">
        {token ? (
          <>
            <Link
              to="/catalogue"
              className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-700/70 transition"
            >
              Catalogue
            </Link>
            <Link
              to="/favorites"
              className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-700/70 transition"
            >
              Favoris
            </Link>
            <Link
              to="/watchlist"
              className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-700/70 transition"
            >
              A regarder
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-700/70 transition"
            >
              Profil
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-700/70 transition"
            >
              Admin
            </Link>
            <Link
              to="/series/new"
              className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 transition"
            >
              + Ajouter une serie
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-700/70 transition"
            >
              Deconnexion
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 transition"
          >
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}