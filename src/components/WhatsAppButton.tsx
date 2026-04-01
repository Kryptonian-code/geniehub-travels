import { MessageCircle } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

const WhatsAppButton = () => {
  const { settings } = useSiteData();
  const number = (settings?.whatsappNumber ?? "+233240000000").replace(/[^\d+]/g, "");

  return (
    <a
      href={`https://wa.me/${number.replace(/^\+/, "")}?text=Hello%2C%20I%20need%20help%20with%20travel%20services`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 shadow-lg transition-transform duration-200 hover:scale-105"
      style={{ backgroundColor: "#25D366", color: "#fff" }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline font-semibold text-sm">Chat with us</span>
    </a>
  );
};

export default WhatsAppButton;
