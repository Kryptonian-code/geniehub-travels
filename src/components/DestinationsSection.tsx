import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import kakumImg from "@/assets/destination-kakum.jpg";
import elminaImg from "@/assets/destination-elmina.jpg";
import moleImg from "@/assets/destination-mole.jpg";
import { useSiteData } from "@/contexts/SiteDataContext";

const fallbackImageMap = [kakumImg, elminaImg, moleImg];

const DestinationsSection = () => {
  const { tourPackages } = useSiteData();
  const destinations = tourPackages
    .filter((item) => item.featured && item.status === "published" && item.visible !== false)
    .slice(0, 3)
    .map((item, index) => ({
      name: item.title,
      tag: item.destination,
      img: item.imageUrl || fallbackImageMap[index % fallbackImageMap.length],
      path: `/tours/${item.id}`,
    }));

  if (!destinations.length) {
    return null;
  }

  return (
    <section className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="caption text-accent-gold uppercase tracking-widest">Popular Destinations</span>
          <h2 className="heading-lg mt-2" style={{ color: "var(--color-text-main)" }}>Explore Ghana & Beyond</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {destinations.map((d, i) => (
            <motion.div
              key={d.name}
              className="relative rounded-xl overflow-hidden group"
              style={{ aspectRatio: "4/3" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <Link to={d.path} className="block h-full w-full">
                <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <span className="caption uppercase tracking-wider px-2 py-1 rounded" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-background)" }}>
                    {d.tag}
                  </span>
                  <h3 className="heading-sm mt-2" style={{ color: "#fff" }}>{d.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
