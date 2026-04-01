import { Link } from "react-router-dom";
import { GraduationCap, FileText, Plane, Map, Hotel, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteData } from "@/contexts/SiteDataContext";
import { getContentSection } from "@/lib/siteContent";

const services = [
  {
    icon: GraduationCap,
    title: "Study Abroad",
    desc: "Full support from school selection to visa approval. UK, Canada, USA, Australia and more.",
    link: "/study-abroad",
  },
  {
    icon: FileText,
    title: "Visa Assistance",
    desc: "Student, tourist, work & business visa processing with expert document guidance.",
    link: "/visa-assistance",
  },
  {
    icon: Map,
    title: "Tour Packages",
    desc: "Curated local and international tour experiences. Cape Coast, Dubai, Turkey and beyond.",
    link: "/tours",
  },
  {
    icon: Plane,
    title: "Flight Booking",
    desc: "Best-rate flight support for any destination. We compare and book the best deals for you.",
    link: "/flights-hotels",
  },
  {
    icon: Hotel,
    title: "Hotel Booking",
    desc: "From budget stays to luxury resorts — we find accommodation that fits your trip.",
    link: "/flights-hotels",
  },
  {
    icon: Calendar,
    title: "Consultation",
    desc: "One-on-one sessions to plan your travel, study abroad pathway, or visa strategy.",
    link: "/book-consultation",
  },
];

const iconMap = {
  GraduationCap,
  FileText,
  Map,
  Plane,
  Hotel,
  Calendar,
} as const;

const ServicesOverview = () => {
  const { contentBlocks } = useSiteData();
  const serviceBlocks = getContentSection(contentBlocks, "homepage_services");
  const items = serviceBlocks.length
    ? serviceBlocks.map((item) => ({
        icon: iconMap[(item.icon as keyof typeof iconMap) ?? "FileText"] ?? FileText,
        title: item.title,
        desc: item.description ?? item.content,
        link: item.content.startsWith("/") ? item.content : "/services",
      }))
    : services;

  return (
    <section className="section-padding bg-deep">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="caption text-accent-gold uppercase tracking-widest">What We Offer</span>
          <h2 className="heading-lg mt-2" style={{ color: "var(--color-text-main)" }}>
            Everything You Need to Travel With Confidence
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
          >
            <Link
              to={s.link}
              className="card-theme p-6 md:p-7 block group hover:border-ghana-accent transition-all duration-300 h-full"
              style={{ borderColor: "var(--color-border)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            >
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "var(--color-surface-soft)" }}>
                <s.icon size={22} style={{ color: "var(--color-accent)" }} />
              </div>
              <h3 className="heading-sm mb-2" style={{ color: "var(--color-text-main)" }}>{s.title}</h3>
              <p className="body-sm text-muted-green">{s.desc}</p>
            </Link>
          </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
