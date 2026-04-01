import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import { downloadReceipt } from "@/lib/receipts";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

export default function PaymentsPage() {
  const { user } = useAuth();
  const { workspace, loading } = useClientDashboard();
  const items = workspace?.payments ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(items, {
    defaultPageSize: 8,
  });

  return (
    <DashboardShell title="Payments" subtitle="Track consultation fees, application fees, service deposits, and any receipts linked to your account.">
      <section className="card-theme p-6">
        {loading || !workspace ? (
          <DashboardLoadingState cards={2} lines={2} />
        ) : workspace.payments.length ? (
          <div className="space-y-3">
            {paginatedItems.map((payment) => (
              <div key={payment.id} className="card-theme-soft p-4">
                <div className="grid md:grid-cols-[1.35fr_0.7fr_0.8fr_auto_auto] gap-4 items-center">
                  <div>
                    <p className="body-sm">{payment.category.replaceAll("-", " ")}</p>
                    <p className="caption text-muted-green mt-1">{payment.reference} | {new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="body-sm">{payment.currency} {payment.amount.toLocaleString()}</p>
                  <p className="caption text-muted-green">{payment.applicationId ?? payment.consultationId ?? payment.serviceRequestId ?? "General"}</p>
                  <StatusBadge status={payment.status} />
                  <button type="button" className="btn-outline-theme py-2 px-4 text-sm" onClick={() => downloadReceipt(payment, user?.fullName ?? "Client")}>
                    Receipt
                  </button>
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
        ) : (
          <EmptyState title="Nothing here yet" description="Payments raised for consultations, applications, or services will show up here with their reference and receipt status." />
        )}
      </section>
    </DashboardShell>
  );
}
