import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qu'est-ce que DIGITALIUM et comment fonctionne-t-il ?",
    answer:
      "DIGITALIUM est la première plateforme d'archivage intelligent multi-échelle qui combine IA générative et rigueur institutionnelle. Notre assistant archiviste analyse automatiquement vos documents, les classe, extrait les métadonnées et vous aide à les retrouver instantanément grâce à une recherche sémantique avancée.",
  },
  {
    question: "Mes documents sont-ils sécurisés sur DIGITALIUM ?",
    answer:
      "Absolument. Nous utilisons un chiffrement AES-256 pour les données au repos et TLS 1.3 pour les données en transit. Pour les institutions, nous proposons une option de chiffrement de bout en bout avec hébergement souverain au Gabon. Toutes les actions sont tracées dans un journal d'audit immutable.",
  },
  {
    question: "Quels types de documents puis-je scanner et archiver ?",
    answer:
      "DIGITALIUM accepte tous types de documents : CNI, passeports, diplômes, factures, contrats, actes notariés, relevés bancaires, certificats médicaux, et bien plus. Notre IA détecte automatiquement le type de document et l'organise dans la bonne catégorie.",
  },
  {
    question: "Puis-je utiliser DIGITALIUM hors ligne ?",
    answer:
      "Oui ! DIGITALIUM fonctionne en mode offline-first. Vous pouvez scanner, organiser et consulter vos documents même sans connexion internet. Tout se synchronise automatiquement dès que vous retrouvez une connexion.",
  },
  {
    question: "Comment fonctionne la tarification ?",
    answer:
      "Nous proposons une offre gratuite avec 1 Go de stockage et 100 documents. L'offre Personal à 2 000 XAF/mois inclut 10 Go et documents illimités. L'offre Family à 5 000 XAF/mois permet jusqu'à 5 utilisateurs. Pour les entreprises et institutions, contactez-nous pour un devis personnalisé.",
  },
  {
    question: "L'IA peut-elle vraiment comprendre mes documents ?",
    answer:
      "Oui, notre IA utilise des modèles de dernière génération (Google Gemini, Claude) pour analyser visuellement et textuellement vos documents. Elle peut extraire des données structurées (dates, montants, noms), détecter les documents expirés, et même vous suggérer des actions comme la création de dossiers thématiques.",
  },
  {
    question: "Comment DIGITALIUM aide les entreprises ?",
    answer:
      "Pour les entreprises, DIGITALIUM offre des workflows automatisés (validation de factures, onboarding employés), la gestion multi-utilisateurs avec RBAC, des tableaux de bord analytiques, l'intégration API, et des rapports de conformité. Le ROI moyen constaté est de 253% avec un temps de retour sur investissement de 15 jours.",
  },
  {
    question: "DIGITALIUM est-il disponible pour les administrations publiques ?",
    answer:
      "Oui, nous proposons une offre Institutional spécialement conçue pour les mairies, ministères et administrations. Elle inclut le déploiement on-premise, l'hébergement souverain au Gabon, la conformité RGPD et loi gabonaise, ainsi qu'un support dédié 24/7.",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/10" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

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
            <HelpCircle className="w-4 h-4 inline mr-2" />
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Questions{" "}
            <span className="gradient-text">Fréquentes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur DIGITALIUM et comment il peut 
            transformer votre gestion documentaire.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-card p-6 md:p-8 rounded-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-border/50"
                >
                  <AccordionTrigger className="text-left hover:no-underline hover:text-primary transition-colors py-5">
                    <span className="font-medium pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Vous avez d'autres questions ?
          </p>
          <a 
            href="#contact"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Contactez notre équipe
            <span className="text-lg">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
