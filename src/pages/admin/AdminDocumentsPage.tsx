import { useMemo, useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import PaginationControls from "@/components/PaginationControls";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagination } from "@/hooks/usePagination";
import { resolveDocumentUrl } from "@/lib/documents";

export default function AdminDocumentsPage() {
  const { workspace, loading, reviewDocument } = useAdminDashboard();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const { runAction, isPending } = useAsyncAction();
  const debouncedQuery = useDebouncedValue(query);
  const filteredDocuments = useMemo(() => {
    if (!workspace) return [];
    return workspace.documents.filter((document) => {
      const matchesQuery = [document.fileName, document.category, document.clientNotes, document.adminNotes]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(debouncedQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || document.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [debouncedQuery, statusFilter, workspace]);
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(filteredDocuments, {
    defaultPageSize: 10,
  });

  async function handleReview(documentId: string, status: string, adminNotes: string | undefined, message: string) {
    try {
      await runAction(`review-${documentId}`, () => reviewDocument(documentId, status as never, adminNotes));
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the document review.");
    }
  }

  return (
    <AdminShell title="Document Review Center" subtitle="Preview uploaded files, leave review notes, and request re-uploads without exposing documents outside the authorized team workspace.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={2} lines={4} />
      ) : workspace.documents.length ? (
        <div className="space-y-4">
          <div className="card-theme p-4 grid md:grid-cols-[1fr_220px] gap-3">
            <label className="block">
              <span className="label-text mb-1 block">Search documents</span>
              <input className="field-theme" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by filename, category, or note" />
            </label>
            <label className="block">
              <span className="label-text mb-1 block">Review status</span>
              <select className="field-theme" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending-review">Pending review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="re-upload-required">Re-upload required</option>
              </select>
            </label>
          </div>
          {filteredDocuments.length ? paginatedItems.map((document) => (
            <div key={document.id} className="card-theme p-5">
              <div className="grid xl:grid-cols-[1.1fr_0.9fr_auto] gap-4 items-start">
                <div>
                  <p className="body-sm">{document.fileName}</p>
                  <p className="caption text-muted-green mt-1">{document.category.replaceAll("-", " ")} | {Math.round(document.fileSize / 1024)} KB</p>
                  <p className="caption text-muted-green mt-2">Client note: {document.clientNotes ?? "No note provided."}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" className="caption text-accent-gold inline-flex hover:underline" onClick={() => setPreviewDocumentId(document.id)}>Preview document</button>
                    <a className="caption text-accent-gold inline-flex hover:underline" href={resolveDocumentUrl(document.fileUrl)} target="_blank" rel="noreferrer">Download file</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label-text mb-1 block">Review status</label>
                    <select className="field-theme" value={document.status} disabled={isPending(`review-${document.id}`)} onChange={(event) => void handleReview(document.id, event.target.value, notes[document.id] ?? document.adminNotes, "Document review updated.")}>
                      <option value="pending-review">Pending review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="re-upload-required">Re-upload required</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text mb-1 block">Review note</label>
                    <textarea className="field-theme" rows={3} value={notes[document.id] ?? document.adminNotes ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [document.id]: event.target.value }))} placeholder="Add a review note for the client or internal team." />
                  </div>
                </div>
                <button className="btn-accent" type="button" disabled={isPending(`review-${document.id}`)} onClick={() => void handleReview(document.id, document.status, notes[document.id] ?? document.adminNotes, "Document review saved.")}>
                  {isPending(`review-${document.id}`) ? "Saving..." : "Save review"}
                </button>
              </div>
            </div>
          )) : <EmptyState title="No matching documents" description="Try another search term or review status filter." />}
          {filteredDocuments.length > 0 && (
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
        <EmptyState title="No uploaded documents yet" description="Client uploads will appear here for review as soon as they arrive." />
      )}
      <DocumentPreviewModal document={workspace?.documents.find((item) => item.id === previewDocumentId) ?? null} onClose={() => setPreviewDocumentId(null)} />
    </AdminShell>
  );
}
