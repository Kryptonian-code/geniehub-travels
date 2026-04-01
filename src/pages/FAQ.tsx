import { useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import { useSiteData } from "@/contexts/SiteDataContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const { faqs } = useSiteData();
  const faqGroups = useMemo(() => {
    const grouped = new Map<string, typeof faqs>();
    faqs.forEach((item) => {
      const category = item.category.replace(/\b\w/g, (char) => char.toUpperCase());
      grouped.set(category, [...(grouped.get(category) ?? []), item]);
    });
    return Array.from(grouped.entries());
  }, [faqs]);

  return (
    <PageLayout title="Frequently Asked Questions" subtitle="Find answers to the most common questions about our services, processes, and policies.">
      <section className="section-padding bg-deep">
        <div className="max-w-3xl mx-auto space-y-10">
          {faqGroups.map(([category, questions]) => (
            <div key={category}>
              <h2 className="heading-sm text-accent-gold mb-4">{category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {questions.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`${category}-${index}`} className="card-theme px-5 border-theme">
                    <AccordionTrigger className="body-md font-semibold py-4 hover:no-underline" style={{ color: "var(--color-text-main)" }}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="body-sm text-muted-green pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
