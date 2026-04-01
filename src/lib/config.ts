const DEFAULT_MAX_UPLOAD_MB = 10;
const DEFAULT_UPLOAD_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function parsePositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseList(value: string | undefined, fallback: string[]) {
  if (!value) {
    return fallback;
  }

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length ? items : fallback;
}

export const APP_NAME = import.meta.env.VITE_APP_NAME?.trim() || "GenieHub";
export const MAX_UPLOAD_MB = parsePositiveNumber(import.meta.env.VITE_MAX_UPLOAD_MB, DEFAULT_MAX_UPLOAD_MB);
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = parseList(import.meta.env.VITE_ALLOWED_UPLOAD_TYPES, DEFAULT_UPLOAD_TYPES);
