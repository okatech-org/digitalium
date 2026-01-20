import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, Mail, Lock, User, X } from 'lucide-react';
import { z } from 'zod';
import { Header } from '@/components/layout/Header';

export default function Auth() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => navigate('/'), 300);
  };

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
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative">
      <Header />
      
      {/* Background with blur when modal is open */}
      <div className="absolute inset-0 cortex-grid" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      {/* Floating Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="glass-card border border-primary/20 rounded-3xl overflow-hidden shadow-2xl">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Header */}
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
                  <h2 className="text-2xl font-bold gradient-text">{t("auth.title")}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{t("auth.subtitle")}</p>
                </div>

                {/* Tab Switcher */}
                <div className="px-8 pb-4">
                  <div className="flex bg-muted/30 rounded-xl p-1">
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'login'
                          ? 'bg-background shadow-md text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t("auth.login")}
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'signup'
                          ? 'bg-background shadow-md text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t("auth.signup")}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'login' ? (
                      <motion.form
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleLogin}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-primary" />
                            {t("auth.email")}
                          </Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder={t("auth.emailPlaceholder")}
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-muted/30 border-border/50 focus:border-primary"
                          />
                          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="flex items-center gap-2 text-sm">
                            <Lock className="w-4 h-4 text-primary" />
                            {t("auth.password")}
                          </Label>
                          <Input
                            id="login-password"
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
                      </motion.form>
                    ) : (
                      <motion.form
                        key="signup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleSignup}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-primary" />
                            {t("auth.fullName")}
                          </Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder={t("auth.namePlaceholder")}
                            value={signupData.displayName}
                            onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))}
                            className="bg-muted/30 border-border/50 focus:border-primary"
                          />
                          {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-primary" />
                            {t("auth.email")}
                          </Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder={t("auth.emailPlaceholder")}
                            value={signupData.email}
                            onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-muted/30 border-border/50 focus:border-primary"
                          />
                          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="flex items-center gap-2 text-sm">
                            <Lock className="w-4 h-4 text-primary" />
                            {t("auth.password")}
                          </Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder={t("auth.passwordPlaceholder")}
                            value={signupData.password}
                            onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                            className="bg-muted/30 border-border/50 focus:border-primary"
                          />
                          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm" className="flex items-center gap-2 text-sm">
                            <Lock className="w-4 h-4 text-primary" />
                            {t("auth.confirmPassword")}
                          </Label>
                          <Input
                            id="signup-confirm"
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
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
