import { z } from "zod";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "./config";

const phoneRegex = /^[+0-9()\-\s]{10,20}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uppercaseRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const digitRegex = /\d/;

export const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
export const nameSchema = z.string().trim().min(2, "Enter at least 2 characters").max(100);
export const phoneSchema = z
  .string()
  .trim()
  .regex(phoneRegex, "Enter a valid phone number");
export const optionalPhoneSchema = z
  .string()
  .trim()
  .max(20, "Phone number is too long")
  .refine((value) => !value || phoneRegex.test(value), "Enter a valid phone number")
  .optional()
  .or(z.literal(""));
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be 64 characters or fewer")
  .refine((value) => uppercaseRegex.test(value), "Password must include an uppercase letter")
  .refine((value) => lowercaseRegex.test(value), "Password must include a lowercase letter")
  .refine((value) => digitRegex.test(value), "Password must include a number");
export const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters")
  .max(100, "Slug must be 100 characters or fewer")
  .regex(slugRegex, "Use lowercase words separated by hyphens only");
export const futureDateSchema = z
  .string()
  .min(1, "Select a date")
  .refine((value) => {
    const selected = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(selected.getTime()) && selected >= today;
  }, "Choose today or a future date");

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function validateUploadFile(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Files must be ${MAX_UPLOAD_MB}MB or smaller.`);
  }

  if (file.type && !ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    throw new Error(`Allowed file types: ${ALLOWED_UPLOAD_TYPES.join(", ")}.`);
  }
}
