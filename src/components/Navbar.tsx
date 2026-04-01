import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteData } from "@/contexts/SiteDataContext";
import { getManagedLinks } from "@/lib/siteContent";

const fallbackNavLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Study Abroad", path: "/study-abroad" },
  { label: "Visa Help", path: "/visa-assistance" },
  { label: "Tours", path: "/tours" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { settings, contentBlocks } = useSiteData();
  const navLinks = getManagedLinks(contentBlocks, "header_navigation", fallbackNavLinks);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-theme">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 bg-[color:var(--color-accent)] text-[color:var(--color-background)] px-4 py-2 rounded-lg"
      >
        Skip to content
      </a>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 md:px-8 xl:px-10 h-20 md:h-24 gap-4 xl:gap-6">
        <Link to="/" className="flex items-center gap-3 xl:gap-4 shrink-0">
          <span className="heading-sm text-accent-gold tracking-tight">{settings?.brandName ?? "GenieHub"}</span>
          <span className="body-sm text-muted-green hidden sm:inline max-w-[10rem] leading-snug">Travel Operations Hub</span>
        </Link>

        {/* Desktop nav */}
        <div
          className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-start min-w-0 overflow-hidden px-3 xl:px-5"
          style={{ maxWidth: "calc(100% - 15rem)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-2.5 xl:px-3 py-3 rounded-md text-[0.95rem] leading-none transition-colors duration-200 whitespace-nowrap ${
                location.pathname === link.path
                  ? "text-accent-gold bg-surface-soft"
                  : "text-muted-green hover:text-accent-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0 ml-3">
          <a
            href={`tel:${settings?.phone ?? "+233240000000"}`}
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-theme bg-surface-soft text-muted-green hover:text-accent-gold hover:border-[color:var(--color-accent)] transition-colors"
            aria-label={`Call ${settings?.phone ?? "+233 24 000 0000"}`}
            title={settings?.phone ?? "+233 24 000 0000"}
          >
            <Phone size={16} />
          </a>
          <Link
            to={user ? (isAdmin ? "/admin" : "/dashboard") : "/login"}
            className="min-w-[9.5rem] text-center text-[0.95rem] py-3 px-5 whitespace-nowrap rounded-xl font-semibold transition-colors bg-[color:rgba(215,199,163,0.82)] text-[color:var(--color-background)] hover:bg-[color:rgba(215,199,163,0.92)] shadow-[0_10px_30px_rgba(6,47,38,0.15)]"
          >
            {user ? "Workspace" : "Client Login"}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-accent-gold" aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-surface border-b border-theme overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-md body-md transition-colors ${
                    location.pathname === link.path
                      ? "text-accent-gold bg-surface-soft"
                      : "text-muted-green"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to={user ? (isAdmin ? "/admin" : "/dashboard") : "/login"} onClick={() => setOpen(false)} className="btn-accent text-center mt-3 py-2.5">
                {user ? "Workspace" : "Client Login"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
