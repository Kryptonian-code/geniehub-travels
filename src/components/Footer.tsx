import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Ghost, Linkedin, Music4 } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";
import { getManagedLinks } from "@/lib/siteContent";

const Footer = () => {
  const { settings, contentBlocks } = useSiteData();
  const quickLinks = getManagedLinks(contentBlocks, "footer_quick_links", [
    { label: "Study Abroad", path: "/study-abroad" },
    { label: "Visa Assistance", path: "/visa-assistance" },
    { label: "Tour Packages", path: "/tours" },
    { label: "Flights & Hotels", path: "/flights-hotels" },
    { label: "Book Consultation", path: "/book-consultation" },
  ]);
  const supportLinks = getManagedLinks(contentBlocks, "footer_support_links", [
    { label: "FAQ", path: "/faq" },
    { label: "Blog", path: "/blog" },
    { label: "Testimonials", path: "/testimonials" },
    { label: "Contact Us", path: "/contact" },
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms", path: "/terms" },
    { label: "Cookie Notice", path: "/cookie-notice" },
  ]);
  const socialLinks = [
    { key: "instagram", href: settings?.instagramUrl, icon: Instagram, label: "Instagram" },
    { key: "facebook", href: settings?.facebookUrl, icon: Facebook, label: "Facebook" },
    { key: "twitter", href: settings?.twitterUrl, icon: Twitter, label: "Twitter" },
    { key: "snapchat", href: settings?.snapchatUrl, icon: Ghost, label: "Snapchat" },
    { key: "linkedin", href: settings?.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { key: "tiktok", href: settings?.tiktokUrl, icon: Music4, label: "TikTok" },
  ].filter((item) => item.href);

  return (
    <footer className="bg-surface border-t border-theme">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <h3 className="heading-sm text-accent-gold mb-3">{settings?.brandName ?? "GenieHub"}</h3>
            <p className="body-sm text-muted-green leading-relaxed">
              {settings?.tagline ?? "Smarter travel applications, client tracking, and admin operations in one place."}
            </p>
          </div>

          <div>
            <h4 className="label-text text-accent-gold mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="body-sm text-muted-green hover:text-accent-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label-text text-accent-gold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="body-sm text-muted-green hover:text-accent-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label-text text-accent-gold mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 body-sm text-muted-green">
                <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                {settings?.officeAddress ?? "East Legon, Accra, Ghana"}
              </li>
              <li className="flex items-center gap-2 body-sm text-muted-green">
                <Phone size={16} className="shrink-0" style={{ color: "var(--color-accent)" }} />
                {settings?.phone ?? "+233 24 000 0000"}
              </li>
              <li className="flex items-center gap-2 body-sm text-muted-green">
                <Mail size={16} className="shrink-0" style={{ color: "var(--color-accent)" }} />
                {settings?.supportEmail ?? "hello@geniehub.co"}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-theme text-muted-green transition-colors hover:text-accent-gold hover:border-[color:var(--color-accent)]"
              >
                <item.icon size={16} />
              </a>
            ))}
          </div>
          <p className="caption text-muted-green">(c) {new Date().getFullYear()} {settings?.brandName ?? "GenieHub"}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/faq" className="caption text-muted-green hover:text-accent-gold transition-colors">FAQ</Link>
            <Link to="/contact" className="caption text-muted-green hover:text-accent-gold transition-colors">Support</Link>
            <Link to="/privacy-policy" className="caption text-muted-green hover:text-accent-gold transition-colors">Privacy</Link>
            <Link to="/terms" className="caption text-muted-green hover:text-accent-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
