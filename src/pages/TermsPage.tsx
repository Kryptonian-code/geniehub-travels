import PageLayout from "@/components/PageLayout";

const sections = [
  {
    title: "Service scope",
    body: "GenieHub supports travel, visa, study abroad, consultation, and related service workflows. Advice, timelines, pricing, and outcomes may depend on embassies, institutions, airlines, hotels, and other third parties.",
  },
  {
    title: "Client responsibilities",
    body: "Clients are responsible for providing accurate personal details, genuine supporting documents, timely responses, and payment confirmation where required. Delays caused by missing or false information may affect service delivery.",
  },
  {
    title: "Payments and fees",
    body: "Quoted fees, deposits, and consultation charges should be treated as service-linked operational amounts unless otherwise stated. Refund treatment depends on the stage reached, work already completed, and third-party non-recoverable costs.",
  },
  {
    title: "Decision outcomes",
    body: "GenieHub cannot guarantee visa approvals, admissions, bookings, or travel outcomes. Final decisions remain with the relevant institution, consulate, immigration authority, airline, or supplier.",
  },
  {
    title: "Acceptable use",
    body: "Users must not attempt unauthorized access, misuse staff credentials, upload harmful files, impersonate another person, or use the platform for unlawful activity.",
  },
];

export default function TermsPage() {
  return (
    <PageLayout title="Terms of Service" subtitle="Ground rules for using GenieHub’s travel support, client workspace, and operational services.">
      <section className="section-padding bg-deep">
        <div className="max-w-4xl mx-auto grid gap-5">
          {sections.map((section) => (
            <article key={section.title} className="card-theme p-6">
              <h2 className="heading-sm">{section.title}</h2>
              <p className="body-md text-muted-green mt-3">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
