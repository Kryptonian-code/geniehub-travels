import PageLayout from "@/components/PageLayout";
import { Shield, Users, Globe, Award } from "lucide-react";

const values = [
  { icon: Shield, title: "Trust First", desc: "We operate with full transparency. No hidden fees, no empty promises, just honest guidance." },
  { icon: Users, title: "People Over Process", desc: "Every client gets personalised attention. Your progress is visible, supported, and never left hanging." },
  { icon: Globe, title: "Global Reach, Local Heart", desc: "Based in Accra and connected worldwide, GenieHub combines local understanding with international workflows." },
  { icon: Award, title: "Proven Systems", desc: "From consultations to document collection and application tracking, we build processes that reduce friction and improve follow-through." },
];

const About = () => (
  <PageLayout title="About GenieHub" subtitle="We built GenieHub to make travel applications, client communication, and admin follow-up far more reliable.">
    <section className="section-padding bg-deep">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="heading-md mb-4" style={{ color: "var(--color-text-main)" }}>Our Story</h2>
            <div className="space-y-4 body-md text-muted-green">
              <p>
                GenieHub started from a simple observation: too many clients were juggling scattered chats, unclear updates, and manual document sharing while travel teams were also buried in follow-up work.
              </p>
              <p>
                We wanted something better, a platform where consultations, visa applications, uploads, tour enquiries, blog content, and team operations could live together without the usual confusion.
              </p>
              <p>
                The result is a travel operations hub built for clarity. Clients can track their progress, and the admin team can manage leads, content, and application movement from a single workspace.
              </p>
            </div>
          </div>
          <div className="card-theme p-8">
            <h3 className="heading-sm mb-6 text-accent-gold">Quick Facts</h3>
            <div className="space-y-4">
              {[
                { label: "Base", value: "Accra, Ghana" },
                { label: "Primary Focus", value: "Travel operations" },
                { label: "Client Features", value: "Auth, tracking, uploads" },
                { label: "Admin Features", value: "Leads, blog, settings" },
                { label: "Deployment Mode", value: "Local demo + XAMPP-ready" },
              ].map((fact) => (
                <div key={fact.label} className="flex justify-between border-b border-theme pb-3">
                  <span className="body-sm text-muted-green">{fact.label}</span>
                  <span className="body-sm font-semibold" style={{ color: "var(--color-text-main)" }}>{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto">
        <h2 className="heading-md mb-10 text-center" style={{ color: "var(--color-text-main)" }}>What We Stand For</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div key={value.title} className="card-theme-soft p-6">
              <value.icon size={28} className="mb-3" style={{ color: "var(--color-accent)" }} />
              <h3 className="body-md font-semibold mb-2" style={{ color: "var(--color-text-main)" }}>{value.title}</h3>
              <p className="body-sm text-muted-green">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PageLayout>
);

export default About;
