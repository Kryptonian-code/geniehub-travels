import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

const ContactCTA = () => {
  const { settings } = useSiteData();

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--color-surface-soft)" }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="heading-lg mb-4" style={{ color: "var(--color-text-main)" }}>
          Ready to move your application forward?
        </h2>
        <p className="body-lg text-muted-green mb-8 max-w-xl mx-auto">
          Create your GenieHub account, talk to the team, and keep every enquiry, document, and progress update in one place.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="btn-accent inline-flex items-center gap-2">
            Create Account <ArrowRight size={16} />
          </Link>
          <a href={`tel:${settings?.phone ?? "+233240000000"}`} className="btn-outline-theme inline-flex items-center gap-2">
            <Phone size={16} /> {settings?.phone ?? "Call Us"}
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
