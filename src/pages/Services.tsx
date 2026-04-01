import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { GraduationCap, FileText, Map, Plane, Hotel, Calendar, ArrowRight } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";
import { getContentSection } from "@/lib/siteContent";

const services = [
  { icon: GraduationCap, title: "Study Abroad", desc: "Complete support from university selection to visa approval for UK, Canada, USA, Australia, and Europe.", link: "/study-abroad", features: ["University matching", "Application support", "Scholarship guidance", "Pre-departure briefing"] },
  { icon: FileText, title: "Visa Assistance", desc: "Expert guidance for student, tourist, work, business, and dependent visa applications.", link: "/visa-assistance", features: ["Document checklist", "Application review", "Interview preparation", "Follow-up support"] },
  { icon: Map, title: "Tour Packages", desc: "Handpicked local and international tour packages for individuals, couples, and groups.", link: "/tours", features: ["Customised itineraries", "Group & private tours", "All-inclusive options", "Local guided experiences"] },
  { icon: Plane, title: "Flight Booking", desc: "We search and compare to find you the best flight deals for any destination worldwide.", link: "/flights-hotels", features: ["Best rate guarantee", "Multi-city routing", "Flexible booking", "24/7 support"] },
  { icon: Hotel, title: "Hotel Booking", desc: "From budget-friendly to luxury travel stays with pricing that fits your trip.", link: "/flights-hotels", features: ["Verified properties", "Corporate rates", "Last-minute deals", "Cancellation support"] },
  { icon: Calendar, title: "Travel Consultation", desc: "One-on-one expert sessions to plan your travel strategy, study pathway, or visa approach.", link: "/book-consultation", features: ["Personalised advice", "Eligibility check", "Timeline planning", "Budget guidance"] },
];

export default function Services() {
  const { servicePricing, settings, contentBlocks } = useSiteData();
  const serviceBlocks = getContentSection(contentBlocks, "homepage_services");
  const items = serviceBlocks.length
    ? serviceBlocks.map((item, index) => ({
        icon: services[index % services.length].icon,
        title: item.title,
        desc: item.description ?? "Contact the team for full service details.",
        link: item.ctaHref || item.content || "/services",
        features: [item.description ?? "Guided support tailored to your travel and application goals."],
      }))
    : services;

  return (
    <PageLayout title="Our Services" subtitle="From visa applications to dream vacations, we provide end-to-end travel support tailored to your needs.">
      <section className="section-padding bg-deep">
        <div className="max-w-7xl mx-auto space-y-8">
          {items.map((service) => {
            const priceMatch = servicePricing.find(
              (item) =>
                item.visible &&
                [item.name.toLowerCase(), item.category.toLowerCase()].some((value) =>
                  service.title.toLowerCase().includes(value.split(" ")[0]),
                ),
            );

            return (
              <div key={service.title} className="card-theme p-6 md:p-8 grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-surface-soft)" }}>
                      <service.icon size={20} style={{ color: "var(--color-accent)" }} />
                    </div>
                    <h3 className="heading-sm" style={{ color: "var(--color-text-main)" }}>{service.title}</h3>
                  </div>
                  <p className="body-md text-muted-green mb-4">{service.desc}</p>
                  {priceMatch && (
                    <p className="caption text-accent-gold mb-4">
                      From {priceMatch.currency || settings?.defaultCurrency || "GHS"} {priceMatch.price.toLocaleString()}
                    </p>
                  )}
                  <Link to={service.link} className="inline-flex items-center gap-1 body-sm text-accent-gold hover:underline">
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="body-sm text-muted-green flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-success)" }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </PageLayout>
  );
}
