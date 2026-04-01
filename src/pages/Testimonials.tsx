import PageLayout from "@/components/PageLayout";
import { Star } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

export default function Testimonials() {
  const { testimonials } = useSiteData();

  return (
    <PageLayout title="Testimonials" subtitle="Real stories from clients who wanted more clarity, better follow-up, and a smoother application journey.">
      <section className="section-padding bg-deep">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {testimonials.map((story) => (
            <div key={story.id} className="card-theme p-6 md:p-7">
              {story.imageUrl && (
                <div className="mb-5 h-16 w-16 overflow-hidden rounded-2xl bg-deep-green/60">
                  <img src={story.imageUrl} alt={story.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="var(--color-warning)" style={{ color: "var(--color-warning)" }} />
                ))}
              </div>
              <p className="body-md text-muted-green italic mb-5">"{story.quote}"</p>
              <div>
                <p className="body-sm font-semibold" style={{ color: "var(--color-text-main)" }}>{story.name}</p>
                <p className="caption text-muted-green">{story.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
