import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import { SidebarProvider } from "../context/SidebarContext";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="h-screen flex bg-slate-100 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNavbar />

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
