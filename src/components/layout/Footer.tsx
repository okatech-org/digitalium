import { Brain } from "lucide-react";

const footerLinks = {
  product: {
    title: "Produit",
    links: [
      { name: "Fonctionnalités", href: "#features" },
      { name: "Solutions", href: "#solutions" },
      { name: "Tarifs", href: "#solutions" },
      { name: "Sécurité", href: "#" },
    ],
  },
  company: {
    title: "Entreprise",
    links: [
      { name: "À propos", href: "#" },
      { name: "Carrières", href: "#" },
      { name: "Partenaires", href: "#" },
      { name: "Blog", href: "#" },
    ],
  },
  resources: {
    title: "Ressources",
    links: [
      { name: "Documentation", href: "#" },
      { name: "API", href: "#" },
      { name: "Support", href: "#" },
      { name: "Statut", href: "#" },
    ],
  },
  legal: {
    title: "Légal",
    links: [
      { name: "Confidentialité", href: "#" },
      { name: "CGU", href: "#" },
      { name: "Cookies", href: "#" },
      { name: "Licences", href: "#" },
    ],
  },
};

export const Footer = () => {
  return (
    <footer className="relative pt-20 pb-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-muted/5 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <a href="#" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">DIGITALIUM</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              L'archiviste intelligent qui transforme votre gestion documentaire. 
              Made in Gabon 🇬🇦
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} DIGITALIUM. Tous droits réservés.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Propulsé par</span>
              <span className="gradient-text font-medium">NTSAGUI Digital</span>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {["LinkedIn", "Twitter", "Facebook", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-gradient-to-t from-primary/5 to-transparent blur-3xl -z-10" />
      </div>
    </footer>
  );
};
