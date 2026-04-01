import type { DocumentRecord } from "@/lib/types";
import { useEffect, useState } from "react";
import { resolveDocumentUrl } from "@/lib/documents";

function isImage(document: DocumentRecord) {
  return (document.mimeType ?? document.fileType).startsWith("image/");
}

function isPdf(document: DocumentRecord) {
  return (document.mimeType ?? document.fileType).includes("pdf") || document.fileName.toLowerCase().endsWith(".pdf");
}

export default function DocumentPreviewModal({
  document,
  onClose,
}: {
  document: DocumentRecord | null;
  onClose: () => void;
}) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const previewUrl = resolveDocumentUrl(document?.fileUrl ?? "");

  useEffect(() => {
    if (!document) return;
    setPreviewFailed(false);
  }, [document]);

  useEffect(() => {
    if (!document) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [document, onClose]);

  if (!document) {
    return null;
  }
  const canPreviewInline = (isImage(document) || isPdf(document)) && !previewFailed;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(6,47,38,0.72)] p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Preview ${document.fileName}`}>
      <div className="w-full max-w-5xl rounded-3xl border border-theme bg-surface p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="heading-sm">{document.fileName}</h3>
            <p className="caption text-muted-green mt-2">
              {(document.mimeType ?? document.fileType) || "Unknown format"} | {Math.round(document.fileSize / 1024)} KB
            </p>
          </div>
          <div className="flex gap-2">
            <a className="btn-outline-theme py-2 px-4 text-sm" href={previewUrl} target="_blank" rel="noreferrer">
              Download
            </a>
            <button type="button" className="btn-outline-theme py-2 px-4 text-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-2xl border border-theme bg-surface-soft min-h-[26rem] overflow-hidden">
            {isImage(document) && canPreviewInline ? (
              <img src={previewUrl} alt={document.fileName} className="h-full w-full object-contain" onError={() => setPreviewFailed(true)} />
            ) : isPdf(document) && canPreviewInline ? (
              <object data={previewUrl} type={document.mimeType ?? "application/pdf"} className="h-[32rem] w-full">
                <iframe src={previewUrl} title={document.fileName} className="h-[32rem] w-full border-0" onError={() => setPreviewFailed(true)} />
              </object>
            ) : (
              <div className="grid h-[24rem] place-items-center px-6 text-center">
                <div className="space-y-3">
                  <p className="body-sm text-muted-green">
                    {previewFailed
                      ? "We could not open this file inside the dashboard preview."
                      : "Preview is supported for PDF, JPG, and PNG files. Use the download button to open this file externally."}
                  </p>
                  <a className="btn-outline-theme inline-flex py-2 px-4 text-sm" href={previewUrl} target="_blank" rel="noreferrer">
                    Open file in a new tab
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="card-theme-soft p-4">
            <p className="label-text mb-2 block">File details</p>
            <p className="body-sm">{document.originalFileName ?? document.fileName}</p>
            <p className="caption text-muted-green mt-2">Category: {document.category.replaceAll("-", " ")}</p>
            <p className="caption text-muted-green mt-2">Status: {document.status.replaceAll("-", " ")}</p>
            {document.clientNotes && <p className="caption text-muted-green mt-4">Client note: {document.clientNotes}</p>}
            {document.adminNotes && <p className="caption text-muted-green mt-4">Admin note: {document.adminNotes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
