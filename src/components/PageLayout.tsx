import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const PageLayout = ({ children, title, subtitle }: Props) => (
  <>
    <Navbar />
    <main id="main-content" className="pt-20 md:pt-24">
      {/* Page header */}
      <section className="section-padding bg-surface pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="heading-xl" style={{ color: "var(--color-text-main)" }}>{title}</h1>
          {subtitle && <p className="body-lg text-muted-green mt-3 max-w-2xl">{subtitle}</p>}
        </div>
      </section>
      {children}
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default PageLayout;
