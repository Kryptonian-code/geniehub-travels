import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Menu, Settings, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteData } from "@/contexts/SiteDataContext";

interface WorkspaceLink {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface WorkspaceLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  admin?: boolean;
  links?: WorkspaceLink[];
}

export default function WorkspaceLayout({
  title,
  subtitle,
  children,
  admin = false,
  links,
}: WorkspaceLayoutProps) {
  const { logout, isAdmin, user } = useAuth();
  const { settings } = useSiteData();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [open]);

  const navigationLinks = links ?? (
    admin
      ? [
          { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { to: "/dashboard", label: "Client View", icon: User },
        ]
      : [
          { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
          ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Settings }] : []),
        ]
  );

  function isActiveLink(target: string) {
    if (target.includes("#")) {
      return `${location.pathname}${location.hash}` === target;
    }
    return location.pathname === target;
  }

  return (
    <div className="min-h-screen bg-deep text-[color:var(--color-text-main)]">
      <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className={`fixed inset-y-0 left-0 z-[70] flex h-screen w-[18rem] flex-col border-r border-theme bg-surface px-4 py-5 shadow-2xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between gap-4 shrink-0">
            <Link to="/" className="heading-sm text-accent-gold">
              {settings?.brandName ?? "GenieHub"}
            </Link>
            <button className="lg:hidden text-accent-gold" onClick={() => setOpen(false)} aria-label="Close workspace menu">
              <X size={20} />
            </button>
          </div>
          <p className="caption text-muted-green mt-2 shrink-0">{admin ? "Admin workspace" : "Client workspace"}</p>

          <div className="workspace-scrollbar mt-8 min-h-0 flex-1 overflow-y-auto pr-1">
            <nav className="space-y-1">
              {navigationLinks.map((link) => {
                const active = isActiveLink(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 body-sm transition-colors ${
                      active ? "bg-surface-soft text-accent-gold" : "text-muted-green hover:bg-surface-soft hover:text-[color:var(--color-text-main)]"
                    }`}
                  >
                    <link.icon size={17} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-2">
          <header className="sticky top-0 z-40 border-b border-theme bg-surface/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex items-center gap-3">
                <button className="lg:hidden text-accent-gold" onClick={() => setOpen(true)} aria-label="Open workspace menu">
                  <Menu size={22} />
                </button>
                <div className="min-w-0">
                  <p className="caption text-muted-green uppercase tracking-wide">{admin ? "Admin workspace" : "Client workspace"}</p>
                  <p className="body-sm mt-1 truncate">{user?.fullName}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!admin && (
                  <Link to="/contact" className="hidden sm:inline-flex btn-outline-theme py-2 px-4 text-sm">
                    Need help?
                  </Link>
                )}
                <button className="btn-outline-theme py-2 px-4 text-sm" onClick={() => void logout()}>
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <main id="main-content" className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="mb-8">
              <h1 className="heading-lg">{title}</h1>
              <p className="body-md text-muted-green mt-2 max-w-3xl">{subtitle}</p>
            </div>
            {children}
          </main>
        </div>
      </div>

      {open && <button className="fixed inset-0 z-[60] bg-[rgba(6,47,38,0.45)] lg:hidden" aria-label="Close workspace menu overlay" onClick={() => setOpen(false)} />}
    </div>
  );
}
