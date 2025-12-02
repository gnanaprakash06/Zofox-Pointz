import {
  AppSidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components";
import { Separator } from "@radix-ui/react-dropdown-menu";
// import headerConfig from "@/static/headerConfig";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  // const location = useLocation();

  // Match the current path in header config (exact, or tweak to support dynamic routes)
  // const path = location.pathname === "/" ? "/dashboard" : location.pathname;
  // const headerData = headerConfig[path];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <header className="flex shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            data-orientation="vertical"
            className="mr-2 data-[data-orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Dashboard</h1>
          
        </header>
        <main className="scrollbar-thin min-h-0 flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
