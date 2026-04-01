import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Globe } from "lucide-react";
import heroImg from "@/assets/hero-ghana.jpg";
import { useSiteData } from "@/contexts/SiteDataContext";
import { getContentSection } from "@/lib/siteContent";

const HeroSection = () => {
  const { settings, contentBlocks } = useSiteData();
  const trustPoints = getContentSection(contentBlocks, "trust_points");
  const heroActions = getContentSection(contentBlocks, "homepage_hero_actions");
  const defaultTrustPoints = [
    { title: "Secure client workspace", icon: Shield },
    { title: "Bookings, tracking, and uploads in one place", icon: Globe },
  ];
  const heroTrustPoints = trustPoints.length
    ? trustPoints.map((item, index) => ({
        title: item.title,
        icon: index === 0 ? Shield : Globe,
      }))
    : defaultTrustPoints;
  const actionItems = heroActions.length
    ? heroActions.slice(0, 2).map((item, index) => ({
        label: item.ctaLabel || item.title,
        href: item.ctaHref || item.content || (index === 0 ? "/signup" : "/services"),
        variant: index === 0 ? "accent" : "outline",
      }))
    : [
        { label: "Create Client Account", href: "/signup", variant: "accent" as const },
        { label: "Explore Services", href: "/services", variant: "outline" as const },
      ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Ghana coastline" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(6,47,38,0.92) 0%, rgba(11,58,48,0.85) 50%, rgba(6,47,38,0.75) 100%)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-32 md:py-40">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <span className="inline-block body-sm text-accent-gold mb-4 tracking-wide uppercase">Client care, applications, and travel ops</span>
          </motion.div>

          <motion.h1
            className="heading-xl mb-6"
            style={{ color: "var(--color-text-main)" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {settings?.heroTitle ?? "Travel planning, visa applications, and client care from one intelligent hub."}
          </motion.h1>

          <motion.p
            className="body-lg text-muted-green mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            {settings?.heroSubtitle ?? "GenieHub helps travellers and students book consultations, track application progress, upload documents, and stay aligned with your team."}
          </motion.p>

          <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            {actionItems.map((action, index) => (
              <Link
                key={`${action.href}-${action.label}`}
                to={action.href}
                className={action.variant === "accent" ? "btn-accent inline-flex items-center gap-2" : "btn-outline-theme inline-flex items-center gap-2"}
              >
                {action.label}
                {index === 0 && <ArrowRight size={16} />}
              </Link>
            ))}
          </motion.div>

          <motion.div className="flex flex-wrap gap-6 mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
            {heroTrustPoints.map((item) => (
              <div key={item.title} className="flex items-center gap-2 body-sm text-muted-green">
                <item.icon size={16} style={{ color: "var(--color-success)" }} />
                {item.title}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
