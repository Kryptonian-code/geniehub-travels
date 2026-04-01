import { STORAGE_KEYS, createId, readStorage, writeStorage } from "./storage";

interface ClientErrorLog {
  id: string;
  message: string;
  source: string;
  createdAt: string;
  path: string;
}

function saveClientError(message: string, source: string) {
  if (typeof window === "undefined") {
    return;
  }

  const logs = readStorage<ClientErrorLog[]>(STORAGE_KEYS.clientErrorLogs, []);
  const nextEntry: ClientErrorLog = {
    id: createId("error"),
    message,
    source,
    createdAt: new Date().toISOString(),
    path: window.location.pathname,
  };
  writeStorage(STORAGE_KEYS.clientErrorLogs, [nextEntry, ...logs].slice(0, 50));
}

export function installMonitoring() {
  if (typeof window === "undefined" || import.meta.env.VITE_ENABLE_MONITORING === "false") {
    return;
  }

  window.addEventListener("error", (event) => {
    saveClientError(event.message, event.filename || "window.error");
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
    saveClientError(message, "unhandledrejection");
  });
}
