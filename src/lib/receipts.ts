import type { PaymentRecord } from "./types";

export function downloadReceipt(payment: PaymentRecord, clientLabel = "Client") {
  const receiptText = [
    "GenieHub Receipt",
    "------------------------------",
    `Client: ${clientLabel}`,
    `Reference: ${payment.reference}`,
    `Category: ${payment.category.replaceAll("-", " ")}`,
    `Amount: ${payment.currency} ${payment.amount.toLocaleString()}`,
    `Status: ${payment.status}`,
    `Issued: ${new Date(payment.createdAt).toLocaleString()}`,
  ].join("\n");

  const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${payment.reference.toLowerCase()}-receipt.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}
