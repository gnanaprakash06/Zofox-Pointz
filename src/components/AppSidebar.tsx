import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import menuItems from "@/static/menuConfig";
import { LogOut } from "lucide-react";
import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { X, Menu } from "lucide-react";

const AppSidebar = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <Sidebar className="px-1">
      <SidebarHeader className="flex flex-row pt-4 text-sm font-semibold md:text-2xl">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <span className="text-lg font-bold text-white">ZP</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-gray-900">
            Zofoxx Pointz
          </h1>
          <span className="text-xs text-gray-500">Super Admin</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="my-8">
        <SidebarGroup>
          <SidebarGroupLabel className="sr-only">
            Navigation Links
          </SidebarGroupLabel>
          <nav>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="">
                  <NavLink
                    className={({ isActive }) =>
                      cn(
                        "mx-2 flex items-center gap-4 px-3 py-3",
                        isActive && "rounded-md bg-blue-50 text-blue-600"
                      )
                    }
                    to={item.url}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <SidebarMenuButton
          onClick={handleLogout}
          className="text-destructive hover:text-destructive w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
