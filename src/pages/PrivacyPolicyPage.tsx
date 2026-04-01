import PageLayout from "@/components/PageLayout";

const sections = [
  {
    title: "What we collect",
    body: "GenieHub stores the information needed to deliver travel support responsibly, including contact details, profile information, booking requests, application records, uploaded documents, messages, and payment references.",
  },
  {
    title: "Why we collect it",
    body: "We use your information to manage consultations, prepare travel or visa workflows, communicate next steps, review documents, process service requests, and keep your client dashboard accurate.",
  },
  {
    title: "Document handling",
    body: "Uploaded documents are reviewed only for service delivery, compliance, and support. Access is restricted to authorized staff based on responsibility, and sensitive files should never be shared outside approved work channels.",
  },
  {
    title: "Retention and security",
    body: "We keep data only as long as needed for active support, financial records, compliance needs, or reasonable follow-up. Administrative access is role-restricted, and password changes, resets, and document actions are tracked for accountability.",
  },
  {
    title: "Your choices",
    body: "You can request profile updates, communication preference changes, or account support through GenieHub channels. Legal or compliance obligations may still require limited record retention.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageLayout title="Privacy Policy" subtitle="How GenieHub handles client information, uploaded documents, and operational records responsibly.">
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
