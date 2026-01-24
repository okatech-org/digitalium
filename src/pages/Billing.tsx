import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  FileText,
  Download,
  AlertCircle,
  Check,
  ArrowUpRight,
  Calendar,
  Zap,
  HardDrive,
  FileIcon,
  Sparkles,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBilling, formatXAF, formatBytes } from "@/contexts/FirebaseBillingContext";
import { toast } from "sonner";

export default function Billing() {
  const navigate = useNavigate();
  const {
    subscription,
    usage,
    invoices,
    isLoading,
    cancelSubscription,
    reactivateSubscription,
  } = useBilling();
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    const result = await cancelSubscription(false);
    if (result.success) {
      toast.success("Votre abonnement sera annulé à la fin de la période");
    } else {
      toast.error(result.error || "Erreur lors de l'annulation");
    }
    setIsCanceling(false);
  };

  const handleReactivate = async () => {
    const result = await reactivateSubscription();
    if (result.success) {
      toast.success("Votre abonnement a été réactivé");
    } else {
      toast.error(result.error || "Erreur lors de la réactivation");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      trialing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      past_due: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      canceled: "bg-red-500/10 text-red-500 border-red-500/20",
      expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    const labels: Record<string, string> = {
      active: "Actif",
      trialing: "Essai",
      past_due: "En retard",
      canceled: "Annulé",
      expired: "Expiré",
    };
    return (
      <Badge variant="outline" className={styles[status] || styles.expired}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getInvoiceStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      overdue: "bg-red-500/10 text-red-500 border-red-500/20",
      draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    const labels: Record<string, string> = {
      paid: "Payée",
      pending: "En attente",
      overdue: "En retard",
      draft: "Brouillon",
    };
    return (
      <Badge variant="outline" className={styles[status] || ""}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Facturation</h1>
            <p className="text-muted-foreground">
              Gérez votre abonnement et consultez vos factures
            </p>
          </motion.div>

          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      {subscription?.plan?.display_name || "Aucun abonnement"}
                    </CardTitle>
                    <CardDescription>
                      {subscription
                        ? `Votre abonnement actuel`
                        : "Vous n'avez pas d'abonnement actif"}
                    </CardDescription>
                  </div>
                  {subscription && getStatusBadge(subscription.status)}
                </div>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <>
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Prix</p>
                        <p className="text-2xl font-bold">
                          {formatXAF(subscription.plan?.price_xaf || 0)}
                          <span className="text-sm font-normal text-muted-foreground">
                            /mois
                          </span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Prochaine facturation</p>
                        <p className="text-lg font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(subscription.current_period_end).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Méthode de paiement</p>
                        <p className="text-lg font-medium flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {subscription.payment_method?.replace(/_/g, " ") || "Non définie"}
                        </p>
                      </div>
                    </div>

                    {subscription.cancel_at_period_end && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-500">
                              Annulation programmée
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Votre abonnement sera annulé le{" "}
                              {new Date(subscription.current_period_end).toLocaleDateString(
                                "fr-FR"
                              )}
                              . Vous pouvez le réactiver avant cette date.
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3"
                              onClick={handleReactivate}
                            >
                              Réactiver l'abonnement
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator className="my-6" />

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => navigate("/pricing")}>
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Changer de plan
                      </Button>
                      {!subscription.cancel_at_period_end && subscription.plan?.price_xaf > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Annuler l'abonnement
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Annuler votre abonnement ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Votre abonnement restera actif jusqu'au{" "}
                                {new Date(subscription.current_period_end).toLocaleDateString(
                                  "fr-FR"
                                )}
                                . Après cette date, vous passerez au plan gratuit.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Conserver mon abonnement</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCancelSubscription}
                                disabled={isCanceling}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isCanceling ? "Annulation..." : "Confirmer l'annulation"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Découvrez nos plans et choisissez celui qui vous convient
                    </p>
                    <Button onClick={() => navigate("/pricing")}>
                      Voir les tarifs
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Usage Stats */}
          {usage && subscription?.plan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Utilisation ce mois
                  </CardTitle>
                  <CardDescription>Période : {usage.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Storage */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Stockage</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatBytes(usage.storage_bytes)} /{" "}
                          {formatBytes(usage.storage_limit)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(usage.storage_percentage, 100)}
                        className="h-2"
                      />
                      {usage.storage_percentage > 80 && (
                        <p className="text-xs text-yellow-500">
                          Vous approchez de votre limite de stockage
                        </p>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Documents</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {usage.documents_count} /{" "}
                          {usage.documents_limit === -1 ? "Illimité" : usage.documents_limit}
                        </span>
                      </div>
                      <Progress
                        value={
                          usage.documents_limit === -1
                            ? 0
                            : Math.min(usage.documents_percentage, 100)
                        }
                        className="h-2"
                      />
                    </div>

                    {/* AI Requests */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Requêtes IA</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {usage.ai_requests_count} /{" "}
                          {usage.ai_requests_limit === -1 ? "Illimité" : usage.ai_requests_limit}
                        </span>
                      </div>
                      <Progress
                        value={
                          usage.ai_requests_limit === -1
                            ? 0
                            : Math.min(usage.ai_requests_percentage, 100)
                        }
                        className="h-2"
                      />
                      {usage.ai_requests_percentage > 80 && usage.ai_requests_limit !== -1 && (
                        <p className="text-xs text-yellow-500">
                          Limite bientôt atteinte
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Historique des factures
                </CardTitle>
                <CardDescription>
                  Consultez et téléchargez vos factures
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.number}</TableCell>
                          <TableCell>
                            {invoice.issued_at
                              ? new Date(invoice.issued_at).toLocaleDateString("fr-FR")
                              : "-"}
                          </TableCell>
                          <TableCell>{formatXAF(invoice.total_xaf)}</TableCell>
                          <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={!invoice.pdf_url}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune facture pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
