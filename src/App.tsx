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
            {/* Paper texture overlay */}
            <div 
              className="pointer-events-none absolute inset-0 z-50 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
              }}
            />
            {/* Worn edges effect */}
            <div 
              className="pointer-events-none absolute inset-0 z-40"
              style={{
                boxShadow: 'inset 0 0 60px rgba(0,0,0,0.15), inset 0 0 120px rgba(0,0,0,0.08)',
                background: `
                  radial-gradient(ellipse at top left, rgba(139,90,43,0.04) 0%, transparent 50%),
                  radial-gradient(ellipse at top right, rgba(139,90,43,0.03) 0%, transparent 40%),
                  radial-gradient(ellipse at bottom left, rgba(139,90,43,0.05) 0%, transparent 45%),
                  radial-gradient(ellipse at bottom right, rgba(139,90,43,0.04) 0%, transparent 50%)
                `,
              }}
            />
            {/* Paper curl effect on edges */}
            <div 
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: `
                  linear-gradient(to right, rgba(0,0,0,0.03) 0%, transparent 1.5%, transparent 98.5%, rgba(0,0,0,0.02) 100%),
                  linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, transparent 1%, transparent 99%, rgba(0,0,0,0.03) 100%)
                `,
              }}
            />
            {/* Left edge curl highlight */}
            <div 
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 z-35"
              style={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)',
                boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.04)',
              }}
            />
            {/* Right edge curl shadow */}
            <div 
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 z-35"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 50%, transparent 100%)',
              }}
            />
            {/* Top edge subtle curl */}
            <div 
              className="pointer-events-none absolute top-0 left-0 right-0 h-2 z-35"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
              }}
            />
            {/* Bottom edge curl shadow */}
            <div 
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-3 z-35"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 40%, transparent 100%)',
              }}
            />
            {/* Center book fold effect */}
            <div 
              className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 z-40"
              style={{
                background: `
                  linear-gradient(to right, 
                    transparent 0%, 
                    rgba(0,0,0,0.03) 20%, 
                    rgba(0,0,0,0.06) 45%, 
                    rgba(0,0,0,0.08) 50%, 
                    rgba(0,0,0,0.06) 55%, 
                    rgba(0,0,0,0.03) 80%, 
                    transparent 100%
                  )
                `,
              }}
            />
            {/* Center fold highlight (left side) */}
            <div 
              className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-[calc(50%+3px)] w-[6px] z-41"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.06) 100%)',
              }}
            />
            {/* Center fold highlight (right side) */}
            <div 
              className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-[calc(50%-3px)] w-[6px] z-41"
              style={{
                background: 'linear-gradient(to left, transparent 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.06) 100%)',
              }}
            />
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
