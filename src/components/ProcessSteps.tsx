import { motion } from "framer-motion";
import { MessageSquare, FileSearch, Send, CheckCircle } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";
import { getContentSection } from "@/lib/siteContent";

const steps = [
  { icon: MessageSquare, title: "Tell Us Your Goal", desc: "Book a free consultation and share your travel or study plans with our team." },
  { icon: FileSearch, title: "We Review & Advise", desc: "Our experts assess your eligibility, gather documents, and prepare your application." },
  { icon: Send, title: "We Submit & Follow Up", desc: "We handle submissions, track progress, and keep you informed every step of the way." },
  { icon: CheckCircle, title: "You Travel", desc: "Get your visa approval, pack your bags, and start your journey with confidence." },
];

const iconMap = {
  MessageSquare,
  FileSearch,
  Send,
  CheckCircle,
} as const;

const ProcessSteps = () => {
  const { contentBlocks } = useSiteData();
  const managedSteps = getContentSection(contentBlocks, "homepage_process_steps");
  const fallbackManagedSteps = getContentSection(contentBlocks, "why_choose_us");
  const contentItems = managedSteps.length ? managedSteps : fallbackManagedSteps;
  const items = managedSteps.length
    ? managedSteps.map((item, index) => ({
        icon: iconMap[(item.icon as keyof typeof iconMap) ?? "MessageSquare"] ?? MessageSquare,
        title: item.title,
        desc: item.description ?? item.content,
        stepLabel: item.ctaLabel || item.content || `Step ${index + 1}`,
      }))
    : contentItems.length
    ? contentItems.map((item, index) => ({
        icon: iconMap[(item.icon as keyof typeof iconMap) ?? "MessageSquare"] ?? MessageSquare,
        title: item.title,
        desc: item.description ?? item.content,
        stepLabel: item.ctaLabel || item.content || `Step ${index + 1}`,
      }))
    : steps.map((item, index) => ({ ...item, stepLabel: `Step ${index + 1}` }));

  return (
    <section className="section-padding bg-deep">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="caption text-accent-gold uppercase tracking-widest">How It Works</span>
          <h2 className="heading-lg mt-2" style={{ color: "var(--color-text-main)" }}>
            Simple Process, Real Results
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((s, i) => (
          <motion.div
            key={s.title}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "var(--color-surface)" }}>
              <s.icon size={24} style={{ color: "var(--color-accent)" }} />
            </div>
            <span className="caption text-accent-gold font-semibold">{s.stepLabel}</span>
            <h3 className="heading-sm mt-1 mb-2" style={{ color: "var(--color-text-main)", fontSize: "1.1rem" }}>{s.title}</h3>
            <p className="body-sm text-muted-green">{s.desc}</p>
          </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
