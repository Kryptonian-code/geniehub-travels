import { Outlet } from "react-router-dom";
import { ClientDashboardProvider } from "@/contexts/ClientDashboardContext";

export default function DashboardOutlet() {
  return (
    <ClientDashboardProvider>
      <Outlet />
    </ClientDashboardProvider>
  );
}
