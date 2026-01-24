import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, Mail, Lock, User, X, ArrowLeft, Building2, Landmark, UserCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import { z } from 'zod';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

type ModalView = 'login' | 'signup' | 'forgot-password';

export const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<ModalView>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demo accounts configuration
  const demoAccounts = [
    {
      id: 'citizen',
      label: 'Citoyen',
      description: 'Espace personnel',
      email: 'demo-citoyen@digitalium.ga',
      password: 'Demo2026!',
      icon: UserCircle,
      gradient: 'from-cyan-500 to-blue-500',
      redirect: '/dashboard',
    },
    {
      id: 'enterprise',
      label: 'Entreprise',
      description: 'Espace professionnel',
      email: 'demo-entreprise@digitalium.ga',
      password: 'Demo2026!',
      icon: Building2,
      gradient: 'from-emerald-500 to-green-500',
      redirect: '/pro',
    },
    {
      id: 'admin',
      label: 'Administration',
      description: 'Espace institutionnel',
      email: 'demo-admin@digitalium.ga',
      password: 'Demo2026!',
      icon: Landmark,
      gradient: 'from-violet-500 to-purple-500',
      redirect: '/dashboard',
    },
    {
      id: 'sysadmin',
      label: 'Admin Système',
      description: 'Super-administrateur',
      email: 'demo-sysadmin@digitalium.ga',
      password: 'Demo2026!',
      icon: ShieldCheck,
      gradient: 'from-slate-700 to-gray-800',
      redirect: '/sysadmin/infrastructure',
    },
  ];

  // Handle OAuth login with IDN.ga
  const handleIdnOAuth = () => {
    const idnUrl = import.meta.env.VITE_IDN_OAUTH_URL || 'https://identite.ga';
    const clientId = import.meta.env.VITE_IDN_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_IDN_REDIRECT_URI || `${window.location.origin}/auth/idn/callback`;

    const authUrl = new URL(`${idnUrl}/oauth/authorize`);
    authUrl.searchParams.set('client_id', clientId || 'digitalium');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('state', JSON.stringify({ action: activeView }));

    window.location.href = authUrl.toString();
  };

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    // Special case: Citoyen redirects to IDN.ga (identite.ga)
    if (account.id === 'citizen') {
      const idnUrl = import.meta.env.VITE_IDN_OAUTH_URL || 'https://identite.ga';
      window.location.href = `${idnUrl}/profil`;
      return;
    }

    setDemoLoading(account.id);

    // 1. Try to sign in with existing demo account
    const { error: signInError } = await signIn(account.email, account.password);

    if (!signInError) {
      setDemoLoading(null);
      toast({
        title: `Bienvenue, ${account.label}`,
        description: "Connexion réussie en mode démonstration",
      });
      onClose();
      navigate(account.redirect);
      return;
    }

    // 2. If sign in failed, try to create the account
    // (This handles 'user-not-found' or other issues by ensuring account exists)
    const { error: signUpError } = await signUp(account.email, account.password, account.label);

    setDemoLoading(null);

    if (!signUpError) {
      toast({
        title: `Bienvenue, ${account.label}`,
        description: "Compte démo créé avec succès",
      });
      onClose();
      navigate(account.redirect);
    } else {
      // If both failed, it's likely a password mismatch on an existing account
      // or a network error.
      console.error('Demo login failed:', { signInError, signUpError });

      let errorMessage = signInError.message;
      if (signUpError.message.includes('email-already-in-use')) {
        errorMessage = "Le compte démo existe déjà mais le mot de passe est incorrect. Veuillez contacter l'administrateur.";
      }

      toast({
        variant: "destructive",
        title: "Erreur de connexion démo",
        description: errorMessage,
      });
    }
  };

  // Reset view when modal opens with different tab
  useEffect(() => {
    if (isOpen) {
      setActiveView(defaultTab);
      setErrors({});
    }
  }, [isOpen, defaultTab]);

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

  const resetSchema = z.object({
    email: z.string().email(t("auth.invalidEmail")),
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
      onClose();
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
      onClose();
      navigate('/dashboard');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetSchema.safeParse({ email: resetEmail });
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
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: t("auth.resetError"),
        description: error.message,
      });
    } else {
      toast({
        title: t("auth.resetSuccess"),
        description: t("auth.resetSuccessMsg"),
      });
      setResetEmail('');
      setActiveView('login');
    }
  };

  const handleViewChange = (view: ModalView) => {
    setActiveView(view);
    setErrors({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="glass-card border border-primary/20 rounded-3xl overflow-hidden shadow-2xl bg-background/80 backdrop-blur-xl w-full max-w-md"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
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
                <h2 className="text-2xl font-bold gradient-text">
                  {activeView === 'forgot-password' ? t("auth.resetPassword") : t("auth.title")}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {activeView === 'forgot-password' ? t("auth.resetDescription") : t("auth.subtitle")}
                </p>
              </div>

              {/* Tab Switcher - Only show for login/signup */}
              {activeView !== 'forgot-password' && (
                <div className="px-8 pb-4">
                  <div className="flex bg-muted/30 rounded-xl p-1">
                    <button
                      onClick={() => handleViewChange('login')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'login'
                        ? 'bg-background shadow-md text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {t("auth.login")}
                    </button>
                    <button
                      onClick={() => handleViewChange('signup')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'signup'
                        ? 'bg-background shadow-md text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {t("auth.signup")}
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="px-8 pb-8">
                <AnimatePresence mode="wait">
                  {activeView === 'login' && (
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
                        <Label htmlFor="modal-login-email" className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-primary" />
                          {t("auth.email")}
                        </Label>
                        <Input
                          id="modal-login-email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-muted/30 border-border/50 focus:border-primary"
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modal-login-password" className="flex items-center gap-2 text-sm">
                          <Lock className="w-4 h-4 text-primary" />
                          {t("auth.password")}
                        </Label>
                        <Input
                          id="modal-login-password"
                          type="password"
                          placeholder={t("auth.passwordPlaceholder")}
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="bg-muted/30 border-border/50 focus:border-primary"
                        />
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                      </div>

                      {/* Forgot Password Link */}
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleViewChange('forgot-password')}
                          className="text-sm text-primary hover:underline"
                        >
                          {t("auth.forgotPassword")}
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                        disabled={isLoading || demoLoading !== null}
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

                      {/* OAuth IDN.ga Option */}
                      <div className="relative">
                        <Separator className="my-4" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                          ou
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleIdnOAuth}
                        className="w-full border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all group"
                      >
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-bold">ID</span>
                        </div>
                        Continuer avec IDN.ga
                        <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100" />
                      </Button>

                      {/* Demo Accounts Section */}
                      <div className="pt-2">
                        <div className="relative">
                          <Separator className="my-4" />
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                            Accès Démo
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {demoAccounts.map((account) => (
                            <motion.button
                              key={account.id}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDemoLogin(account)}
                              disabled={demoLoading !== null}
                              className={`relative p-3 rounded-xl border border-border/50 hover:border-primary/50 transition-all group overflow-hidden ${demoLoading === account.id ? 'opacity-80' : ''
                                }`}
                            >
                              {/* Background gradient on hover */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${account.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                              {/* Icon */}
                              <div className={`mx-auto w-10 h-10 rounded-lg bg-gradient-to-br ${account.gradient} flex items-center justify-center mb-2 shadow-lg`}>
                                {demoLoading === account.id ? (
                                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                  <account.icon className="w-5 h-5 text-white" />
                                )}
                              </div>

                              {/* Label */}
                              <p className="text-xs font-medium text-foreground">{account.label}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{account.description}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.form>
                  )}

                  {activeView === 'signup' && (
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
                        <Label htmlFor="modal-signup-name" className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-primary" />
                          {t("auth.fullName")}
                        </Label>
                        <Input
                          id="modal-signup-name"
                          type="text"
                          placeholder={t("auth.namePlaceholder")}
                          value={signupData.displayName}
                          onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))}
                          className="bg-muted/30 border-border/50 focus:border-primary"
                        />
                        {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modal-signup-email" className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-primary" />
                          {t("auth.email")}
                        </Label>
                        <Input
                          id="modal-signup-email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={signupData.email}
                          onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-muted/30 border-border/50 focus:border-primary"
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modal-signup-password" className="flex items-center gap-2 text-sm">
                          <Lock className="w-4 h-4 text-primary" />
                          {t("auth.password")}
                        </Label>
                        <Input
                          id="modal-signup-password"
                          type="password"
                          placeholder={t("auth.passwordPlaceholder")}
                          value={signupData.password}
                          onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                          className="bg-muted/30 border-border/50 focus:border-primary"
                        />
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modal-signup-confirm" className="flex items-center gap-2 text-sm">
                          <Lock className="w-4 h-4 text-primary" />
                          {t("auth.confirmPassword")}
                        </Label>
                        <Input
                          id="modal-signup-confirm"
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

                      {/* OAuth IDN.ga Option */}
                      <div className="relative">
                        <Separator className="my-4" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                          ou
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleIdnOAuth}
                        className="w-full border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all group"
                      >
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-bold">ID</span>
                        </div>
                        S'inscrire avec IDN.ga
                        <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100" />
                      </Button>
                    </motion.form>
                  )}

                  {activeView === 'forgot-password' && (
                    <motion.form
                      key="forgot-password"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handlePasswordReset}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="modal-reset-email" className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-primary" />
                          {t("auth.email")}
                        </Label>
                        <Input
                          id="modal-reset-email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="bg-muted/30 border-border/50 focus:border-primary"
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("auth.sending")}
                          </>
                        ) : (
                          t("auth.sendResetLink")
                        )}
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleViewChange('login')}
                        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t("auth.backToLogin")}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
