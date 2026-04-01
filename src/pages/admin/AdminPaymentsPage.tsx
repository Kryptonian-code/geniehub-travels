import { useMemo, useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import PaginationControls from "@/components/PaginationControls";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagination } from "@/hooks/usePagination";
import { downloadReceipt } from "@/lib/receipts";

export default function AdminPaymentsPage() {
  const { workspace, loading, updatePayment } = useAdminDashboard();
  const { runAction, isPending } = useAsyncAction();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedQuery = useDebouncedValue(query);
  const filteredPayments = useMemo(() => {
    if (!workspace) return [];
    return workspace.payments.filter((payment) => {
      const matchesQuery = [payment.reference, payment.category, payment.currency]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(debouncedQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [debouncedQuery, statusFilter, workspace]);
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(filteredPayments, {
    defaultPageSize: 10,
  });

  async function handlePaymentUpdate(paymentId: string, status: string) {
    try {
      await runAction(`payment-${paymentId}`, () => updatePayment(paymentId, { status: status as never }));
      toast.success(status === "paid" ? "Payment recorded successfully." : "Payment status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update payment.");
    }
  }

  return (
    <AdminShell title="Payments" subtitle="Confirm payment statuses, review references, and keep receipts and linked workflows aligned with client progress.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={2} lines={3} />
      ) : workspace.payments.length ? (
        <div className="space-y-4">
          <div className="card-theme p-4 grid md:grid-cols-[1fr_220px] gap-3">
            <label className="block">
              <span className="label-text mb-1 block">Search payments</span>
              <input className="field-theme" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by reference or category" />
            </label>
            <label className="block">
              <span className="label-text mb-1 block">Payment status</span>
              <select className="field-theme" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>
          </div>
          {filteredPayments.length ? paginatedItems.map((payment) => (
            <div key={payment.id} className="card-theme p-5">
              <div className="grid xl:grid-cols-[1fr_0.8fr_0.8fr_auto_auto] gap-4 items-center">
                <div>
                  <p className="body-sm">{payment.category.replaceAll("-", " ")}</p>
                  <p className="caption text-muted-green mt-1">{payment.reference} | {new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="body-sm">{payment.currency} {payment.amount.toLocaleString()}</p>
                <select className="field-theme" value={payment.status} disabled={isPending(`payment-${payment.id}`)} onChange={(event) => void handlePaymentUpdate(payment.id, event.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                {payment.receiptUrl ? <a className="btn-outline-theme text-sm py-2 px-4" href={payment.receiptUrl} target="_blank" rel="noreferrer">Receipt</a> : <button className="btn-outline-theme text-sm py-2 px-4" type="button" onClick={() => downloadReceipt(payment)}>Generate receipt</button>}
              </div>
            </div>
          )) : <EmptyState title="No matching payments" description="Try another reference or payment status." />}
          {filteredPayments.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          )}
        </div>
      ) : (
        <EmptyState title="No payments yet" description="Consultation fees, application fees, and service deposits will appear here." />
      )}
    </AdminShell>
  );
}
