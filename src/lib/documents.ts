export function resolveDocumentUrl(fileUrl: string) {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("data:") || fileUrl.startsWith("blob:") || /^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (apiBaseUrl) {
    return new URL(fileUrl, `${apiBaseUrl}/`).toString();
  }

  return fileUrl;
}
