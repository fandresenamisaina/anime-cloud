import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      loginWithToken(token);
      navigate("/catalogue");
    } else {
      navigate("/login");
    }
  }, [searchParams]);

  return <div className="p-8 text-center">Connexion en cours...</div>;
}
