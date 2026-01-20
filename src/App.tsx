import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Solutions from "./pages/Solutions";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Documents from "./pages/Documents";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { 
    opacity: 0,
    scale: 1,
    zIndex: 1,
  },
  enter: { 
    opacity: 1, 
    scale: 1,
    zIndex: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.1, 0.25, 1] as const,
      opacity: { duration: 0.6, delay: 0.2 }
    } 
  },
  exit: { 
    opacity: 0,
    rotateY: -45,
    x: '-15%',
    scale: 0.92,
    zIndex: 10,
    transition: { 
      duration: 1.2, 
      ease: [0.4, 0, 0.2, 1] as const,
      opacity: { duration: 0.8, delay: 0.3 }
    } 
  },
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <div className="relative" style={{ perspective: '1500px', overflow: 'hidden', minHeight: '100vh' }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full min-h-screen bg-background"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            backfaceVisibility: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            boxShadow: '10px 0 30px rgba(0,0,0,0.3)',
          }}
        >
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
