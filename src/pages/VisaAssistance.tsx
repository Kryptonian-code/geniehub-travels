import PageLayout from "@/components/PageLayout";
import ContactCTA from "@/components/ContactCTA";
import { Link } from "react-router-dom";
import { FileText, GraduationCap, Briefcase, Users, Building } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

const fallbackVisaTypes = [
  { icon: GraduationCap, title: "Student Visa", desc: "For Ghanaians pursuing education abroad. We handle the full application from document prep to submission.", requirements: ["Valid passport", "Admission letter", "Financial proof", "English test results", "Medical report"], ctaEnabled: true },
  { icon: FileText, title: "Tourist Visa", desc: "Planning a vacation or visiting family? We make the tourist visa process smooth and hassle-free.", requirements: ["Valid passport", "Travel itinerary", "Bank statement", "Hotel booking", "Return ticket"], ctaEnabled: true },
  { icon: Briefcase, title: "Work Visa", desc: "Got a job offer abroad? We help you navigate work permits and employment visa requirements.", requirements: ["Job offer letter", "Valid passport", "Qualification docs", "Police clearance", "Medical report"], ctaEnabled: true },
  { icon: Users, title: "Dependent Visa", desc: "Joining a family member abroad? We assist with dependent and spousal visa applications.", requirements: ["Sponsor documents", "Relationship proof", "Valid passport", "Financial evidence", "Accommodation proof"], ctaEnabled: true },
  { icon: Building, title: "Business Visa", desc: "For entrepreneurs and professionals attending conferences, meetings, or exploring business opportunities.", requirements: ["Business invitation", "Company registration", "Valid passport", "Bank statement", "Travel insurance"], ctaEnabled: true },
];

const iconMap = [GraduationCap, FileText, Briefcase, Users, Building];

const VisaAssistance = () => {
  const { visaServices } = useSiteData();
  const items = visaServices.length
    ? visaServices.map((item, index) => ({
        icon: iconMap[index % iconMap.length],
        title: item.title,
        desc: item.seoDescription || item.pricingNote || item.checklistContent,
        requirements: item.requirements.split(/,|\n/).map((entry) => entry.trim()).filter(Boolean),
        ctaEnabled: item.ctaEnabled,
      }))
    : fallbackVisaTypes;

  return (
    <PageLayout title="Visa Assistance" subtitle="We guide applications with practical document support, clear requirements, and steady follow-up from start to decision.">
      <section className="section-padding bg-deep">
        <div className="max-w-7xl mx-auto space-y-8">
          {items.map((item) => (
            <div key={item.title} className="card-theme p-6 md:p-8 grid md:grid-cols-5 gap-6">
              <div className="md:col-span-3">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon size={22} style={{ color: "var(--color-accent)" }} />
                  <h3 className="heading-sm" style={{ color: "var(--color-text-main)" }}>{item.title}</h3>
                </div>
                <p className="body-md text-muted-green mb-4">{item.desc}</p>
                {item.ctaEnabled && (
                  <Link to="/book-consultation" className="inline-flex items-center gap-1 body-sm text-accent-gold hover:underline">
                    Start this application →
                  </Link>
                )}
              </div>
              <div className="md:col-span-2">
                <h4 className="label-text text-accent-gold mb-3 uppercase tracking-wider">Key Requirements</h4>
                <ul className="space-y-2">
                  {item.requirements.map((requirement) => (
                    <li key={requirement} className="body-sm text-muted-green flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-success)" }} />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
      <ContactCTA />
    </PageLayout>
  );
};

export default VisaAssistance;
