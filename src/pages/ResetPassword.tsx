import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Zap, CheckCircle, XCircle } from 'lucide-react';
import { z } from 'zod';
import { auth } from '@/config/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [oobCode, setOobCode] = useState<string | null>(null);

  const passwordSchema = z.object({
    password: z.string().min(6, t("auth.passwordMin")),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.passwordMismatch"),
    path: ["confirmPassword"],
  });

  useEffect(() => {
    // Firebase sends password reset links with ?mode=resetPassword&oobCode=xxx
    const checkResetCode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const code = urlParams.get('oobCode');

      if (mode === 'resetPassword' && code) {
        try {
          // Verify the password reset code is valid
          await verifyPasswordResetCode(auth, code);
          setOobCode(code);
          setIsValidSession(true);
        } catch (error) {
          console.error('Invalid reset code:', error);
          setIsValidSession(false);
        }
      } else {
        // No valid reset parameters found
        setIsValidSession(false);
      }
    };

    checkResetCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
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

    if (!oobCode) {
      toast({
        variant: "destructive",
        title: t("auth.error"),
        description: "Code de réinitialisation manquant.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setIsSuccess(true);
      toast({
        title: t("auth.passwordUpdated"),
        description: t("auth.passwordUpdatedMsg"),
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        variant: "destructive",
        title: t("auth.error"),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card border border-primary/20 rounded-3xl overflow-hidden shadow-2xl bg-background/80 backdrop-blur-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                style={{ boxShadow: '0 8px 32px hsla(217, 91%, 60%, 0.3)' }}
              >
                {isSuccess ? (
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                ) : isValidSession === false ? (
                  <XCircle className="w-8 h-8 text-primary-foreground" />
                ) : (
                  <Zap className="w-8 h-8 text-primary-foreground" />
                )}
              </motion.div>
              <h2 className="text-2xl font-bold gradient-text">
                {isSuccess ? t("auth.passwordUpdated") : t("auth.newPassword")}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {isSuccess
                  ? t("auth.redirecting")
                  : isValidSession === false
                    ? t("auth.invalidResetLink")
                    : t("auth.newPasswordDescription")
                }
              </p>
            </div>

            {/* Loading state */}
            {isValidSession === null && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Invalid session state */}
            {isValidSession === false && (
              <div className="text-center">
                <Button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  {t("auth.backToHome")}
                </Button>
              </div>
            )}

            {/* Success state */}
            {isSuccess && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">{t("auth.redirecting")}</span>
              </div>
            )}

            {/* Form */}
            {isValidSession === true && !isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-primary" />
                    {t("auth.newPasswordLabel")}
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/30 border-border/50 focus:border-primary"
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password" className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-primary" />
                    {t("auth.confirmPassword")}
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {t("auth.updating")}
                    </>
                  ) : (
                    t("auth.updatePassword")
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
