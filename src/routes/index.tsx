import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import RootLayout from "@/layouts/RootLayout";
import Dashboard from "@/pages/Dashboard";
import DevLogin from "@/pages/DevLogin";
import Login from "@/pages/Login";
import Mantras from "@/pages/Mantra";
import NotFound from "@/pages/NotFound";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import Stories from "@/pages/Story";

const routes = [
  {
    element: <RootLayout />, // for providing common auth provider since we use useNavigate in auth provider using navigate before route initialization throws error
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
        ],
      },
      // Protected routes (AppLayout)
      {
        element: <ProtectedRoute />, // <- wrap AppLayout
        children: [
          {
            path: "/",
            element: <AppLayout />,
            children: [
              {
                element: <Dashboard />,
                index: true,
              },
              {
                path: "dashboard",
                element: <Navigate to="/" replace />,
              },
              {
                path: "mantras",
                element: <Mantras />,
              },
              {
                path: "stories",
                element: <Stories />,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

// **conditionally add dev route**
if (import.meta.env.VITE_MODE === "development") {
  routes?.[0]?.children.push({
    path: "dev-login",
    element: <DevLogin />,
  });
}

export const router = createBrowserRouter(routes);

export default router;
