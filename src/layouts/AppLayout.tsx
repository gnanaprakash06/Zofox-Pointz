import { Outlet } from "react-router-dom";
import { Filter, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppSidebar, SidebarInset, SidebarProvider } from "@/components";

const AppLayout = () => {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <Separator orientation="vertical" className="h-4" />
            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          </div>

          {/* Right side: Action buttons and user profile */}
          <div className="flex items-center gap-4">
            {/* Filter Button */}
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Filter className="h-5 w-5" />
            </Button>

            {/* Notifications Button with Badge */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-600"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-red-500 p-0 text-white">
                5
              </Badge>
            </Button>

            {/* Settings Button */}
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium text-gray-900">
                  Admin User
                </div>
                <div className="text-xs text-gray-500">Super Admin</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600">
                <span className="text-sm font-semibold text-white">AU</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
