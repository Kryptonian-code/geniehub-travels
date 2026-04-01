import PageLayout from "@/components/PageLayout";
import ContactCTA from "@/components/ContactCTA";
import { Link } from "react-router-dom";
import { useSiteData } from "@/contexts/SiteDataContext";
import { getContentSection } from "@/lib/siteContent";

const fallbackCountries = [
  { name: "United Kingdom", intake: "Sep & Jan", popular: ["Business", "Engineering", "Nursing", "IT"] },
  { name: "Canada", intake: "Sep, Jan & May", popular: ["Computer Science", "Healthcare", "Business Admin"] },
  { name: "United States", intake: "Fall & Spring", popular: ["MBA", "Engineering", "Medicine"] },
  { name: "Australia", intake: "Feb & Jul", popular: ["IT", "Nursing", "Accounting", "Engineering"] },
  { name: "Germany", intake: "Oct & Apr", popular: ["Engineering", "Computer Science", "Business"] },
  { name: "Ireland", intake: "Sep & Jan", popular: ["Pharmacy", "IT", "Business", "Nursing"] },
];

const StudyAbroad = () => {
  const { studyAbroadRecords, contentBlocks } = useSiteData();
  const items = studyAbroadRecords.length
    ? studyAbroadRecords.map((item) => ({
        name: item.country,
        intake: item.intakeInfo,
        popular: item.programmes.split(/,|\n/).map((entry) => entry.trim()).filter(Boolean),
      }))
    : fallbackCountries;
  const supportItems = getContentSection(contentBlocks, "study_abroad_support");
  const helpItems = supportItems.length
    ? supportItems.map((item) => item.title)
    : [
        "University & programme selection",
        "Application & personal statement support",
        "Scholarship search & guidance",
        "Document preparation & verification",
        "Visa application & interview prep",
        "Pre-departure orientation",
        "Accommodation guidance",
        "Post-arrival support",
      ];

  return (
    <PageLayout title="Study Abroad" subtitle="We guide Ghanaian students from school selection to visa approval — making your dream of studying overseas a reality.">
      <section className="section-padding bg-deep">
        <div className="max-w-7xl mx-auto">
          <h2 className="heading-md mb-8" style={{ color: "var(--color-text-main)" }}>Country Guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item.name} className="card-theme p-6">
                <h3 className="heading-sm mb-2" style={{ color: "var(--color-accent)" }}>{item.name}</h3>
                <p className="body-sm text-muted-green mb-3">Intake: {item.intake}</p>
                <div className="flex flex-wrap gap-2">
                  {item.popular.map((programme) => (
                    <span key={programme} className="caption px-2 py-1 rounded" style={{ backgroundColor: "var(--color-surface-soft)", color: "var(--color-text-muted)" }}>
                      {programme}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card-theme-soft p-8 mt-12">
            <h2 className="heading-md mb-4" style={{ color: "var(--color-text-main)" }}>How We Help You</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {helpItems.map((item) => (
                <div key={item} className="flex items-center gap-2 body-sm text-muted-green">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-success)" }} />
                  {item}
                </div>
              ))}
            </div>
            <Link to="/book-consultation" className="btn-accent inline-block mt-6">
              Start Your Application
            </Link>
          </div>
        </div>
      </section>
      <ContactCTA />
    </PageLayout>
  );
};

export default StudyAbroad;
