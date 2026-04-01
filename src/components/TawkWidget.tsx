import { useEffect } from "react";
import { useSiteData } from "@/contexts/SiteDataContext";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkWidget() {
  const { settings } = useSiteData();

  useEffect(() => {
    if (!settings?.tawkPropertyId || !settings?.tawkWidgetId) {
      return;
    }

    const existing = document.querySelector('script[data-tawk="true"]');
    if (existing) {
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${settings.tawkPropertyId}/${settings.tawkWidgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    script.dataset.tawk = "true";
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [settings?.tawkPropertyId, settings?.tawkWidgetId]);

  return null;
}
