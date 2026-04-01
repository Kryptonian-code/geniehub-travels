import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ThankYou = () => {
  const location = useLocation();
  const state = (location.state ?? {}) as {
    title?: string;
    message?: string;
    returnTo?: string;
    returnLabel?: string;
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center bg-deep">
        <div className="text-center max-w-md mx-auto px-5">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "var(--color-surface)" }}>
            <CheckCircle size={32} style={{ color: "var(--color-success)" }} />
          </div>
          <h1 className="heading-lg mb-3" style={{ color: "var(--color-text-main)" }}>{state.title ?? "Thank You!"}</h1>
          <p className="body-md text-muted-green mb-8">
            {state.message ?? "Your request has been received. Our team will review it and get back to you within 24 hours. Check your email and WhatsApp for updates."}
          </p>
          <Link to={state.returnTo ?? "/"} className="btn-accent inline-block">
            {state.returnLabel ?? "Return Home"}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ThankYou;
