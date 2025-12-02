import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DevLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Only in dev
    if (import.meta.env.VITE_MODE !== "development") {
      navigate("/login", { replace: true });
      return;
    }

    if (import.meta.env.VITE_DEV_AUTH === "true") {
      login(import.meta.env.VITE_DEV_ACCESS_TOKEN);
      // authService.setAccessToken(
      //   import.meta.env.VITE_DEV_ACCESS_TOKEN ?? "dev.jwt"
      // );
      // authService.setRefreshToken(
      //   import.meta.env.VITE_DEV_REFRESH_TOKEN ?? "dev.refresh"
      // );
    }

    // After setting tokens, navigate to home page
    navigate("/", { replace: true });
  }, [navigate]);

  return <div>Logging in (dev mode)…</div>;
};

export default DevLogin;
