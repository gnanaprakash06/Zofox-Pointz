import { axiosInstance } from "@/lib/axiosInstance";
import axios from "axios";

export type LogoutHandler = () => void;

export type AuthUserType = {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "user"; // Assuming 'admin' is one possible role, but leaving it extensible
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUserType;
};

class AuthService {
  private accessKey = "authToken";
  private refreshKey = "refreshToken";
  private logoutHandlers: LogoutHandler[] = [];

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.accessKey); // need to change to session storage
  }
  setAccessToken(token: string) {
    sessionStorage.setItem(this.accessKey, token); // need to change to session storage
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }
  setRefreshToken(token: string) {
    localStorage.setItem(this.refreshKey, token);
  }
  clear() {
    sessionStorage.removeItem(this.accessKey); // need to change to session storage
    localStorage.removeItem(this.refreshKey);
  }
  onLogout(handler: LogoutHandler) {
    this.logoutHandlers.push(handler);
    return () => {
      this.logoutHandlers = this.logoutHandlers.filter((h) => h !== handler);
    };
  }
  async triggerLogout() {
    try {
      axiosInstance.post("/auth/logout").catch((error) => {
        console.error("Error during logout request:", error);
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      this.clear();
      this.logoutHandlers.forEach((h) => h());
    }
  }

  // login with google
  async loginWithGoogle(googleAccessToken: string) {
    try {
      const { data } = await axiosInstance.post("/auth/google-login", {
        googleToken: googleAccessToken,
      });

      // // Check if user is admin
      // if (data?.user?.role !== "admin" || !data?.token) {
      //   this.clear();
      //   throw new Error(
      //     "Access denied. Admin role required or access token is not present in the response"
      //   );
      // }

      // // Save token
      // if (data.token) {
      //   this.setAccessToken(data.token);
      //   // Optional: if backend returns refresh token
      //   // this.setRefreshToken(data.refreshToken);
      // }

      return data.data as AuthResponse;
    } catch (error: any) {
      this.clear();
      throw error;
    }
  }

  // Basic refresh implementation — uses native fetch to avoid circular axios import
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const baseUrl = import.meta.env.VITE_API_URL;

    if (!baseUrl) {
      throw new Error("base url is missing");
    }

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh`, // need to change depending upon the backend route
      { token: refreshToken }
    );

    if (!data?.accessToken) {
      this.triggerLogout();
      throw new Error("Invalid refresh response");
    }
    this.setAccessToken(data.accessToken);
    return data.accessToken;
  }
}

export const authService = new AuthService();
