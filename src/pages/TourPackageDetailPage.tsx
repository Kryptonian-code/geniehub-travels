import { Link, useParams } from "react-router-dom";
import { Clock, MapPin, ArrowLeft } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ContactCTA from "@/components/ContactCTA";
import { useSiteData } from "@/contexts/SiteDataContext";

function splitList(value?: string) {
  return (value ?? "")
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function TourPackageDetailPage() {
  const { packageId } = useParams();
  const { tourPackages } = useSiteData();
  const item = tourPackages.find((entry) => entry.id === packageId);

  if (!item) {
    return (
      <PageLayout title="Package Not Found" subtitle="This travel package is unavailable or no longer published.">
        <section className="section-padding bg-deep">
          <div className="max-w-3xl mx-auto card-theme p-8">
            <p className="body-md text-muted-green mb-6">
              Head back to the full packages page to browse the latest published travel packages.
            </p>
            <Link to="/tours" className="btn-accent inline-flex">
              Back to tour packages
            </Link>
          </div>
        </section>
      </PageLayout>
    );
  }

  const inclusions = splitList(item.inclusions);
  const exclusions = splitList(item.exclusions);

  return (
    <PageLayout title={item.title} subtitle={item.description || item.itinerarySummary}>
      <section className="section-padding bg-deep">
        <div className="max-w-5xl mx-auto space-y-6">
          <Link to="/tours" className="inline-flex items-center gap-2 caption text-accent-gold hover:underline">
            <ArrowLeft size={14} /> Back to all packages
          </Link>

          {item.imageUrl && (
            <div className="overflow-hidden rounded-[28px] border border-theme bg-surface-soft">
              <img src={item.imageUrl} alt={item.title} className="h-[320px] w-full object-cover md:h-[420px]" />
            </div>
          )}

          <div className="card-theme p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="caption uppercase tracking-wide text-accent-gold">{item.featured ? "Featured package" : "Travel package"}</p>
                <h2 className="heading-lg">{item.title}</h2>
                <div className="flex flex-wrap gap-4 text-muted-green">
                  <span className="inline-flex items-center gap-2 body-sm"><MapPin size={16} /> {item.destination}</span>
                  <span className="inline-flex items-center gap-2 body-sm"><Clock size={16} /> {item.duration}</span>
                </div>
              </div>
              <div className="card-theme-soft min-w-[220px] p-5">
                <p className="caption text-muted-green">Starting from</p>
                <p className="heading-sm text-accent-gold mt-2">{item.startingPrice}</p>
                <p className="caption text-muted-green mt-2">{item.travelPeriod}</p>
                {item.travelDates && <p className="caption text-muted-green mt-1">{item.travelDates}</p>}
                <Link to="/flights-hotels" className="btn-accent mt-4 inline-flex w-full justify-center text-sm">
                  Request this package
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="heading-sm">Overview</h3>
                  <p className="body-md text-muted-green mt-3">{item.description || item.itinerarySummary}</p>
                </div>
                <div>
                  <h3 className="heading-sm">Itinerary summary</h3>
                  <p className="body-md text-muted-green mt-3">{item.itinerarySummary}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="heading-sm">What is included</h3>
                  {inclusions.length ? (
                    <ul className="mt-3 space-y-2">
                      {inclusions.map((entry) => (
                        <li key={entry} className="body-sm text-muted-green flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]" />
                          {entry}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="body-sm text-muted-green mt-3">Contact the team for the full package inclusions.</p>
                  )}
                </div>
                <div>
                  <h3 className="heading-sm">What is not included</h3>
                  {exclusions.length ? (
                    <ul className="mt-3 space-y-2">
                      {exclusions.map((entry) => (
                        <li key={entry} className="body-sm text-muted-green flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                          {entry}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="body-sm text-muted-green mt-3">Ask the team to confirm the exclusions and optional extras.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ContactCTA />
    </PageLayout>
  );
}
