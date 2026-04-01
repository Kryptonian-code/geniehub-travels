import { Outlet } from "react-router-dom";
import { AdminDashboardProvider } from "@/contexts/AdminDashboardContext";

export default function AdminOutlet() {
  return (
    <AdminDashboardProvider>
      <Outlet />
    </AdminDashboardProvider>
  );
}
