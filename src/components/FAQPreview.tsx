import { Link } from "react-router-dom";
import { useSiteData } from "@/contexts/SiteDataContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPreview = () => {
  const { faqs } = useSiteData();
  const previewFaqs = faqs.slice(0, 4);

  return (
    <section className="section-padding bg-deep">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="caption text-accent-gold uppercase tracking-widest">Common Questions</span>
          <h2 className="heading-lg mt-2" style={{ color: "var(--color-text-main)" }}>
            Got Questions? We've Got Answers
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {previewFaqs.map((faq, index) => (
            <AccordionItem key={faq.id} value={`faq-${index}`} className="card-theme px-5 border-theme">
              <AccordionTrigger className="body-md font-semibold py-4 hover:no-underline" style={{ color: "var(--color-text-main)" }}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="body-sm text-muted-green pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-8">
          <Link to="/faq" className="btn-outline-theme inline-block text-sm py-2 px-6">
            View All FAQs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQPreview;
