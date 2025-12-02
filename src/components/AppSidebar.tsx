import { cn } from "@/lib/utils";
import menuItems from "@/static/menuConfig";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { X, Menu } from "lucide-react";
// import { Separator } from "@radix-ui/react-separator";

const AppSidebar = () => {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={cn("border-r border-gray-200")}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex h-12 items-center gap-3 px-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-lg font-bold text-white">ZP</span>
          </div>

          {/* Show title and subtitle only when sidebar is expanded */}
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="font-semibold text-gray-900">Zofoxx Pointz</h1>
              <span className="text-xs text-gray-500">Super Admin</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn("flex-1 overflow-y-auto py-4")}>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      isActive
                        ? "border-r-2 border-blue-600 bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50",
                      // When collapsed, center the icon
                      isCollapsed && "justify-center px-3"
                    )
                  }
                  end
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {/* Show text only when sidebar is expanded */}
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-0">
        {/* Sidebar Toggle Button */}
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className="flex h-12 w-full items-center justify-center gap-2 text-gray-500 hover:bg-gray-50"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {/* Show Menu icon when collapsed, X icon when expanded */}
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <>
              <X className="h-5 w-5" />
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
