import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Library from "./pages/Library";
import SeriesDetail from "./pages/SeriesDetail";
import Watch from "./pages/Watch";
import AddSeries from "./pages/AddSeries";
import Favorites from "./pages/Favorites";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import OAuthCallback from "./pages/OAuthCallback";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route
            path="/catalogue"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
          <Route
            path="/series/new"
            element={
              <ProtectedRoute>
                <AddSeries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/series/:id"
            element={
              <ProtectedRoute>
                <SeriesDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/:episodeId"
            element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
