# GenieHub

GenieHub is a Vite + React + TypeScript travel operations platform with:

- client signup and login
- a full client dashboard for applications, documents, consultations, payments, messages, notifications, and profile settings
- a full admin dashboard for operations, CMS management, and team workflows
- XAMPP-ready PHP + MySQL integration with local demo fallback
- stronger form validation, safer file uploads, and responsive workspace views

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run preview` previews the production build locally.
- `npm run test` runs the Vitest test suite.

## Environment

Copy `.env.example` to `.env` and adjust the values for your local setup:

- `VITE_APP_NAME` controls the frontend app label.
- `VITE_API_BASE_URL` should point to your Apache-served `api` folder.
- client authentication automatically uses Firebase only when `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID` are all present
- if any of those Firebase values are missing, GenieHub falls back to the local auth provider automatically
- `VITE_MAX_UPLOAD_MB` sets the client-side upload size limit.
- `VITE_ALLOWED_UPLOAD_TYPES` controls which MIME types the client accepts before upload.
- `VITE_GA_MEASUREMENT_ID` enables Google Analytics page-view tracking when present.
- `VITE_ENABLE_MONITORING` documents whether client-side monitoring should be active in that environment.
- `VITE_PAYSTACK_PUBLIC_KEY`, `VITE_TWILIO_WHATSAPP_NUMBER`, and `VITE_MAIL_FROM_EMAIL` support the recommended fastest-launch stack
- server-side secrets such as `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `PAYSTACK_SECRET_KEY`, and `PAYSTACK_WEBHOOK_SECRET` stay in `.env` for local PHP wiring

## Database

Run `xampp/schema.sql` in phpMyAdmin or MySQL to create the required tables.

If you are upgrading from an older local database, re-import the schema or add the new admin tables for content, operational metadata, staff roles, password recovery, and audit logging before testing the full admin module.

## Production Hardening Highlights

- secure password recovery flow with request and recovery routes
- first-login password reset support for staff and admin-issued resets
- auth rate limiting in the PHP API
- stronger file validation using extension and MIME checks
- role-aware backend protection for content, operations, finance, and super-admin actions
- audit logging for major admin actions such as settings changes, staff onboarding, workflow updates, and CMS saves
- non-blank branded loading experience during app boot and route changes
- optional analytics bootstrapping and client-side monitoring hooks

## Client Dashboard

The client dashboard is part of the same GenieHub design system as the public website. It reuses the existing font stack, theme tokens, button styles, card surfaces, spacing rhythm, and interaction states instead of introducing a separate admin-template UI.

### Routes

- `/dashboard`
- `/dashboard/applications`
- `/dashboard/applications/:applicationId`
- `/dashboard/documents`
- `/dashboard/consultations`
- `/dashboard/service-requests`
- `/dashboard/payments`
- `/dashboard/checklist`
- `/dashboard/messages`
- `/dashboard/notifications`
- `/dashboard/profile`

### Feature Overview

- dashboard overview with summary cards, quick actions, recent notifications, and a progress snapshot
- application tracking across visa, consultation, travel, and service-request records
- document upload center with category selection, drag-and-drop upload, preview, delete, and review statuses
- consultation management with booking, reschedule, and cancel support
- additional service requests for flight, hotel, SOP, visa, dependent support, and study abroad help
- payment history for consultation fees and application-related charges
- guided checklist for next steps
- secure client messaging with conversation threads
- notifications and profile settings

### How Authentication Works

- public users sign up through `/signup` or sign in through `/login`
- client auth uses the `authProvider` abstraction in `src/lib/auth/authProvider.ts`
- when Firebase env values are configured, client login and signup use Firebase-based authentication
- when Firebase is not configured, the app automatically falls back to the local/XAMPP auth system without breaking the shared UI
- users can request a secure reset link through `/forgot-password` and complete recovery through `/recover-password`
- protected client routes use the existing route guard and redirect unauthenticated users back to login
- after login, users can access `/dashboard`
- `/portal` remains available as a compatibility redirect to `/dashboard`
- admin users still use `/admin`; client routes do not expose admin tools

### How Document Uploads Work

- client uploads are validated on the frontend before submission
- accepted formats are controlled by `VITE_ALLOWED_UPLOAD_TYPES`
- file size is controlled by `VITE_MAX_UPLOAD_MB`
- uploaded file metadata stores category, review status, notes, and linked application when available
- clients can preview and remove uploaded files from the dashboard
- local demo mode stores file content in browser storage
- XAMPP/PHP mode stores files in `api/uploads` and metadata in MySQL

### Storage Configuration

- frontend storage limits and allowed file types come from `.env`
- PHP upload rules and storage path live in `api/config.php`
- local demo mode uses browser storage for rapid testing
- XAMPP mode uses MySQL plus the Apache-served `api/uploads` directory
- backup and recovery notes now live in `docs/operations.md`

### Dashboard Theme Source

- shared site theme variables are defined in `src/index.css`
- Tailwind token mapping lives in `tailwind.config.ts`
- dashboard-specific layout and status components extend the existing surfaces and typography instead of redefining them

### Setup Notes For Dashboard Data

1. Re-run `xampp/schema.sql` so the new dashboard tables are created.
2. Make sure `api/uploads` is writable by Apache.
3. If you already had an older database, update the `documents` table with the new dashboard metadata columns or re-import the schema into a fresh local database.
4. Start Apache and MySQL before testing dashboard actions against the PHP API.

## Admin Dashboard

The admin dashboard extends the same GenieHub visual system as the public website and client workspace. It uses the same CSS variables, Tailwind tokens, typography, surfaces, spacing rhythm, and interaction patterns instead of introducing a generic back-office template.

### Admin Routes

- `/admin`
- `/admin/leads`
- `/admin/leads/:leadId`
- `/admin/applications`
- `/admin/applications/:applicationId`
- `/admin/documents`
- `/admin/consultations`
- `/admin/service-requests`
- `/admin/payments`
- `/admin/clients`
- `/admin/messages`
- `/admin/notifications`
- `/admin/visa-services`
- `/admin/study-abroad`
- `/admin/tour-packages`
- `/admin/blog`
- `/admin/testimonials`
- `/admin/faqs`
- `/admin/contact-submissions`
- `/admin/content`
- `/admin/settings`
- `/admin/users`

### Module Overview

- operations overview with summary cards, quick actions, recent activity, upcoming consultations, and recent payments
- lead and enquiry management with status, priority, assignment, detail view, and internal notes
- application management with stage updates, internal notes, client-facing updates, linked documents, linked payments, checklist context, and consultation context
- document review center with secure preview links, review statuses, and re-upload notes
- consultations, service requests, payments, clients, messages, and notifications management
- CMS areas for visa services, study abroad content, tour packages, blog posts, testimonials, FAQs, and structured content blocks
- settings management for brand, support, contact, hero, and operational display content
- admin users directory with role labels for super admin, admin, content manager, operations staff, and finance staff
- service pricing management for consultations, SOP help, visa support, travel support, and other configurable offers
- integrated live-chat inbox structure for synced Tawk-style conversations, assignment, and reply workflows

### Roles And Permissions

- demo mode supports client and admin access through the shared auth flow
- admin routes are protected by the existing `AdminRoute`
- the admin users module stores role intent for `super-admin`, `admin`, `content-manager`, `operations-staff`, and `finance-staff`
- frontend navigation and route guards only show staff the modules assigned to their role
- PHP/MySQL endpoints now enforce role-aware access on key admin actions including settings, payments, blog, staff management, and CMS collections

### How Admin Auth Works

- sign in through `/login`
- users with role `admin` are redirected to `/admin`
- users with role `client` are redirected to `/dashboard`
- unauthenticated visits to admin routes are redirected back to login
- local demo mode seeds `admin@geniehub.co / Admin123!` for workspace testing

### Content And Settings Areas

- visa services: country or route-specific requirements, notes, and CTA controls
- study abroad: destinations, intake notes, and programme support content
- tour packages: duration, featured state, visibility, pricing, itinerary summary, inclusions, exclusions, and travel dates
- blog: post creation, editing, publishing state, and deletion
- testimonials: category, featured state, display order, and approval status
- FAQs: category-based questions and answers
- content blocks: homepage and shared site content without introducing a page builder, with section keys, ordering, icon choice, CTA fields, and visibility toggles
- settings: business identity, support contact data, office details, social channels, hero copy, live-chat widget ids, default currency, and chat assignment defaults

### Admin-Managed Public Content

- shared marketing sections now support structured admin-managed content blocks through the `content_blocks` table
- original homepage and service content is preserved as the default seed content, so the site still looks right before any admin edits
- frontend sections such as homepage services, trust points, process steps, footer social links, public service pricing, and public tour packages now read from admin-managed records with safe fallbacks

### Live Chat Integration Structure

- the public site can load the Tawk widget when `tawkPropertyId` and `tawkWidgetId` are saved in admin settings
- synced chat data is modeled through `chat_threads` and `chat_messages`
- admin messaging now includes a live-chat inbox area for assignment and reply
- staff members can be marked as chat agents through the admin user/settings workflow
- the current backend is structured for Tawk webhook syncing while keeping the admin reply and assignment UI inside GenieHub

### Admin Storage And Setup Notes

- browser demo mode stores admin workspace collections in local storage for fast testing
- XAMPP schema now includes tables for admin metadata, content modules, and role assignments
- when `VITE_API_BASE_URL` is configured, the admin workspace now loads from the PHP API and persists operational metadata, document reviews, message replies, payments, audit logs, password recovery records, and CMS records into MySQL
- local storage remains as the fallback only when the API is not configured, which keeps demo mode usable without Apache/MySQL

### Dashboard Theme Source

- shared theme variables live in `src/index.css`
- Tailwind token mapping lives in `tailwind.config.ts`
- workspace chrome is shared through `src/components/WorkspaceLayout.tsx`
- admin navigation and surface patterns extend the same cards, buttons, badges, and spacing rules used across the public site and client dashboard

## XAMPP Setup

1. Put the project in `C:\xampp\htdocs\ghanaian-dream-travel-main` or create an Apache alias to it.
2. Import `xampp/schema.sql` into MySQL.
3. Adjust `api/config.php` if your MySQL credentials, upload limits, or local frontend origins differ from the defaults.
4. Make sure Apache can write to `api/uploads`.
5. Leave the Firebase env values blank if you want local auth fallback, or fill them in to switch client auth to Firebase.
6. Create or update an admin user in MySQL so you can access `/admin`.
7. Start Apache and MySQL in XAMPP, then run `npm run dev` for the frontend.

## Deployment Readiness

- `docs/operations.md` now includes backup and recovery guidance for database and upload files
- schema updates should be applied in a test environment before production rollout
- if you are updating an existing install, export the database and `api/uploads` before importing the latest schema
- configure analytics only by setting `VITE_GA_MEASUREMENT_ID`
- client-side monitoring hooks are available for error capture and can be paired with your preferred backend log collector
- final production SEO still depends on real page copy, metadata review, and search-console submission

## What Was Tightened

- stronger validation for signup, consultations, contact, tour enquiries, and visa submissions
- safer upload checks for file size and MIME type on both frontend and PHP API
- richer admin controls for lead, consultation, tour, and visa status management
- full client dashboard routing, layout, and workspace pages
- full admin dashboard routing, shell, operations views, and CMS areas
- blog editing with slug cleanup, draft publishing, and delete support
- public blog detail pages instead of placeholder "Read more" links
- accessibility improvements such as skip links, stronger focus states, and better mobile spacing
