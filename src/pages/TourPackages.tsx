import PageLayout from "@/components/PageLayout";
import ContactCTA from "@/components/ContactCTA";
import { Link } from "react-router-dom";
import { Clock, MapPin, Users } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";
import kakumImg from "@/assets/destination-kakum.jpg";
import elminaImg from "@/assets/destination-elmina.jpg";
import moleImg from "@/assets/destination-mole.jpg";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

const fallbackImageMap = [elminaImg, kakumImg, moleImg];

const TourPackages = () => {
  const { tourPackages } = useSiteData();
  const items = tourPackages.map((tour, index) => ({
    id: tour.id,
    title: tour.title,
    destination: tour.destination,
    duration: tour.duration,
    price: tour.startingPrice,
    capacity: tour.inclusions ?? "Contact the team for group sizing and package details.",
    img: tour.imageUrl || fallbackImageMap[index % fallbackImageMap.length],
    desc: tour.description || tour.itinerarySummary,
  }));
  const {
    paginatedItems,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination(items, { defaultPageSize: 6 });

  return (
    <PageLayout title="Tour Packages" subtitle="Handcrafted travel experiences across Ghana and beyond. Choose a package and send your enquiry to the team.">
      <section className="section-padding bg-deep">
        <div className="max-w-7xl mx-auto space-y-8">
          {!items.length && (
            <div className="card-theme p-8 text-center">
              <h2 className="heading-sm" style={{ color: "var(--color-text-main)" }}>No tour packages published yet</h2>
              <p className="body-md text-muted-green mt-3">Once the team publishes travel packages from the admin dashboard, they will appear here automatically.</p>
            </div>
          )}

          {paginatedItems.map((tour) => (
            <div key={tour.title} className="card-theme overflow-hidden grid md:grid-cols-5">
              <div className="md:col-span-2 h-56 md:h-auto">
                <img src={tour.img} alt={tour.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="heading-sm mb-2" style={{ color: "var(--color-text-main)" }}>{tour.title}</h3>
                  <p className="body-md text-muted-green mb-4">{tour.desc}</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <span className="flex items-center gap-1 body-sm text-muted-green"><MapPin size={14} style={{ color: "var(--color-accent)" }} /> {tour.destination}</span>
                    <span className="flex items-center gap-1 body-sm text-muted-green"><Clock size={14} style={{ color: "var(--color-accent)" }} /> {tour.duration}</span>
                    <span className="flex items-center gap-1 body-sm text-muted-green"><Users size={14} style={{ color: "var(--color-accent)" }} /> {tour.capacity}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="heading-sm text-accent-gold">{tour.price}</span>
                  <div className="flex gap-3">
                    <Link to={`/tours/${tour.id}`} className="btn-outline-theme text-sm py-2 px-5">View details</Link>
                    <Link to="/flights-hotels" className="btn-primary text-sm py-2 px-5">Request Tour Plan</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </section>
      <ContactCTA />
    </PageLayout>
  );
};

export default TourPackages;
