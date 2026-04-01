import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

const TestimonialsSection = () => {
  const { testimonials } = useSiteData();
  const featured = testimonials.filter((item) => item.featured).slice(0, 3);

  return (
    <section className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="caption text-accent-gold uppercase tracking-widest">Client Stories</span>
          <h2 className="heading-lg mt-2" style={{ color: "var(--color-text-main)" }}>
            Real People, Real Progress
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="card-theme-soft p-6 md:p-7 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {testimonial.imageUrl && (
                <div className="mb-5 h-16 w-16 overflow-hidden rounded-2xl bg-deep-green/60">
                  <img src={testimonial.imageUrl} alt={testimonial.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={16} fill="var(--color-warning)" style={{ color: "var(--color-warning)" }} />
                ))}
              </div>
              <p className="body-md text-muted-green italic flex-1 mb-5">"{testimonial.quote}"</p>
              <div>
                <p className="body-sm font-semibold" style={{ color: "var(--color-text-main)" }}>{testimonial.name}</p>
                <p className="caption text-muted-green">{testimonial.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
