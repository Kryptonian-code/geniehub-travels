import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import HeroSection from "@/components/HeroSection";
import ServicesOverview from "@/components/ServicesOverview";
import DestinationsSection from "@/components/DestinationsSection";
import ProcessSteps from "@/components/ProcessSteps";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQPreview from "@/components/FAQPreview";
import ContactCTA from "@/components/ContactCTA";
import BlogPreviewSection from "@/components/BlogPreviewSection";

const Index = () => (
  <>
    <Navbar />
    <main id="main-content">
      <HeroSection />
      <ServicesOverview />
      <DestinationsSection />
      <ProcessSteps />
      <BlogPreviewSection />
      <TestimonialsSection />
      <FAQPreview />
      <ContactCTA />
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default Index;
