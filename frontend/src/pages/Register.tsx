import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/catalogue");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-purple-900/40">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold">
              Anime<span className="text-accent-500">Cloud</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Votre cloud d'anime, gratuit et partagé entre passionnés.
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 bg-dark-900/60 border border-white/10 rounded-xl p-1 mb-6">
            <Link
              to="/login"
              className="text-center py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition"
            >
              Connexion
            </Link>
            <span className="text-center py-2 rounded-lg text-sm font-semibold bg-dark-700 border border-white/10">
              Inscription
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Pseudo
              </label>
              <input
                type="text"
                placeholder="otaku_san"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:opacity-90 transition rounded-xl py-3 font-semibold shadow-lg shadow-purple-900/30 disabled:opacity-60"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">ou</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <a href="http://localhost:4000/api/auth/google" className="w-full flex items-center justify-center gap-2 bg-dark-900/60 border border-white/10 rounded-xl py-3 font-medium text-gray-300 hover:bg-dark-700/60 transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 10.8v3.7h5.2c-.2 1.2-1.6 3.6-5.2 3.6-3.1 0-5.7-2.6-5.7-5.8s2.6-5.8 5.7-5.8c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 4 14.5 3 12 3 6.9 3 2.8 7.1 2.8 12.2S6.9 21.4 12 21.4c6.9 0 9.3-4.8 9.3-7.3 0-.5-.1-.9-.1-1.3H12z"
              />
            </svg>
            Continuer avec Google
          </a>

          <p className="text-center text-sm text-gray-400 mt-6">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-accent-500 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
