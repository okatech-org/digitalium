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
// SysAdmin Pages (infrastructure-specific, not shared)
import Infrastructure from "./pages/sysadmin/Infrastructure";
import Monitoring from "./pages/sysadmin/Monitoring";
import Databases from "./pages/sysadmin/Databases";
import Logs from "./pages/sysadmin/Logs";
import SecuritySysAdmin from "./pages/sysadmin/SecuritySysAdmin";
import SysAdminDashboard from "./pages/sysadmin/SysAdminDashboard";
import DatabaseReplicas from "./pages/sysadmin/DatabaseReplicas";
import DatabaseBackups from "./pages/sysadmin/DatabaseBackups";
import SysAdminSpaceLayout from "@/components/layout/SysAdminSpaceLayout";

// Shared Admin Components (used by both SysAdmin and SubAdmin)
import {
  Iam,
  OrganizationConfig,
  DesignThemeSettings,
  WorkflowTemplates,
  ClientsManagement,
  LeadsProspectsManagement,
  SubscriptionsOverview,
} from "./pages/shared";
// Institution Pages
import CivilRegistry from "./pages/institution/CivilRegistry";
import ServicesConfig from "./pages/institution/ServicesConfig";
import Reports from "./pages/institution/Reports";
import PublicInfrastructure from "./pages/institution/PublicInfrastructure";
import Alerts from "./pages/institution/Alerts";
import Partners from "./pages/institution/Partners";

// Pro Space Pages
import ProSpaceLayout from "@/components/layout/ProSpaceLayout";
import AdmSpaceLayout from "@/components/layout/AdmSpaceLayout";
import OrgSpaceLayout from "@/components/layout/OrgSpaceLayout";
import ProDashboard from "./pages/pro/ProDashboard";
import AdmDashboard from "./pages/adm/AdmDashboard";
import OrgDashboard from "./pages/org/OrgDashboard";
import IDocumentLayout from "./pages/pro/idocument/IDocumentLayout";
import CollaborativeEditPage from "./pages/pro/idocument/edit/CollaborativeEditPage";
import DocumentCategoryPage from "./pages/pro/idocument/DocumentCategoryPage";
import IArchiveLayout from "./pages/pro/iarchive/IArchiveLayout";
import FiscalArchive from "./pages/pro/iarchive/FiscalArchive";
import ArchiveCategoryPage from "./pages/pro/iarchive/ArchiveCategoryPage";
import ArchiveUploadPage from "./pages/pro/iarchive/UploadPage";
import ISignatureLayout from "./pages/pro/isignature/ISignatureLayout";
import ToSign from "./pages/pro/isignature/ToSign";
import PendingSignatures from "./pages/pro/isignature/PendingSignatures";
import SignedDocuments from "./pages/pro/isignature/SignedDocuments";
import Workflows from "./pages/pro/isignature/Workflows";

// Pro Admin Pages
import {
  TeamManagementPage,
  AnalyticsPage as ProAnalyticsPage,
  BillingPage as ProBillingPage,
  ApiAccessPage,
  SecurityPage as ProSecurityPage,
  PublicProfilePage,
  PublicPageEditor,
} from "./pages/pro/admin";
import ArchiveSettings from "./pages/pro/admin/ArchiveSettings";
import PublicPageEditorLayout from "./components/public-page/PublicPageEditorLayout";
import {
  EditorOverviewPage,
  EditorThemePage,
  EditorHeroPage,
  EditorAboutPage,
  EditorServicesPage,
  EditorTeamPage,
  EditorContactPage,
  EditorGalleryPage,
  EditorDocumentsPage,
  EditorPagesPage,
  EditorMediaPage,
} from "./pages/pro/public-editor";
import DesignThemePage from "./pages/pro/admin/DesignThemePage";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { DesignThemeProvider } from "./contexts/DesignThemeContext";

// SubAdmin Space Pages
import SubAdminSpaceLayout from "@/components/layout/SubAdminSpaceLayout";
import SubAdminDashboard from "./pages/subadmin/SubAdminDashboard";

// Admin Space Pages
import AdminSpaceLayout from "@/components/layout/AdminSpaceLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LeadsManagement from "./pages/admin/LeadsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import SubscriptionsManagement from "./pages/admin/SubscriptionsManagement";

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
          <Route path="/dashboard" element={<Navigate to="/pro" replace />} />
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
            <Route index element={<DocumentCategoryPage />} />
            <Route path="shared" element={<DocumentCategoryPage />} />
            <Route path="team" element={<DocumentCategoryPage />} />
            <Route path="templates" element={<DocumentCategoryPage />} />
            <Route path="trash" element={<DocumentCategoryPage />} />
          </Route>

          {/* Collaborative Document Editor */}
          <Route path="/pro/idocument/edit/:id" element={<CollaborativeEditPage />} />

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
            <Route path="pending" element={<PendingSignatures />} />
            <Route path="signed" element={<SignedDocuments />} />
            <Route path="workflows" element={<Workflows />} />
          </Route>

          <Route path="/pro/team" element={<TeamManagementPage />} />
          <Route path="/pro/analytics" element={<ProAnalyticsPage />} />
          <Route path="/pro/billing" element={<ProBillingPage />} />
          <Route path="/pro/api" element={<ApiAccessPage />} />
          <Route path="/pro/security" element={<ProSecurityPage />} />
          <Route path="/pro/public" element={<PublicPageEditor />} />

          {/* Public Page Editor V2 - Multi-page architecture */}
          <Route path="/pro/public-editor" element={<PublicPageEditorLayout />}>
            <Route index element={<EditorOverviewPage />} />
            <Route path="theme" element={<EditorThemePage />} />
            <Route path="pages" element={<EditorPagesPage />} />
            <Route path="media" element={<EditorMediaPage />} />
            <Route path="hero" element={<EditorHeroPage />} />
            <Route path="about" element={<EditorAboutPage />} />
            <Route path="services" element={<EditorServicesPage />} />
            <Route path="team" element={<EditorTeamPage />} />
            <Route path="gallery" element={<EditorGalleryPage />} />
            <Route path="documents" element={<EditorDocumentsPage />} />
            <Route path="contact" element={<EditorContactPage />} />
          </Route>
          <Route path="/pro/archive-settings" element={<ArchiveSettings />} />
          <Route path="/pro/design-theme" element={<DesignThemePage />} />
        </Route>

        {/* Administration Space - Ministères, Justice, Collectivités */}
        <Route element={<ProtectedRoute><AdmSpaceLayout /></ProtectedRoute>}>
          <Route path="/adm" element={<AdmDashboard />} />

          {/* iDocument Module - Courrier Officiel */}
          <Route path="/adm/idocument" element={<IDocumentLayout />}>
            <Route index element={<DocumentCategoryPage />} />
            <Route path="shared" element={<DocumentCategoryPage />} />
            <Route path="team" element={<DocumentCategoryPage />} />
            <Route path="templates" element={<DocumentCategoryPage />} />
            <Route path="trash" element={<DocumentCategoryPage />} />
          </Route>
          <Route path="/adm/idocument/edit/:id" element={<CollaborativeEditPage />} />

          {/* iArchive Module - Archives Légales */}
          <Route path="/adm/iarchive" element={<IArchiveLayout />}>
            <Route index element={<ArchiveCategoryPage />} />
            <Route path="fiscal" element={<ArchiveCategoryPage />} />
            <Route path="social" element={<ArchiveCategoryPage />} />
            <Route path="legal" element={<ArchiveCategoryPage />} />
            <Route path="clients" element={<ArchiveCategoryPage />} />
            <Route path="vault" element={<ArchiveCategoryPage />} />
            <Route path="certificates" element={<ArchiveCategoryPage />} />
          </Route>
          <Route path="/adm/iarchive/upload" element={<ArchiveUploadPage />} />

          {/* iSignature Module - Parapheur */}
          <Route path="/adm/isignature" element={<ISignatureLayout />}>
            <Route index element={<ToSign />} />
            <Route path="pending" element={<PendingSignatures />} />
            <Route path="signed" element={<SignedDocuments />} />
            <Route path="workflows" element={<Workflows />} />
          </Route>

          <Route path="/adm/team" element={<TeamManagementPage />} />
          <Route path="/adm/analytics" element={<ProAnalyticsPage />} />
          <Route path="/adm/billing" element={<ProBillingPage />} />
          <Route path="/adm/security" element={<ProSecurityPage />} />
          <Route path="/adm/public" element={<PublicPageEditor />} />
        </Route>

        {/* Organisme Space - Éducation, Culture, Santé Publique */}
        <Route element={<ProtectedRoute><OrgSpaceLayout /></ProtectedRoute>}>
          <Route path="/org" element={<OrgDashboard />} />

          {/* iDocument Module - Documents */}
          <Route path="/org/idocument" element={<IDocumentLayout />}>
            <Route index element={<DocumentCategoryPage />} />
            <Route path="shared" element={<DocumentCategoryPage />} />
            <Route path="team" element={<DocumentCategoryPage />} />
            <Route path="templates" element={<DocumentCategoryPage />} />
            <Route path="trash" element={<DocumentCategoryPage />} />
          </Route>
          <Route path="/org/idocument/edit/:id" element={<CollaborativeEditPage />} />

          {/* iArchive Module - Archives */}
          <Route path="/org/iarchive" element={<IArchiveLayout />}>
            <Route index element={<ArchiveCategoryPage />} />
            <Route path="fiscal" element={<ArchiveCategoryPage />} />
            <Route path="social" element={<ArchiveCategoryPage />} />
            <Route path="legal" element={<ArchiveCategoryPage />} />
            <Route path="clients" element={<ArchiveCategoryPage />} />
            <Route path="vault" element={<ArchiveCategoryPage />} />
            <Route path="certificates" element={<ArchiveCategoryPage />} />
          </Route>
          <Route path="/org/iarchive/upload" element={<ArchiveUploadPage />} />

          {/* iSignature Module - Signatures */}
          <Route path="/org/isignature" element={<ISignatureLayout />}>
            <Route index element={<ToSign />} />
            <Route path="pending" element={<PendingSignatures />} />
            <Route path="signed" element={<SignedDocuments />} />
            <Route path="workflows" element={<Workflows />} />
          </Route>

          <Route path="/org/team" element={<TeamManagementPage />} />
          <Route path="/org/analytics" element={<ProAnalyticsPage />} />
          <Route path="/org/billing" element={<ProBillingPage />} />
          <Route path="/org/security" element={<ProSecurityPage />} />
          <Route path="/org/public" element={<PublicPageEditor />} />
        </Route>

        {/* Admin Space Routes - Administration institutionnelle */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminSpaceLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<LeadsManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="users/organizations" element={<UsersManagement />} />
          <Route path="users/roles" element={<UsersManagement />} />
          <Route path="subscriptions" element={<SubscriptionsManagement />} />
          <Route path="subscriptions/invoices" element={<SubscriptionsManagement />} />
          <Route path="subscriptions/transactions" element={<SubscriptionsManagement />} />
          <Route path="organizations" element={<UsersManagement />} />
          <Route path="analytics" element={<ProAnalyticsPage />} />
          <Route path="billing" element={<AdminBilling />} />
        </Route>

        {/* SysAdmin Routes - Super-administrateur système */}
        <Route path="/sysadmin" element={<ProtectedRoute requireAdmin><SysAdminSpaceLayout /></ProtectedRoute>}>
          <Route index element={<SysAdminDashboard />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="databases" element={<Databases />} />
          <Route path="databases/replicas" element={<DatabaseReplicas />} />
          <Route path="databases/backups" element={<DatabaseBackups />} />
          <Route path="logs" element={<Logs />} />
          <Route path="security" element={<SecuritySysAdmin />} />
          <Route path="iam" element={<Iam />} />
          <Route path="organization" element={<OrganizationConfig />} />
          <Route path="design-theme" element={<DesignThemeSettings />} />
          {/* Business Management Routes */}
          <Route path="users" element={<ClientsManagement />} />
          <Route path="subscriptions" element={<SubscriptionsOverview />} />
          <Route path="leads" element={<LeadsProspectsManagement />} />
          <Route path="workflow-templates" element={<WorkflowTemplates />} />
        </Route>

        {/* SubAdmin Space Routes - Sous-administrateur (Ornella DOUMBA role) */}
        <Route path="/subadmin" element={<ProtectedRoute requireAdmin><SubAdminSpaceLayout /></ProtectedRoute>}>
          <Route index element={<SubAdminDashboard />} />

          {/* Workflow Modules - nested routes within SubAdmin layout */}
          <Route path="idocument" element={<IDocumentLayout />}>
            <Route index element={<DocumentCategoryPage />} />
            <Route path="shared" element={<DocumentCategoryPage />} />
            <Route path="team" element={<DocumentCategoryPage />} />
            <Route path="templates" element={<DocumentCategoryPage />} />
            <Route path="trash" element={<DocumentCategoryPage />} />
          </Route>
          <Route path="idocument/edit/:id" element={<CollaborativeEditPage />} />

          <Route path="iarchive" element={<IArchiveLayout />}>
            <Route index element={<ArchiveCategoryPage />} />
            <Route path="fiscal" element={<ArchiveCategoryPage />} />
            <Route path="social" element={<ArchiveCategoryPage />} />
            <Route path="legal" element={<ArchiveCategoryPage />} />
            <Route path="clients" element={<ArchiveCategoryPage />} />
            <Route path="vault" element={<ArchiveCategoryPage />} />
            <Route path="certificates" element={<ArchiveCategoryPage />} />
          </Route>
          <Route path="iarchive/upload" element={<ArchiveUploadPage />} />

          <Route path="isignature" element={<ISignatureLayout />}>
            <Route index element={<ToSign />} />
            <Route path="pending" element={<PendingSignatures />} />
            <Route path="signed" element={<SignedDocuments />} />
            <Route path="workflows" element={<Workflows />} />
          </Route>

          {/* Configuration Plateforme */}
          <Route path="iam" element={<Iam />} />
          <Route path="organization" element={<OrganizationConfig />} />
          <Route path="design-theme" element={<DesignThemeSettings />} />
          <Route path="workflow-templates" element={<WorkflowTemplates />} />
          {/* Gestion Métier */}
          <Route path="clients" element={<ClientsManagement />} />
          <Route path="leads" element={<LeadsProspectsManagement />} />
          <Route path="subscriptions" element={<SubscriptionsOverview />} />
        </Route>

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
      <DesignThemeProvider>
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
      </DesignThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
