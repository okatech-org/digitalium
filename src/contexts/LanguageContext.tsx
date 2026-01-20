import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.services": "Services",
    "nav.solutions": "Solutions",
    "nav.features": "Fonctionnalités",
    "nav.contact": "Contact",
    "nav.login": "Connexion",
    "nav.start": "Commencer",
    "nav.dashboard": "Mon Espace",
    
    // Hero
    "hero.badge": "L'avenir de la gestion documentaire",
    "hero.title1": "Votre",
    "hero.title2": "Mémoire",
    "hero.title3": "Numérique",
    "hero.description": "DIGITALIUM transforme vos documents en un patrimoine intelligent, sécurisé et souverain.",
    "hero.cta.primary": "Découvrir",
    "hero.cta.secondary": "Voir la démo",
    
    // Services
    "services.title1": "Des Solutions",
    "services.title2": "Complètes",
    "services.description": "DIGITALIUM transforme la gestion documentaire du citoyen à l'institution.",
    "services.scan.title": "Scan Intelligent",
    "services.scan.description": "Numérisez vos documents avec notre technologie OCR avancée.",
    "services.ai.title": "Assistant IA",
    "services.ai.description": "Un archiviste intelligent disponible 24/7.",
    "services.security.title": "Sécurité Souveraine",
    "services.security.description": "Chiffrement de niveau bancaire, hébergement local.",
    "services.persona.title": "Multi-Persona",
    "services.persona.description": "Interface adaptée à chaque profil utilisateur.",
    "services.offline.title": "Mode Offline",
    "services.offline.description": "Travaillez sans connexion, sync automatique.",
    "services.workflow.title": "Workflows",
    "services.workflow.description": "Automatisez vos processus documentaires.",
    
    // Solutions
    "solutions.title1": "Une Solution",
    "solutions.title2": "Adaptée",
    "solutions.description": "Du particulier à l'administration publique, DIGITALIUM s'adapte à votre échelle.",
    "solutions.popular": "Plus populaire",
    "solutions.choose": "Choisir",
    "solutions.citizen.title": "Citoyens",
    "solutions.citizen.subtitle": "DIGITALIUM Personnel",
    "solutions.citizen.description": "Organisez tous vos documents administratifs simplement.",
    "solutions.citizen.price": "Gratuit",
    "solutions.citizen.f1": "CNI, passeport, diplômes",
    "solutions.citizen.f2": "Rappels d'expiration",
    "solutions.citizen.f3": "100 docs gratuits",
    "solutions.business.title": "Entreprises",
    "solutions.business.subtitle": "DIGITALIUM Business",
    "solutions.business.description": "Digitalisez votre gestion documentaire.",
    "solutions.business.price": "15 000 XAF/mois",
    "solutions.business.f1": "Multi-utilisateurs",
    "solutions.business.f2": "Workflows automatisés",
    "solutions.business.f3": "API & Intégrations",
    "solutions.institution.title": "Institutions",
    "solutions.institution.subtitle": "DIGITALIUM Souverain",
    "solutions.institution.description": "Solution souveraine pour les administrations.",
    "solutions.institution.price": "Sur devis",
    "solutions.institution.f1": "Hébergement Gabon",
    "solutions.institution.f2": "Support 24/7",
    "solutions.institution.f3": "Formation incluse",
    
    // Features
    "features.title1": "L'IA qui",
    "features.title2": "Travaille",
    "features.title3": "pour Vous",
    "features.description": "Une expérience de gestion documentaire fluide et intuitive.",
    "features.assistant.title": "Assistant IA",
    "features.assistant.description": "Parlez naturellement à votre archiviste IA pour organiser vos documents.",
    "features.scan.title": "Scan Intelligent",
    "features.scan.description": "Numérisez avec votre smartphone, l'IA extrait automatiquement le texte.",
    "features.organization.title": "Organisation Auto",
    "features.organization.description": "L'IA classe automatiquement vos documents par catégorie et date.",
    "features.alerts.title": "Alertes Intelligentes",
    "features.alerts.description": "Soyez prévenu avant l'expiration de vos documents importants.",
    "features.share.title": "Partage Sécurisé",
    "features.share.description": "Partagez des documents avec contrôle total des permissions.",
    "features.encryption.title": "Chiffrement E2E",
    "features.encryption.description": "Vos documents sensibles chiffrés, même nous ne pouvons les lire.",
    
    // Contact
    "contact.title1": "Parlons de Votre",
    "contact.title2": "Projet",
    "contact.address": "Adresse",
    "contact.phone": "Téléphone",
    "contact.email": "Email",
    "contact.form.name": "Votre nom *",
    "contact.form.email": "Votre email *",
    "contact.form.message": "Votre message *",
    "contact.form.submit": "Envoyer",
    "contact.form.sending": "Envoi...",
    "contact.form.success.title": "Message Envoyé !",
    "contact.form.success.description": "Notre équipe vous répondra sous 24h.",
    "contact.form.new": "Nouveau message",
    "contact.form.required": "Champs requis",
    "contact.form.required.description": "Veuillez remplir tous les champs.",
    "contact.form.error": "Erreur",
    "contact.form.error.description": "Veuillez réessayer.",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.solutions": "Solutions",
    "nav.features": "Features",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.start": "Get Started",
    "nav.dashboard": "Dashboard",
    
    // Hero
    "hero.badge": "The future of document management",
    "hero.title1": "Your",
    "hero.title2": "Digital",
    "hero.title3": "Memory",
    "hero.description": "DIGITALIUM transforms your documents into an intelligent, secure, and sovereign asset.",
    "hero.cta.primary": "Discover",
    "hero.cta.secondary": "Watch Demo",
    
    // Services
    "services.title1": "Complete",
    "services.title2": "Solutions",
    "services.description": "DIGITALIUM transforms document management from citizens to institutions.",
    "services.scan.title": "Smart Scan",
    "services.scan.description": "Digitize your documents with our advanced OCR technology.",
    "services.ai.title": "AI Assistant",
    "services.ai.description": "An intelligent archivist available 24/7.",
    "services.security.title": "Sovereign Security",
    "services.security.description": "Bank-level encryption, local hosting.",
    "services.persona.title": "Multi-Persona",
    "services.persona.description": "Interface adapted to each user profile.",
    "services.offline.title": "Offline Mode",
    "services.offline.description": "Work without connection, automatic sync.",
    "services.workflow.title": "Workflows",
    "services.workflow.description": "Automate your document processes.",
    
    // Solutions
    "solutions.title1": "A Solution",
    "solutions.title2": "Adapted",
    "solutions.description": "From individuals to public administration, DIGITALIUM adapts to your scale.",
    "solutions.popular": "Most popular",
    "solutions.choose": "Choose",
    "solutions.citizen.title": "Citizens",
    "solutions.citizen.subtitle": "DIGITALIUM Personal",
    "solutions.citizen.description": "Organize all your administrative documents easily.",
    "solutions.citizen.price": "Free",
    "solutions.citizen.f1": "ID, passport, diplomas",
    "solutions.citizen.f2": "Expiration reminders",
    "solutions.citizen.f3": "100 free docs",
    "solutions.business.title": "Businesses",
    "solutions.business.subtitle": "DIGITALIUM Business",
    "solutions.business.description": "Digitize your document management.",
    "solutions.business.price": "15,000 XAF/month",
    "solutions.business.f1": "Multi-users",
    "solutions.business.f2": "Automated workflows",
    "solutions.business.f3": "API & Integrations",
    "solutions.institution.title": "Institutions",
    "solutions.institution.subtitle": "DIGITALIUM Sovereign",
    "solutions.institution.description": "Sovereign solution for administrations.",
    "solutions.institution.price": "On quote",
    "solutions.institution.f1": "Gabon hosting",
    "solutions.institution.f2": "24/7 Support",
    "solutions.institution.f3": "Training included",
    
    // Features
    "features.title1": "AI that",
    "features.title2": "Works",
    "features.title3": "for You",
    "features.description": "A smooth and intuitive document management experience.",
    "features.assistant.title": "AI Assistant",
    "features.assistant.description": "Talk naturally to your AI archivist to organize your documents.",
    "features.scan.title": "Smart Scan",
    "features.scan.description": "Scan with your smartphone, AI automatically extracts text.",
    "features.organization.title": "Auto Organization",
    "features.organization.description": "AI automatically classifies your documents by category and date.",
    "features.alerts.title": "Smart Alerts",
    "features.alerts.description": "Get notified before your important documents expire.",
    "features.share.title": "Secure Sharing",
    "features.share.description": "Share documents with full permission control.",
    "features.encryption.title": "E2E Encryption",
    "features.encryption.description": "Your sensitive documents encrypted, even we cannot read them.",
    
    // Contact
    "contact.title1": "Let's Talk About Your",
    "contact.title2": "Project",
    "contact.address": "Address",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.form.name": "Your name *",
    "contact.form.email": "Your email *",
    "contact.form.message": "Your message *",
    "contact.form.submit": "Send",
    "contact.form.sending": "Sending...",
    "contact.form.success.title": "Message Sent!",
    "contact.form.success.description": "Our team will respond within 24h.",
    "contact.form.new": "New message",
    "contact.form.required": "Required fields",
    "contact.form.required.description": "Please fill in all fields.",
    "contact.form.error": "Error",
    "contact.form.error.description": "Please try again.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
