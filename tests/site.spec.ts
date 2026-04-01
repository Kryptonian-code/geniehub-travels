import { expect, test } from "@playwright/test";

test.describe.configure({ timeout: 180000 });

test("auth page exposes client and admin login toggles", async ({ page }) => {
  await page.goto("/login?workspace=admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Admin login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Client Login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admin Login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" })).not.toBeVisible();

  await page.getByRole("link", { name: "Client Login" }).click();
  await expect(page).toHaveURL(/workspace=client/);
  await expect(page.getByRole("heading", { name: "Client login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
});

test("public navigation works", async ({ page, isMobile }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /travel planning, visa applications/i })).toBeVisible();

  if (isMobile) {
    await page.getByRole("button", { name: "Toggle menu" }).click();
  }

  const nav = page.getByRole("navigation");
  await nav.getByRole("link", { name: "Services", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Our Services" })).toBeVisible();

  if (isMobile) {
    await page.getByRole("button", { name: "Toggle menu" }).click();
  }

  await nav.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await page.getByRole("link", { name: /read more/i }).first().click();
  await expect(page.getByRole("link", { name: /need help with your application/i })).toBeVisible();

  if (isMobile) {
    await page.getByRole("button", { name: "Toggle menu" }).click();
  }

  await nav.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();
});

test("public forms submit successfully", async ({ page }) => {
  await page.goto("/book-consultation", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Full Name").fill("Test Client");
  await page.getByLabel("Phone").fill("+233240001111");
  await page.getByLabel("Email").fill("client@example.com");
  await page.getByLabel("Service").selectOption("Visa Application Support");
  await page.getByLabel("Preferred Date").fill("2026-04-10");
  await page.getByLabel("Preferred Time").selectOption("10:00 AM");
  await page.getByLabel("Meeting Type").selectOption("video");
  await page.getByRole("button", { name: "Book My Consultation" }).click();
  await expect(page).toHaveURL(/thank-you/);

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Name").fill("Test Client");
  await page.getByLabel("Email").fill("client@example.com");
  await page.getByLabel("Phone (optional)").fill("+233240001111");
  await page.getByLabel("Subject").fill("Need help with a visa");
  await page.getByLabel("Message").fill("Checking that the contact form saves correctly.");
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();
});

test("client signup, portal tracking, and mobile nav work", async ({ page, isMobile }) => {
  await page.goto("/signup", { waitUntil: "domcontentloaded" });
  const uniqueEmail = `client-${Date.now()}@example.com`;
  await page.getByLabel("Full name").fill("Portal Client");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Phone").fill("+233240002222");
  await page.getByLabel("Password", { exact: true }).fill("Client123!");
  await page.getByLabel("Confirm password", { exact: true }).fill("Client123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/dashboard/);

  await page.goto("/dashboard/consultations", { waitUntil: "domcontentloaded" });
  await page.locator("select").first().selectOption("Visa Application Support");
  await page.locator('select').nth(1).selectOption("10:00 AM");
  await page.locator('input[type="date"]').first().fill("2026-06-15");
  await page.getByRole("button", { name: "Book consultation" }).click();
  await expect(page.getByText(/consultation booked/i)).toBeVisible();
  await expect(page.locator(".card-theme-soft").filter({ hasText: "Visa Application Support" }).first()).toBeVisible();

  await page.goto("/dashboard/service-requests", { waitUntil: "domcontentloaded" });
  await page.locator("select").first().selectOption("travel-package-quote");
  await page.getByLabel("Destination").selectOption({ label: "Dubai" });
  await page.locator('input[type="date"]').first().fill("2026-08-12");
  await page.getByLabel("Budget").fill("15000");
  await page.getByLabel("Travellers").fill("2");
  await page.getByRole("button", { name: "Submit request" }).click();
  const submittedRequests = page.locator("section").filter({ has: page.getByRole("heading", { name: "Submitted requests" }) });
  await expect(submittedRequests.getByText("travel package quote").first()).toBeVisible({ timeout: 10000 });

  await page.goto("/dashboard/documents", { waitUntil: "domcontentloaded" });
  await page.locator('input[type="file"]').setInputFiles({
    name: "passport.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"),
  });
  await expect(page.locator(".card-theme-soft").filter({ hasText: "passport.pdf" }).first()).toBeVisible({ timeout: 10000 });

  const clientRoutes = [
    ["/dashboard", "Client Dashboard"],
    ["/dashboard/applications", "My Applications"],
    ["/dashboard/documents", "Documents"],
    ["/dashboard/consultations", "Consultations"],
    ["/dashboard/service-requests", "Service Requests"],
    ["/dashboard/payments", "Payments"],
    ["/dashboard/checklist", "Checklist & Next Steps"],
    ["/dashboard/messages", "Messages"],
    ["/dashboard/notifications", "Notifications"],
    ["/dashboard/profile", "Profile Settings"],
  ] as const;

  for (const [route, heading] of clientRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1").first()).toContainText(heading, { timeout: 10000 });
  }

  if (isMobile) {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await expect(page.getByRole("link", { name: "Services", exact: true })).toBeVisible();
  }
});

test("demo admin login opens the admin workspace", async ({ page, isMobile }) => {
  await page.goto("/login?workspace=admin", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill("admin@geniehub.co");
  await page.getByLabel("Password").fill("Admin123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Blog", exact: true })).toBeVisible();

  const adminRoutes = [
    ["/admin", "Admin Dashboard"],
    ["/admin/leads", "Leads & Enquiries"],
    ["/admin/applications", "Applications"],
    ["/admin/documents", "Document Review Center"],
    ["/admin/consultations", "Consultations"],
    ["/admin/service-requests", "Service Requests"],
    ["/admin/payments", "Payments"],
    ["/admin/clients", "Clients"],
    ["/admin/messages", "Messages"],
    ["/admin/notifications", "Notifications"],
    ["/admin/visa-services", "Visa Services CMS"],
    ["/admin/study-abroad", "Study Abroad Content"],
    ["/admin/destinations", "Destinations"],
    ["/admin/tour-packages", "Tour Packages"],
    ["/admin/blog", "Blog Management"],
    ["/admin/testimonials", "Testimonials"],
    ["/admin/faqs", "FAQs"],
    ["/admin/contact-submissions", "Contact Submissions"],
    ["/admin/content", "Content Blocks"],
    ["/admin/settings", "Settings"],
    ["/admin/users", "Admin Users & Roles"],
  ] as const;

  const routesToCheck = isMobile
    ? adminRoutes.filter(([route]) => ["/admin", "/admin/leads", "/admin/documents", "/admin/payments", "/admin/settings"].includes(route))
    : adminRoutes.filter(([route]) =>
        [
          "/admin",
          "/admin/leads",
          "/admin/applications",
          "/admin/documents",
          "/admin/payments",
          "/admin/messages",
          "/admin/blog",
          "/admin/testimonials",
          "/admin/content",
          "/admin/service-pricing",
          "/admin/settings",
          "/admin/users",
        ].includes(route),
      );
  for (const [route, heading] of routesToCheck) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1").first()).toContainText(heading, { timeout: 15000 });
  }
});

test("super admin can create a staff login and finance staff gets limited access", async ({ page }) => {
  const uniqueEmail = `finance-${Date.now()}@example.com`;

  await page.goto("/login?workspace=admin", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill("admin@geniehub.co");
  await page.getByLabel("Password").fill("Admin123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/settings", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Full name").last().fill("Finance Staff");
  await page.getByLabel("Email address").last().fill(uniqueEmail);
  await page.getByLabel("Phone number").last().fill("+233240009999");
  await page.getByLabel("Responsibility").selectOption("finance-staff");
  await page.getByRole("button", { name: "Create staff login" }).click();
  const tempPasswordField = page.getByLabel("Temporary password");
  await expect(tempPasswordField).toBeVisible({ timeout: 10000 });
  const tempPassword = await tempPasswordField.inputValue();
  expect(tempPassword).toBeTruthy();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/login?workspace=admin", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password").fill(tempPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/reset-password$/);

  await page.getByLabel("New password", { exact: true }).fill("Finance123!");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Finance123!");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("link", { name: "Payments", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clients", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Settings", exact: true })).toHaveCount(0);

  await page.goto("/admin/users", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main h1").first()).toContainText("Admin Dashboard", { timeout: 10000 });
});
