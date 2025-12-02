import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="mx-auto min-h-screen w-full max-w-screen-2xl flex-1 bg-gray-100">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
