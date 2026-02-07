import { motion } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  MessageCircle,
  Loader2,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { functions } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: MapPin,
    title: "Adresse",
    details: ["Libreville, Gabon", "Quartier Glass, Rue de la Baie"],
  },
  {
    icon: Phone,
    title: "Téléphone",
    details: ["+241 077 00 00 00", "+241 011 00 00 00"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["contact@digitalium.io", "support@digitalium.io"],
  },
  {
    icon: Clock,
    title: "Horaires",
    details: ["Lun - Ven: 8h - 18h", "Sam: 9h - 13h"],
  },
];

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitLeadFn = httpsCallable(functions, 'submitLead');
      await submitLeadFn(formData);

      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast.success("Message envoyé avec succès !");
      
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-4">
            Contact
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Parlons de Votre{" "}
            <span className="gradient-text">Transformation Digitale</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions 
            et vous accompagner dans votre projet.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Envoyez-nous un message</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Nom complet
                    </label>
                    <Input
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-muted/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-muted/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Sujet
                  </label>
                  <Input
                    placeholder="Sujet de votre message"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-muted/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Décrivez votre projet ou votre question..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-muted/50 border-border/50 focus:border-primary resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting || isSubmitted}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="mr-2 w-5 h-5" />
                      Message envoyé !
                    </>
                  ) : (
                    <>
                      Envoyer le message
                      <Send className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{info.title}</h4>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="glass-card rounded-3xl overflow-hidden h-64 relative">
              <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                  <p className="text-lg font-medium">Libreville, Gabon</p>
                  <p className="text-sm text-muted-foreground">
                    Siège de DIGITALIUM
                  </p>
                </div>
              </div>
              {/* Grid overlay for map-like effect */}
              <div className="absolute inset-0 cortex-grid opacity-30" />
            </div>

            {/* Quick CTA */}
            <div className="glass-card p-6 rounded-2xl border-primary/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Besoin d'aide immédiate ?</h4>
                  <p className="text-sm text-muted-foreground">
                    Appelez-nous directement
                  </p>
                </div>
                <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                  Appeler
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
