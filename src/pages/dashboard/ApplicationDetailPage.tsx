import { Link, useParams } from "react-router-dom";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import { useEffect, useState } from "react";
import type { ClientApplicationDetail } from "@/lib/types";

export default function ApplicationDetailPage() {
  const { applicationId = "" } = useParams();
  const { getApplicationDetail } = useClientDashboard();
  const [application, setApplication] = useState<ClientApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getApplicationDetail(applicationId)
      .then((result) => {
        setApplication(result);
        setError("");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [applicationId, getApplicationDetail]);

  return (
    <DashboardShell title="Application Detail" subtitle="Review the full timeline, related checklist items, payments, and supporting information for this case.">
      {loading ? (
        <DashboardLoadingState cards={2} lines={4} />
      ) : error || !application ? (
        <EmptyState title="Application not found" description={error || "We could not find this application in your workspace."} />
      ) : (
        <div className="space-y-6">
          <section className="card-theme p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="caption text-accent-gold uppercase tracking-wide">{application.sourceType.replaceAll("-", " ")}</p>
                <h2 className="heading-md mt-2">{application.title}</h2>
                <p className="body-sm text-muted-green mt-2">{application.currentStage}</p>
              </div>
              <StatusBadge status={application.status} />
            </div>
            {application.nextRequiredAction && <p className="body-md mt-5">{application.nextRequiredAction}</p>}
          </section>

          <section className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="card-theme p-6">
              <h3 className="heading-sm mb-4">Progress timeline</h3>
              <div className="space-y-4">
                {application.timeline.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="mt-1 flex flex-col items-center">
                      <span className={`h-3.5 w-3.5 rounded-full ${item.complete ? "bg-[color:var(--color-success)]" : "bg-surface-soft border border-theme"}`} />
                      <span className="mt-2 h-full w-px bg-theme" />
                    </div>
                    <div className="pb-5">
                      <p className="body-sm">{item.title}</p>
                      <p className="caption text-muted-green mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <section className="card-theme p-6">
                <h3 className="heading-sm mb-4">Checklist</h3>
                <div className="space-y-3">
                  {application.checklistItems.map((item) => (
                    <div key={item.id} className="card-theme-soft p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="body-sm">{item.title}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="caption text-muted-green mt-2">{item.description}</p>
                    </div>
                  ))}
                  {!application.checklistItems.length && <EmptyState title="Nothing here yet" description="The team has not added any task for this application yet." />}
                </div>
              </section>

              <section className="card-theme p-6">
                <h3 className="heading-sm mb-4">Payment summary</h3>
                <div className="space-y-3">
                  {application.paymentSummary.map((payment) => (
                    <div key={payment.id} className="card-theme-soft p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="body-sm">{payment.category.replaceAll("-", " ")}</p>
                        <StatusBadge status={payment.status} />
                      </div>
                      <p className="caption text-muted-green mt-2">
                        {payment.currency} {payment.amount.toLocaleString()} | {payment.reference}
                      </p>
                    </div>
                  ))}
                  {!application.paymentSummary.length && <EmptyState title="No payments linked" description="Payments connected to this application will show here." />}
                </div>
              </section>
            </div>
          </section>

          <Link to="/dashboard/applications" className="btn-outline-theme inline-flex">Back to applications</Link>
        </div>
      )}
    </DashboardShell>
  );
}
