import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TawkWidget from "@/components/TawkWidget";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoute";
import GenieHubLoader from "./components/GenieHubLoader";
import RouteChangeLoader from "./components/RouteChangeLoader";
import { trackPageView } from "./lib/analytics";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const StudyAbroad = lazy(() => import("./pages/StudyAbroad"));
const VisaAssistance = lazy(() => import("./pages/VisaAssistance"));
const TourPackages = lazy(() => import("./pages/TourPackages"));
const TourPackageDetailPage = lazy(() => import("./pages/TourPackageDetailPage"));
const FlightsHotels = lazy(() => import("./pages/FlightsHotels"));
const BookConsultation = lazy(() => import("./pages/BookConsultation"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const PasswordRecoveryPage = lazy(() => import("./pages/PasswordRecoveryPage"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookieNoticePage = lazy(() => import("./pages/CookieNoticePage"));
const AdminOutlet = lazy(() => import("./pages/admin/AdminOutlet"));
const AdminOverviewPage = lazy(() => import("./pages/admin/AdminOverviewPage"));
const AdminLeadsPage = lazy(() => import("./pages/admin/AdminLeadsPage"));
const AdminLeadDetailPage = lazy(() => import("./pages/admin/AdminLeadDetailPage"));
const AdminApplicationsPage = lazy(() => import("./pages/admin/AdminApplicationsPage"));
const AdminApplicationDetailPage = lazy(() => import("./pages/admin/AdminApplicationDetailPage"));
const AdminDocumentsPage = lazy(() => import("./pages/admin/AdminDocumentsPage"));
const AdminConsultationsPage = lazy(() => import("./pages/admin/AdminConsultationsPage"));
const AdminServiceRequestsPage = lazy(() => import("./pages/admin/AdminServiceRequestsPage"));
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"));
const AdminClientsPage = lazy(() => import("./pages/admin/AdminClientsPage"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));
const AdminNotificationsPage = lazy(() => import("./pages/admin/AdminNotificationsPage"));
const AdminVisaServicesPage = lazy(() => import("./pages/admin/AdminVisaServicesPage"));
const AdminStudyAbroadPage = lazy(() => import("./pages/admin/AdminStudyAbroadPage"));
const AdminDestinationsPage = lazy(() => import("./pages/admin/AdminDestinationsPage"));
const AdminTourPackagesPage = lazy(() => import("./pages/admin/AdminTourPackagesPage"));
const AdminBlogPage = lazy(() => import("./pages/admin/AdminBlogPage"));
const AdminTestimonialsPage = lazy(() => import("./pages/admin/AdminTestimonialsPage"));
const AdminFaqsPage = lazy(() => import("./pages/admin/AdminFaqsPage"));
const AdminContactSubmissionsPage = lazy(() => import("./pages/admin/AdminContactSubmissionsPage"));
const AdminContentPage = lazy(() => import("./pages/admin/AdminContentPage"));
const AdminServicePricingPage = lazy(() => import("./pages/admin/AdminServicePricingPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const DashboardOutlet = lazy(() => import("./pages/dashboard/DashboardOutlet"));
const OverviewPage = lazy(() => import("./pages/dashboard/OverviewPage"));
const ApplicationsPage = lazy(() => import("./pages/dashboard/ApplicationsPage"));
const ApplicationDetailPage = lazy(() => import("./pages/dashboard/ApplicationDetailPage"));
const DocumentsPage = lazy(() => import("./pages/dashboard/DocumentsPage"));
const ConsultationsPage = lazy(() => import("./pages/dashboard/ConsultationsPage"));
const ServiceRequestsPage = lazy(() => import("./pages/dashboard/ServiceRequestsPage"));
const PaymentsPage = lazy(() => import("./pages/dashboard/PaymentsPage"));
const ChecklistPage = lazy(() => import("./pages/dashboard/ChecklistPage"));
const MessagesPage = lazy(() => import("./pages/dashboard/MessagesPage"));
const NotificationsPage = lazy(() => import("./pages/dashboard/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/dashboard/ProfilePage"));

const queryClient = new QueryClient();

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  return null;
}

function AppShell() {
  return (
    <Suspense
      fallback={<GenieHubLoader />}
    >
      <AnalyticsTracker />
      <RouteChangeLoader />
      <TawkWidget />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/study-abroad" element={<StudyAbroad />} />
        <Route path="/visa-assistance" element={<VisaAssistance />} />
        <Route path="/tours" element={<TourPackages />} />
        <Route path="/tours/:packageId" element={<TourPackageDetailPage />} />
        <Route path="/flights-hotels" element={<FlightsHotels />} />
        <Route path="/book-consultation" element={<BookConsultation />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/recover-password" element={<PasswordRecoveryPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookie-notice" element={<CookieNoticePage />} />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute>
              <ResetPasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardOutlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/:applicationId" element={<ApplicationDetailPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="consultations" element={<ConsultationsPage />} />
          <Route path="service-requests" element={<ServiceRequestsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <ClientPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminOutlet />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="leads/:leadId" element={<AdminLeadDetailPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="applications/:applicationId" element={<AdminApplicationDetailPage />} />
          <Route path="documents" element={<AdminDocumentsPage />} />
          <Route path="consultations" element={<AdminConsultationsPage />} />
          <Route path="service-requests" element={<AdminServiceRequestsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="clients" element={<AdminClientsPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="visa-services" element={<AdminVisaServicesPage />} />
          <Route path="study-abroad" element={<AdminStudyAbroadPage />} />
          <Route path="destinations" element={<AdminDestinationsPage />} />
          <Route path="tour-packages" element={<AdminTourPackagesPage />} />
          <Route path="blog" element={<AdminBlogPage />} />
          <Route path="testimonials" element={<AdminTestimonialsPage />} />
          <Route path="faqs" element={<AdminFaqsPage />} />
          <Route path="contact-submissions" element={<AdminContactSubmissionsPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="service-pricing" element={<AdminServicePricingPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
