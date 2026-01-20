import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LogIn, UserPlus, X, Zap, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export const HeroSection = () => {
  const { t } = useLanguage();
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginSchema = z.object({
    email: z.string().email(t("auth.invalidEmail")),
    password: z.string().min(6, t("auth.passwordMin")),
  });

  const signupSchema = z.object({
    displayName: z.string().min(2, t("auth.nameMin")).max(50, t("auth.nameMax")),
    email: z.string().email(t("auth.invalidEmail")),
    password: z.string().min(6, t("auth.passwordMin")),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.passwordMismatch"),
    path: ["confirmPassword"],
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast({
          variant: "destructive",
          title: t("auth.loginError"),
          description: t("auth.loginErrorMsg"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("auth.error"),
          description: error.message,
        });
      }
    } else {
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.loginSuccessMsg"),
      });
      setActiveModal(null);
      navigate('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupData.email, signupData.password, signupData.displayName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast({
          variant: "destructive",
          title: t("auth.accountExists"),
          description: t("auth.accountExistsMsg"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("auth.signupError"),
          description: error.message,
        });
      }
    } else {
      toast({
        title: t("auth.signupSuccess"),
        description: t("auth.signupSuccessMsg"),
      });
      setActiveModal(null);
      navigate('/dashboard');
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mov" type="video/quicktime" />
          <source src="/videos/hero-background.mov" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-background/30" />
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 cortex-grid opacity-30 z-[1]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl z-[1]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl z-[1]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hero-pattern z-[1]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-foreground">{t("hero.title1")} </span>
            <span className="gradient-text">{t("hero.title2")}</span>
            <br />
            <span className="text-foreground">{t("hero.title3")}</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t("hero.description")}
          </motion.p>

          {/* Floating Auth Cards - Show only when not logged in */}
          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
            >
              {/* Login Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal('login')}
                className="group cursor-pointer glass-card border border-primary/20 rounded-2xl p-6 w-full sm:w-64 hover:border-primary/40 transition-all duration-300"
                style={{ boxShadow: '0 8px 32px hsla(217, 91%, 60%, 0.15)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                    <LogIn className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">{t("nav.login")}</h3>
                    <p className="text-sm text-muted-foreground">{t("auth.subtitle")}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  <span>{t("auth.loginButton")}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Signup Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal('signup')}
                className="group cursor-pointer rounded-2xl p-6 w-full sm:w-64 border border-transparent transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(250 60% 50%) 100%)',
                  boxShadow: '0 8px 32px hsla(217, 91%, 60%, 0.35)' 
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{t("nav.start")}</h3>
                    <p className="text-sm text-white/80">{t("auth.signup")}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-white text-sm font-medium">
                  <span>{t("auth.signupButton")}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8 py-6 glow-border"
                onClick={() => navigate('/dashboard')}
              >
                {t("nav.dashboard")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {activeModal === 'login' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
              onClick={() => setActiveModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4"
            >
              <div className="glass-card border border-primary/20 rounded-3xl overflow-hidden shadow-2xl bg-background/90 backdrop-blur-xl">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="text-center pt-8 pb-4 px-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                    style={{ boxShadow: '0 8px 32px hsla(217, 91%, 60%, 0.3)' }}
                  >
                    <Zap className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <h2 className="text-2xl font-bold gradient-text">{t("auth.login")}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{t("auth.subtitle")}</p>
                </div>

                <form onSubmit={handleLogin} className="px-8 pb-8 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-login-email" className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      {t("auth.email")}
                    </Label>
                    <Input
                      id="hero-login-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-muted/30 border-border/50 focus:border-primary"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-login-password" className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-primary" />
                      {t("auth.password")}
                    </Label>
                    <Input
                      id="hero-login-password"
                      type="password"
                      placeholder={t("auth.passwordPlaceholder")}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-muted/30 border-border/50 focus:border-primary"
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.logging")}
                      </>
                    ) : (
                      t("auth.loginButton")
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {t("auth.noAccount") || "Pas encore de compte ?"}{" "}
                    <button 
                      type="button"
                      onClick={() => setActiveModal('signup')}
                      className="text-primary hover:underline font-medium"
                    >
                      {t("auth.signup")}
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {activeModal === 'signup' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
              onClick={() => setActiveModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4"
            >
              <div className="glass-card border border-primary/20 rounded-3xl overflow-hidden shadow-2xl bg-background/90 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="text-center pt-8 pb-4 px-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                    style={{ boxShadow: '0 8px 32px hsla(217, 91%, 60%, 0.3)' }}
                  >
                    <Zap className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <h2 className="text-2xl font-bold gradient-text">{t("auth.signup")}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{t("auth.subtitle")}</p>
                </div>

                <form onSubmit={handleSignup} className="px-8 pb-8 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-signup-name" className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      {t("auth.fullName")}
                    </Label>
                    <Input
                      id="hero-signup-name"
                      type="text"
                      placeholder={t("auth.namePlaceholder")}
                      value={signupData.displayName}
                      onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="bg-muted/30 border-border/50 focus:border-primary"
                    />
                    {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-signup-email" className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      {t("auth.email")}
                    </Label>
                    <Input
                      id="hero-signup-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-muted/30 border-border/50 focus:border-primary"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-signup-password" className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-primary" />
                      {t("auth.password")}
                    </Label>
                    <Input
                      id="hero-signup-password"
                      type="password"
                      placeholder={t("auth.passwordPlaceholder")}
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-muted/30 border-border/50 focus:border-primary"
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-signup-confirm" className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-primary" />
                      {t("auth.confirmPassword")}
                    </Label>
                    <Input
                      id="hero-signup-confirm"
                      type="password"
                      placeholder={t("auth.passwordPlaceholder")}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-muted/30 border-border/50 focus:border-primary"
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.creating")}
                      </>
                    ) : (
                      t("auth.signupButton")
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {t("auth.hasAccount") || "Déjà un compte ?"}{" "}
                    <button 
                      type="button"
                      onClick={() => setActiveModal('login')}
                      className="text-primary hover:underline font-medium"
                    >
                      {t("auth.login")}
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};
