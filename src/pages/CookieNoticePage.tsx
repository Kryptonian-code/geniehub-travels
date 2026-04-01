import PageLayout from "@/components/PageLayout";

const items = [
  "Essential session cookies keep sign-in, dashboard access, and secure workspace flows working properly.",
  "Preference cookies may be used to remember safe UI choices such as workspace state or local demo settings.",
  "Operational measurement scripts should only be enabled when configured through approved environment variables.",
  "You should review this notice again whenever analytics, error monitoring, or notification integrations are added to production.",
];

export default function CookieNoticePage() {
  return (
    <PageLayout title="Cookie Notice" subtitle="A simple overview of how GenieHub uses cookies and local browser storage to keep the product working well.">
      <section className="section-padding bg-deep">
        <div className="max-w-4xl mx-auto card-theme p-6 md:p-8">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item} className="card-theme-soft p-4 body-md text-muted-green">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageLayout>
  );
}
