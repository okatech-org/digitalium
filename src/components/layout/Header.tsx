import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Brain, Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthModal } from "@/components/auth/AuthModal";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  // Track scroll for dynamic glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 200;
      const progress = Math.min(scrollY / maxScroll, 1);
      
      setScrolled(scrollY > 20);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.services"), href: "/services" },
    { name: t("nav.solutions"), href: "/solutions" },
    { name: t("nav.features"), href: "/features" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  const openLoginModal = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
    setIsOpen(false);
  };

  const openSignupModal = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
    setIsOpen(false);
  };

  // Dynamic glassmorphism styles based on scroll
  const headerStyle = {
    background: `linear-gradient(
      135deg,
      hsla(217, 91%, 60%, ${0.05 + scrollProgress * 0.08}) 0%,
      hsla(250, 60%, 50%, ${0.02 + scrollProgress * 0.04}) 50%,
      hsla(217, 91%, 60%, ${0.04 + scrollProgress * 0.06}) 100%
    )`,
    backdropFilter: `blur(${12 + scrollProgress * 16}px) saturate(${120 + scrollProgress * 60}%)`,
    WebkitBackdropFilter: `blur(${12 + scrollProgress * 16}px) saturate(${120 + scrollProgress * 60}%)`,
    borderBottom: scrolled 
      ? `1px solid hsla(217, 91%, 60%, ${0.1 + scrollProgress * 0.15})` 
      : '1px solid hsla(217, 91%, 60%, 0.08)',
    boxShadow: scrolled 
      ? `0 ${4 + scrollProgress * 8}px ${20 + scrollProgress * 20}px hsla(0, 0%, 0%, ${0.1 + scrollProgress * 0.15})` 
      : 'none',
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={headerStyle}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-primary/30 blur-lg group-hover:blur-xl transition-all" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">DIGITAL</span>
                <span className="gradient-text-accent">IUM</span>
                <span className="text-muted-foreground">.IO</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-secondary"
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 0.9,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                    {/* Glow effect for active */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-secondary blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    {/* Text */}
                    <span className={`relative z-10 transition-colors duration-300 ${
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}>
                      {link.name}
                    </span>
                    {/* Hover underline for inactive */}
                    {!isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-3/4 hover:w-3/4" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
                aria-label="Toggle language"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{language}</span>
              </button>

              {/* Auth Buttons */}
              {user ? (
                <Button asChild size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity ml-2">
                  <Link to="/dashboard">{t("nav.dashboard")}</Link>
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={openLoginModal}
                  >
                    {t("nav.login")}
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                    onClick={openSignupModal}
                  >
                    {t("nav.start")}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Language Toggle Mobile */}
              <button
                onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                aria-label="Toggle language"
              >
                <span className="uppercase">{language}</span>
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="relative text-lg font-medium py-3 px-4 rounded-lg overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-secondary"
                        initial={false}
                        animate={{
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 0.95,
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-secondary blur-md"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                      <span className={`relative z-10 transition-colors duration-300 ${
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
                <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                  {user ? (
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary">
                      <Link to="/dashboard">{t("nav.dashboard")}</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" onClick={openLoginModal}>
                        {t("nav.login")}
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-primary to-secondary" onClick={openSignupModal}>
                        {t("nav.start")}
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultTab={authModalTab}
      />
    </>
  );
};
