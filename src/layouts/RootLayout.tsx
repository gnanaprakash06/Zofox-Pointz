// RootLayout.tsx
import { AuthProvider } from "@/context/AuthProvider";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <AuthProvider>
      <Outlet /> {/* all routes will render here */}
    </AuthProvider>
  );
};

export default RootLayout;
