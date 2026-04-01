import { Link } from "react-router-dom";
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

export default function AdminLeadsPage() {
  const { workspace, loading, saveLead } = useAdminDashboard();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { runAction, isPending } = useAsyncAction();
  const debouncedQuery = useDebouncedValue(query);
  const filteredLeads = useMemo(() => {
    if (!workspace) return [];
    return workspace.leads.filter((lead) => {
      const matchesQuery = [lead.fullName, lead.email, lead.source, lead.destination, lead.serviceType, lead.message]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(debouncedQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [debouncedQuery, statusFilter, workspace]);
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(filteredLeads, {
    defaultPageSize: 10,
  });

  async function handleLeadPatch(leadId: string, patch: Record<string, unknown>, successMessage: string) {
    try {
      await runAction(`lead-${leadId}-${Object.keys(patch)[0]}`, () => saveLead(leadId, patch));
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the lead.");
    }
  }

  return (
    <AdminShell title="Leads & Enquiries" subtitle="Search, assign, prioritize, and move new enquiries into the right workflow before opportunities go cold.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={2} lines={4} />
      ) : workspace.leads.length ? (
        <div className="space-y-4">
          <div className="card-theme p-4 grid md:grid-cols-[1fr_220px] gap-3">
            <label className="block">
              <span className="label-text mb-1 block">Search leads</span>
              <input className="field-theme" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by client, source, destination, or message" />
            </label>
            <label className="block">
              <span className="label-text mb-1 block">Status</span>
              <select className="field-theme" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="awaiting-documents">Awaiting documents</option>
                <option value="in-progress">In progress</option>
                <option value="closed">Closed</option>
                <option value="lost">Lost</option>
              </select>
            </label>
          </div>
          {filteredLeads.length ? paginatedItems.map((lead) => (
            <div key={lead.id} className="card-theme p-5">
              <div className="grid xl:grid-cols-[1.2fr_0.8fr_auto] gap-4 items-start">
                <div>
                  <p className="body-sm">{lead.fullName}</p>
                  <p className="caption text-muted-green mt-1">{lead.source} | {lead.email} {lead.phone ? `| ${lead.phone}` : ""}</p>
                  <p className="caption text-muted-green mt-2">{lead.serviceType?.replaceAll("-", " ") ?? "General enquiry"} {lead.destination ? `| ${lead.destination}` : ""}</p>
                  <p className="body-sm mt-3">{lead.message}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <select className="field-theme caption px-3 py-2 min-h-[2.75rem]" value={lead.status} disabled={isPending(`lead-${lead.id}-status`)} onChange={(event) => void handleLeadPatch(lead.id, { status: event.target.value }, "Lead status updated.")}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="awaiting-documents">Awaiting documents</option>
                    <option value="in-progress">In progress</option>
                    <option value="closed">Closed</option>
                    <option value="lost">Lost</option>
                  </select>
                  <select className="field-theme caption px-3 py-2 min-h-[2.75rem]" value={lead.priority} disabled={isPending(`lead-${lead.id}-priority`)} onChange={(event) => void handleLeadPatch(lead.id, { priority: event.target.value }, "Lead priority updated.")}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <Link to={`/admin/leads/${lead.id}`} className="btn-outline-theme text-sm py-2 px-4 inline-flex justify-center">Open detail</Link>
              </div>
            </div>
          )) : <EmptyState title="No matching leads" description="Try a different search term or clear the lead status filter." />}
          {filteredLeads.length > 0 && (
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
        <EmptyState title="No leads yet" description="Incoming enquiries from contact, tours, consultations, and visa forms will show up here." />
      )}
    </AdminShell>
  );
}
