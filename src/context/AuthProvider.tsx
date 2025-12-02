import { authService } from "@/services/auth.service";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!authService.getAccessToken()
  );

  useEffect(() => {
    // Register a logout handler so AuthService doesn't call window.location directly
    const unsubscribe = authService.onLogout(() => {
      setIsAuthenticated(false);
      navigate("/login");
    });
    return unsubscribe;
  }, [navigate]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      login: (accessToken: string, refreshToken?: string) => {
        authService.setAccessToken(accessToken);
        if (refreshToken) authService.setRefreshToken(refreshToken);
        setIsAuthenticated(true);
      },
      logout: () => {
        authService.triggerLogout(); // AuthProvider's handler will navigate
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
