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
import { AnimatePresence, motion } from "framer-motion";
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
// Enterprise Pages
import Team from "./pages/enterprise/Team";
import Analytics from "./pages/enterprise/Analytics";
import ApiAccess from "./pages/enterprise/ApiAccess";
import Security from "./pages/enterprise/Security";
import PublicProfile from "./pages/enterprise/PublicProfile";
import BillingPro from "./pages/enterprise/BillingPro";
import EnterpriseArchive from "./pages/enterprise/EnterpriseArchive";
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

import MainLayout from "@/components/layout/MainLayout";

const queryClient = new QueryClient();

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 1,
    x: '0%',
    rotateY: 0,
    zIndex: 1,
    filter: 'blur(0px)',
    boxShadow: '0 0 0 rgba(0,0,0,0)',
  },
  enter: {
    opacity: 1,
    scale: 1,
    x: '0%',
    rotateY: 0,
    zIndex: 1,
    filter: 'blur(0px)',
    boxShadow: '0 0 0 rgba(0,0,0,0)',
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1] as const,
      opacity: { duration: 0.7, delay: 0.25 }
    }
  },
  exit: {
    opacity: 0,
    rotateY: -55,
    x: '-20%',
    scale: 0.88,
    zIndex: 10,
    filter: 'blur(4px)',
    boxShadow: '-30px 0 80px rgba(0,0,0,0.5), -10px 0 40px rgba(0,0,0,0.3)',
    transition: {
      duration: 1.4,
      ease: [0.32, 0, 0.15, 1] as const,
      opacity: { duration: 1, delay: 0.35 },
      filter: { duration: 1.2, ease: "easeIn" },
      boxShadow: { duration: 1.2, ease: "easeOut" }
    }
  },
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div className="relative" style={{ perspective: '1200px', perspectiveOrigin: '30% 50%', overflow: 'hidden', minHeight: '100vh' }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full min-h-screen bg-background relative"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            backfaceVisibility: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Navigate to="/solutions" replace />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/idn/callback" element={<IdnCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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

              {/* Enterprise Routes */}
              <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/api" element={<ProtectedRoute><ApiAccess /></ProtectedRoute>} />
              <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
              <Route path="/public-profile" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
              <Route path="/billing-pro" element={<ProtectedRoute><BillingPro /></ProtectedRoute>} />
              <Route path="/enterprise-archive" element={<ProtectedRoute><EnterpriseArchive /></ProtectedRoute>} />

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
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
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
