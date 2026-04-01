import { ChangeEvent, DragEvent, useState } from "react";
import { toast } from "sonner";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import PaginationControls from "@/components/PaginationControls";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import { useAuth } from "@/contexts/AuthContext";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { usePagination } from "@/hooks/usePagination";
import { deleteDocument, uploadDocument } from "@/lib/backend";
import { resolveDocumentUrl } from "@/lib/documents";
import type { DocumentCategory } from "@/lib/types";

const categories: DocumentCategory[] = [
  "passport",
  "transcript",
  "certificate",
  "cv",
  "personal-statement",
  "bank-statement",
  "english-test-result",
  "id-card",
  "visa-supporting-document",
  "other",
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const { workspace, refresh, loading } = useClientDashboard();
  const [category, setCategory] = useState<DocumentCategory>("passport");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const { runAction, isPending } = useAsyncAction();
  const items = workspace?.documents ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(items, {
    defaultPageSize: 8,
  });

  async function uploadSelectedFile(file: File) {
    if (!user) return;

    try {
      setUploading(true);
      setUploadFeedback(null);
      await uploadDocument({
        userId: user.id,
        applicationId: applicationId || undefined,
        file,
        category,
        clientNotes: notes,
      });
      toast.success("Document uploaded successfully.");
      setUploadFeedback("Document uploaded successfully.");
      setNotes("");
      setApplicationId("");
      await refresh();
    } catch (error) {
      setUploadFeedback(null);
      toast.error(error instanceof Error ? error.message : "Could not upload document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadSelectedFile(file);
    event.target.value = "";
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await uploadSelectedFile(file);
  }

  async function handleDelete(documentId: string) {
    try {
      await runAction(`delete-${documentId}`, () => deleteDocument(documentId));
      toast.success("Document removed.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove document.");
    }
  }

  return (
    <DashboardShell title="Documents" subtitle="Upload, review, and manage the supporting documents tied to your travel and application journey.">
      <div className="space-y-6">
        <section className="card-theme p-6">
          <h2 className="heading-sm mb-4">Upload a document</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-text mb-1 block">Document type</label>
              <select className="field-theme" value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory)}>
                {categories.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text mb-1 block">Linked application</label>
              <select className="field-theme" value={applicationId} onChange={(event) => setApplicationId(event.target.value)}>
                <option value="">General document</option>
                {workspace?.applications.map((application) => (
                  <option key={application.id} value={application.id}>{application.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label-text mb-1 block">Notes for the team</label>
            <input className="field-theme" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Tell us what this document is for if needed." />
          </div>
          {uploadFeedback && (
            <div className="mt-4 rounded-2xl border border-[color:var(--color-success)] bg-[color:rgba(16,185,129,0.12)] px-4 py-3 body-sm text-[color:var(--color-text-main)]">
              {uploadFeedback}
            </div>
          )}
          <label
            className={`mt-4 block rounded-2xl border border-dashed px-5 py-10 text-center cursor-pointer transition-colors ${dragging ? "border-[color:var(--color-accent)] bg-surface" : "border-theme bg-surface-soft hover:border-[color:var(--color-accent)]"}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => void handleDrop(event)}
          >
            <span className="body-sm text-muted-green">{uploading ? "Uploading..." : "Drag and drop or choose a file"}</span>
            <span className="caption text-muted-green mt-2 block">Accepted: PDF, JPG, PNG, DOCX</span>
            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.docx" />
          </label>
        </section>

        <section className="card-theme p-6">
          <h2 className="heading-sm mb-4">Uploaded documents</h2>
          {loading || !workspace ? (
            <DashboardLoadingState cards={2} lines={3} />
          ) : workspace.documents.length ? (
            <div className="space-y-3">
              {paginatedItems.map((document) => (
                <div key={document.id} className="card-theme-soft p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="body-sm">{document.fileName}</p>
                      <p className="caption text-muted-green mt-1">
                        {document.category.replaceAll("-", " ")} | {Math.round(document.fileSize / 1024)} KB | {new Date(document.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={document.status} />
                  </div>
                  {(document.clientNotes || document.adminNotes) && (
                    <p className="caption text-muted-green mt-3">{document.adminNotes ?? document.clientNotes}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a className="btn-outline-theme py-2 px-3 text-sm" href={resolveDocumentUrl(document.fileUrl)} target="_blank" rel="noreferrer">
                      Download
                    </a>
                    <button type="button" className="btn-outline-theme py-2 px-3 text-sm" onClick={() => setPreviewDocumentId(document.id)}>
                      Preview
                    </button>
                    <button type="button" className="btn-outline-theme py-2 px-3 text-sm" onClick={() => void handleDelete(document.id)} disabled={isPending(`delete-${document.id}`)}>
                      {isPending(`delete-${document.id}`) ? "Deleting..." : "Delete"}
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
                pageSizeOptions={[8, 16, 32, 64]}
              />
            </div>
          ) : (
            <EmptyState title="Nothing here yet" description="Upload your passport, transcripts, certificates, or visa support documents here and we will review them." />
          )}
        </section>
      </div>
      <DocumentPreviewModal document={workspace?.documents.find((item) => item.id === previewDocumentId) ?? null} onClose={() => setPreviewDocumentId(null)} />
    </DashboardShell>
  );
}
