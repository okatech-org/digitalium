import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Solutions", href: "/solutions" },
  { name: "Fonctionnalités", href: "/features" },
  { name: "Contact", href: "/contact" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-lg group-hover:blur-xl transition-all" />
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">DIGITALIUM</span>
              <span className="text-muted-foreground">.IO</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors relative group px-3 py-2 rounded-lg ${
                    isActive
                      ? 'text-primary-foreground bg-gradient-to-r from-primary to-secondary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.name}
                  {!isActive && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Button asChild size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                <Link to="/dashboard">Mon Espace</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Link to="/auth">Connexion</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                  <Link to="/auth">Commencer</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors py-2 px-4 rounded-lg ${
                      isActive
                        ? 'text-primary-foreground bg-gradient-to-r from-primary to-secondary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                {user ? (
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary">
                    <Link to="/dashboard">Mon Espace</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth">Connexion</Link>
                    </Button>
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary">
                      <Link to="/auth">Commencer</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
