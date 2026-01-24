import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FirebaseBillingProvider } from "@/contexts/FirebaseBillingContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Solutions from "./pages/Solutions";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Documents from "./pages/Documents";
import IDocumentPage from "./pages/idocument/IDocumentPage";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
// Pricing merged into Solutions
import Billing from "./pages/Billing";
import AdminBilling from "./pages/AdminBilling";
import NotFound from "./pages/NotFound";
import IdnCallback from "./pages/auth/IdnCallback";
// Public Pages
import CompanyPublicPage from "./pages/public/CompanyPublicPage";
// SysAdmin Pages
import Infrastructure from "./pages/sysadmin/Infrastructure";
import Monitoring from "./pages/sysadmin/Monitoring";
import Databases from "./pages/sysadmin/Databases";
import Logs from "./pages/sysadmin/Logs";
import SecuritySysAdmin from "./pages/sysadmin/SecuritySysAdmin";
import Iam from "./pages/sysadmin/Iam";
// Institution Pages
import CivilRegistry from "./pages/institution/CivilRegistry";
import ServicesConfig from "./pages/institution/ServicesConfig";
import Reports from "./pages/institution/Reports";
import PublicInfrastructure from "./pages/institution/PublicInfrastructure";
import Alerts from "./pages/institution/Alerts";
import Partners from "./pages/institution/Partners";

// Pro Space Pages
import ProSpaceLayout from "@/components/layout/ProSpaceLayout";
import ProDashboard from "./pages/pro/ProDashboard";
import IDocumentLayout from "./pages/pro/idocument/IDocumentLayout";
import MyDocuments from "./pages/pro/idocument/MyDocuments";
import IArchiveLayout from "./pages/pro/iarchive/IArchiveLayout";
import FiscalArchive from "./pages/pro/iarchive/FiscalArchive";
import ArchiveCategoryPage from "./pages/pro/iarchive/ArchiveCategoryPage";
import ArchiveUploadPage from "./pages/pro/iarchive/UploadPage";
import ISignatureLayout from "./pages/pro/isignature/ISignatureLayout";
import ToSign from "./pages/pro/isignature/ToSign";

// Pro Admin Pages
import {
  TeamManagementPage,
  AnalyticsPage as ProAnalyticsPage,
  BillingPage as ProBillingPage,
  ApiAccessPage,
  SecurityPage as ProSecurityPage,
  PublicProfilePage,
} from "./pages/pro/admin";

import MainLayout from "@/components/layout/MainLayout";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<Navigate to="/solutions" replace />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/idn/callback" element={<IdnCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public Company Profiles */}
        <Route path="/p/:slug" element={<CompanyPublicPage />} />

        {/* Protected App Routes with Persistent Sidebar */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
          <Route path="/admin/billing" element={<ProtectedRoute requireAdmin><AdminBilling /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/idocument" element={<ProtectedRoute><IDocumentPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/pricing" element={<Navigate to="/solutions" replace />} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        </Route>

        {/* Pro Space with dedicated layout */}
        <Route element={<ProtectedRoute><ProSpaceLayout /></ProtectedRoute>}>
          <Route path="/pro" element={<ProDashboard />} />

          {/* iDocument Module */}
          <Route path="/pro/idocument" element={<IDocumentLayout />}>
            <Route index element={<MyDocuments />} />
            <Route path="shared" element={<MyDocuments />} />
            <Route path="team" element={<MyDocuments />} />
            <Route path="templates" element={<MyDocuments />} />
            <Route path="trash" element={<MyDocuments />} />
          </Route>

          {/* iArchive Module */}
          <Route path="/pro/iarchive" element={<IArchiveLayout />}>
            <Route index element={<ArchiveCategoryPage />} />
            <Route path="fiscal" element={<ArchiveCategoryPage />} />
            <Route path="social" element={<ArchiveCategoryPage />} />
            <Route path="legal" element={<ArchiveCategoryPage />} />
            <Route path="clients" element={<ArchiveCategoryPage />} />
            <Route path="vault" element={<ArchiveCategoryPage />} />
            <Route path="certificates" element={<ArchiveCategoryPage />} />
          </Route>
          <Route path="/pro/iarchive/upload" element={<ArchiveUploadPage />} />

          {/* iSignature Module */}
          <Route path="/pro/isignature" element={<ISignatureLayout />}>
            <Route index element={<ToSign />} />
            <Route path="pending" element={<ToSign />} />
            <Route path="signed" element={<ToSign />} />
            <Route path="workflows" element={<ToSign />} />
          </Route>

          {/* Pro Admin Routes */}
          <Route path="/pro/team" element={<TeamManagementPage />} />
          <Route path="/pro/analytics" element={<ProAnalyticsPage />} />
          <Route path="/pro/billing" element={<ProBillingPage />} />
          <Route path="/pro/api" element={<ApiAccessPage />} />
          <Route path="/pro/security" element={<ProSecurityPage />} />
          <Route path="/pro/public" element={<PublicProfilePage />} />
        </Route>

        {/* SysAdmin Routes */}
        <Route path="/sysadmin/infrastructure" element={<ProtectedRoute><Infrastructure /></ProtectedRoute>} />
        <Route path="/sysadmin/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
        <Route path="/sysadmin/databases" element={<ProtectedRoute><Databases /></ProtectedRoute>} />
        <Route path="/sysadmin/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/sysadmin/security" element={<ProtectedRoute><SecuritySysAdmin /></ProtectedRoute>} />
        <Route path="/sysadmin/iam" element={<ProtectedRoute><Iam /></ProtectedRoute>} />

        {/* Institution Routes */}
        <Route path="/civil-registry" element={<ProtectedRoute><CivilRegistry /></ProtectedRoute>} />
        <Route path="/services-config" element={<ProtectedRoute><ServicesConfig /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/infrastructure" element={<ProtectedRoute><PublicInfrastructure /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/partners" element={<ProtectedRoute><Partners /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <FirebaseAuthProvider>
            <FirebaseBillingProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </FirebaseBillingProvider>
          </FirebaseAuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
