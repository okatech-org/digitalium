import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/config/firebase";

type CallbackStatus = "loading" | "success" | "error";

interface IdnUserInfo {
    id: string;
    email: string;
    displayName: string;
    nip?: string;
}

/**
 * IDN.ga OAuth Callback Page
 * 
 * Handles the OAuth callback from identite.ga:
 * 1. Receives authorization code from IDN.ga
 * 2. Exchanges code for user info via Cloud Function
 * 3. Creates/links Firebase account
 * 4. Redirects to dashboard
 */
export default function IdnCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [status, setStatus] = useState<CallbackStatus>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [userInfo, setUserInfo] = useState<IdnUserInfo | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");
            const error = searchParams.get("error");

            // Handle OAuth errors
            if (error) {
                setStatus("error");
                setErrorMessage(searchParams.get("error_description") || "Authentification refusée");
                return;
            }

            // Validate authorization code
            if (!code) {
                setStatus("error");
                setErrorMessage("Code d'autorisation manquant");
                return;
            }

            try {
                // Call Cloud Function to exchange code and create/link account
                const handleIdnCallback = httpsCallable<
                    { code: string; state?: string },
                    { success: boolean; customToken?: string; user?: IdnUserInfo; error?: string }
                >(functions, "handleIdnOAuthCallback");

                const result = await handleIdnCallback({ code, state: state || undefined });

                if (!result.data.success || !result.data.customToken) {
                    throw new Error(result.data.error || "Échec de l'authentification");
                }

                // Sign in with custom token from Cloud Function
                await signInWithCustomToken(auth, result.data.customToken);

                setUserInfo(result.data.user || null);
                setStatus("success");

                toast({
                    title: "Connexion réussie",
                    description: `Bienvenue ${result.data.user?.displayName || ""}`,
                });

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1500);

            } catch (err) {
                console.error("IDN OAuth callback error:", err);
                setStatus("error");
                setErrorMessage(err instanceof Error ? err.message : "Erreur inattendue");
            }
        };

        handleCallback();
    }, [searchParams, navigate, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="w-full max-w-md glass-card border-primary/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl font-bold">ID</span>
                        </div>
                        <CardTitle className="text-xl">
                            {status === "loading" && "Connexion en cours..."}
                            {status === "success" && "Connexion réussie !"}
                            {status === "error" && "Erreur de connexion"}
                        </CardTitle>
                        <CardDescription>
                            Authentification via IDN.ga
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="text-center space-y-4">
                        {status === "loading" && (
                            <div className="py-8">
                                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                                <p className="mt-4 text-muted-foreground">
                                    Vérification de votre identité...
                                </p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.1 }}
                                >
                                    <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                                </motion.div>
                                <p className="mt-4 text-foreground font-medium">
                                    Bienvenue, {userInfo?.displayName || "Utilisateur"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Redirection vers votre espace...
                                </p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="py-8 space-y-4">
                                <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
                                <p className="text-destructive">{errorMessage}</p>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/auth")}
                                    className="mt-4"
                                >
                                    Retour à la connexion
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
