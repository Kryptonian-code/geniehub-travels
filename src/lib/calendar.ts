import type { ConsultationBooking } from "./types";

function formatDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function downloadConsultationCalendar(consultation: ConsultationBooking) {
  const [year, month, day] = consultation.date.split("-").map(Number);
  const [timePart, meridiem] = consultation.time.split(" ");
  const [rawHour, minute] = timePart.split(":").map(Number);
  let hour = rawHour % 12;
  if (meridiem?.toUpperCase() === "PM") {
    hour += 12;
  }
  const start = new Date(Date.UTC(year, (month || 1) - 1, day || 1, hour, minute || 0));
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GenieHub//Consultations//EN",
    "BEGIN:VEVENT",
    `UID:${consultation.id}@geniehub.co`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:GenieHub Consultation - ${consultation.service}`,
    `DESCRIPTION:${(consultation.notes || "GenieHub consultation booking").replace(/\n/g, " ")}`,
    `LOCATION:${consultation.meetingType}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${consultation.service.toLowerCase().replace(/\s+/g, "-")}-consultation.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}
