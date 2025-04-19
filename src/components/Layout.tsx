import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import {
  Clock,
  FileText,
  ChartBar,
  CalendarDays,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FileText size={20} /> },
    { path: "/timesheet", label: "Timesheet", icon: <Clock size={20} /> },
    { path: "/payroll", label: "Payroll", icon: <FileText size={20} /> },
    {
      path: "/performance",
      label: "Performance",
      icon: <ChartBar size={20} />,
    },
    { path: "/leave", label: "Leave", icon: <CalendarDays size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    toast("Logged out successfully");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-sidebar fixed h-screen transition-all duration-300 ease-in-out z-30`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={`py-6 ${
              isSidebarOpen ? "px-6" : "px-4"
            } flex items-center`}
          >
            {isSidebarOpen ? (
              <h1 className="text-white text-xl font-bold">NutMeg TPPL</h1>
            ) : (
              <span className="text-white text-xl font-bold">NT</span>
            )}
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Menu Items */}
          <nav className="flex-1 py-6 px-3">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar-menu-item ${
                      location.pathname === item.path ? "active" : ""
                    }`}
                  >
                    {item.icon}
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-nutmeg-800 text-white">
                  {user?.name.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-sidebar-foreground/80 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              {isSidebarOpen && <span>Log out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header
          className="bg-white shadow-sm h-16 fixed right-0 left-0 z-20"
          style={{ left: isSidebarOpen ? "16rem" : "5rem" }}
        >
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu />
              </Button>
              <h1 className="text-xl font-semibold ml-4">
                {menuItems.find((item) => item.path === location.pathname)
                  ?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-medium">Role: </span>
                <span className="px-2 py-1 rounded-full bg-nutmeg-100 text-nutmeg-800 text-xs font-medium">
                  {user?.role === "admin" ? "Administrator" : "Team Member"}
                </span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-nutmeg-200 text-nutmeg-800">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 px-6 pb-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
