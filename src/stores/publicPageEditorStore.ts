/**
 * Public Page Editor Store V2
 * Multi-page architecture with MediaLibrary and per-page themes
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

// Section Types
export type SectionType =
    | 'hero'
    | 'about'
    | 'services'
    | 'team'
    | 'stats'
    | 'gallery'
    | 'testimonials'
    | 'contact'
    | 'documents'
    | 'partners'
    | 'news'
    | 'cta';

// Template IDs - Extended for V2 with Gabonese organization types
export type TemplateId =
    // === ENTREPRISES ===
    // Commerce & Distribution
    | 'commerce-fournisseur'      // Fournisseur bureautique, équipements
    | 'commerce-distribution'     // Grossiste, distributeur
    | 'commerce-import-export'    // Import-export
    // Santé
    | 'sante-pharmacie'          // Pharmacie, droguerie
    | 'sante-clinique'           // Clinique privée, cabinet médical
    | 'sante-laboratoire'        // Laboratoire d'analyses
    // BTP & Industrie
    | 'btp-construction'         // Entreprise de BTP
    | 'btp-architecture'         // Cabinet d'architecture
    | 'industrie-production'     // Usine, manufacture
    | 'industrie-petrole'        // Pétrole, gaz, mines
    // Services Professionnels
    | 'pro-notaire'              // Étude notariale
    | 'pro-avocat'               // Cabinet d'avocats
    | 'pro-comptable'            // Expert-comptable, audit
    | 'pro-conseil'              // Cabinet de conseil
    | 'pro-assurance'            // Assurance, courtage
    // Tech & Télécom
    | 'tech-startup'             // Startup technologique
    | 'tech-telecom'             // Télécom, FAI
    | 'tech-it-services'         // ESN, services IT
    // Autres Entreprises
    | 'entreprise-pme'           // PME générique
    | 'entreprise-corporate'     // Grande entreprise

    // === ADMINISTRATIONS ===
    // Gouvernement Central
    | 'admin-ministere'           // Ministère
    | 'admin-presidence'          // Présidence, Primature
    | 'admin-direction'           // Direction générale
    | 'admin-agence'              // Agence d'état
    // Justice
    | 'justice-tribunal'          // Tribunal, cour
    | 'justice-parquet'           // Parquet, procureur
    | 'justice-prison'            // Administration pénitentiaire
    // Collectivités
    | 'local-mairie'              // Mairie, commune
    | 'local-conseil-departemental' // Conseil départemental
    | 'local-province'            // Gouvernorat, province
    // Sécurité & Défense
    | 'securite-police'           // Police, gendarmerie
    | 'securite-armee'            // Forces armées
    | 'securite-douane'           // Douanes
    // Éducation & Culture
    | 'education-universite'      // Université, grande école
    | 'education-lycee'           // Lycée, collège
    | 'culture-musee'             // Musée, patrimoine
    // Santé Publique
    | 'sante-hopital'             // Hôpital public
    | 'sante-centre'              // Centre de santé

    // Generics
    | 'custom';

// Organization Type
export type OrganizationType = 'entreprise' | 'administration';

// Organization Category
export type OrganizationCategory =
    // Entreprises
    | 'commerce'
    | 'sante-privee'
    | 'btp-industrie'
    | 'services-pro'
    | 'tech-telecom'
    | 'autres-entreprises'
    // Administrations
    | 'gouvernement-central'
    | 'justice'
    | 'collectivites'
    | 'securite-defense'
    | 'education-culture'
    | 'sante-publique';

// Category Definition
export interface CategoryDefinition {
    id: OrganizationCategory;
    label: string;
    description: string;
    icon: string; // lucide icon name
    organizationType: OrganizationType;
    templates: TemplateId[];
}

// Template with category info
export interface TemplateInfo {
    id: TemplateId;
    name: string;
    shortName: string;
    description: string;
    category: OrganizationCategory;
    organizationType: OrganizationType;
    tags: string[];
    colorScheme: string; // CSS gradient
}

// Categories Registry
export const ORGANIZATION_CATEGORIES: CategoryDefinition[] = [
    // === ENTREPRISES ===
    {
        id: 'commerce',
        label: 'Commerce & Distribution',
        description: 'Fournisseurs, distributeurs, import-export',
        icon: 'Store',
        organizationType: 'entreprise',
        templates: ['commerce-fournisseur', 'commerce-distribution', 'commerce-import-export'],
    },
    {
        id: 'sante-privee',
        label: 'Santé Privée',
        description: 'Pharmacies, cliniques, laboratoires',
        icon: 'Heart',
        organizationType: 'entreprise',
        templates: ['sante-pharmacie', 'sante-clinique', 'sante-laboratoire'],
    },
    {
        id: 'btp-industrie',
        label: 'BTP & Industrie',
        description: 'Construction, architecture, production',
        icon: 'Hammer',
        organizationType: 'entreprise',
        templates: ['btp-construction', 'btp-architecture', 'industrie-production', 'industrie-petrole'],
    },
    {
        id: 'services-pro',
        label: 'Services Professionnels',
        description: 'Notaires, avocats, comptables, conseil',
        icon: 'Briefcase',
        organizationType: 'entreprise',
        templates: ['pro-notaire', 'pro-avocat', 'pro-comptable', 'pro-conseil', 'pro-assurance'],
    },
    {
        id: 'tech-telecom',
        label: 'Tech & Télécom',
        description: 'Startups, télécommunications, IT',
        icon: 'Laptop',
        organizationType: 'entreprise',
        templates: ['tech-startup', 'tech-telecom', 'tech-it-services'],
    },
    {
        id: 'autres-entreprises',
        label: 'Autres Entreprises',
        description: 'PME, grandes entreprises',
        icon: 'Building',
        organizationType: 'entreprise',
        templates: ['entreprise-pme', 'entreprise-corporate'],
    },

    // === ADMINISTRATIONS ===
    {
        id: 'gouvernement-central',
        label: 'Gouvernement Central',
        description: 'Ministères, directions, agences',
        icon: 'Landmark',
        organizationType: 'administration',
        templates: ['admin-ministere', 'admin-presidence', 'admin-direction', 'admin-agence'],
    },
    {
        id: 'justice',
        label: 'Justice',
        description: 'Tribunaux, parquets, pénitentiaire',
        icon: 'Scale',
        organizationType: 'administration',
        templates: ['justice-tribunal', 'justice-parquet', 'justice-prison'],
    },
    {
        id: 'collectivites',
        label: 'Collectivités Locales',
        description: 'Mairies, conseils, provinces',
        icon: 'Home',
        organizationType: 'administration',
        templates: ['local-mairie', 'local-conseil-departemental', 'local-province'],
    },
    {
        id: 'securite-defense',
        label: 'Sécurité & Défense',
        description: 'Police, armée, douanes',
        icon: 'Shield',
        organizationType: 'administration',
        templates: ['securite-police', 'securite-armee', 'securite-douane'],
    },
    {
        id: 'education-culture',
        label: 'Éducation & Culture',
        description: 'Universités, lycées, musées',
        icon: 'GraduationCap',
        organizationType: 'administration',
        templates: ['education-universite', 'education-lycee', 'culture-musee'],
    },
    {
        id: 'sante-publique',
        label: 'Santé Publique',
        description: 'Hôpitaux, centres de santé',
        icon: 'Hospital',
        organizationType: 'administration',
        templates: ['sante-hopital', 'sante-centre'],
    },
];

// Templates Info Registry
export const TEMPLATES_INFO: TemplateInfo[] = [
    // === COMMERCE ===
    {
        id: 'commerce-fournisseur',
        name: 'Fournisseur / Équipementier',
        shortName: 'Fournisseur',
        description: 'Bureautique, équipements, fournitures',
        category: 'commerce',
        organizationType: 'entreprise',
        tags: ['Catalogue', 'Devis'],
        colorScheme: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    },
    {
        id: 'commerce-distribution',
        name: 'Grossiste / Distributeur',
        shortName: 'Distributeur',
        description: 'Distribution, grossiste, réseau',
        category: 'commerce',
        organizationType: 'entreprise',
        tags: ['Réseau', 'Logistique'],
        colorScheme: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    },
    {
        id: 'commerce-import-export',
        name: 'Import-Export',
        shortName: 'Import-Export',
        description: 'Commerce international, transit',
        category: 'commerce',
        organizationType: 'entreprise',
        tags: ['International', 'Douane'],
        colorScheme: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    },
    // === SANTÉ PRIVÉE ===
    {
        id: 'sante-pharmacie',
        name: 'Pharmacie / Droguerie',
        shortName: 'Pharmacie',
        description: 'Pharmacie officine, droguerie',
        category: 'sante-privee',
        organizationType: 'entreprise',
        tags: ['Santé', 'Officine'],
        colorScheme: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
    },
    {
        id: 'sante-clinique',
        name: 'Clinique Privée',
        shortName: 'Clinique',
        description: 'Clinique, cabinet médical, spécialiste',
        category: 'sante-privee',
        organizationType: 'entreprise',
        tags: ['Médical', 'Soins'],
        colorScheme: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    },
    {
        id: 'sante-laboratoire',
        name: 'Laboratoire d\'Analyses',
        shortName: 'Laboratoire',
        description: 'Analyses médicales, biologie',
        category: 'sante-privee',
        organizationType: 'entreprise',
        tags: ['Analyses', 'Biologie'],
        colorScheme: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    },
    // === BTP & INDUSTRIE ===
    {
        id: 'btp-construction',
        name: 'Entreprise BTP',
        shortName: 'BTP',
        description: 'Construction, travaux publics, génie civil',
        category: 'btp-industrie',
        organizationType: 'entreprise',
        tags: ['Construction', 'Chantier'],
        colorScheme: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    },
    {
        id: 'btp-architecture',
        name: 'Cabinet d\'Architecture',
        shortName: 'Architecture',
        description: 'Architecte, bureau d\'études',
        category: 'btp-industrie',
        organizationType: 'entreprise',
        tags: ['Design', 'Plans'],
        colorScheme: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    },
    {
        id: 'industrie-production',
        name: 'Industrie / Manufacture',
        shortName: 'Industrie',
        description: 'Usine, production, manufacture',
        category: 'btp-industrie',
        organizationType: 'entreprise',
        tags: ['Production', 'Usine'],
        colorScheme: 'linear-gradient(135deg, #78716c 0%, #a8a29e 100%)',
    },
    {
        id: 'industrie-petrole',
        name: 'Pétrole, Gaz & Mines',
        shortName: 'Pétrole/Mines',
        description: 'Secteur pétrolier, gazier, minier',
        category: 'btp-industrie',
        organizationType: 'entreprise',
        tags: ['Énergie', 'Extraction'],
        colorScheme: 'linear-gradient(135deg, #44403c 0%, #78716c 100%)',
    },
    // === SERVICES PROFESSIONNELS ===
    {
        id: 'pro-notaire',
        name: 'Étude Notariale',
        shortName: 'Notaire',
        description: 'Notaire, actes authentiques',
        category: 'services-pro',
        organizationType: 'entreprise',
        tags: ['Juridique', 'Actes'],
        colorScheme: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    },
    {
        id: 'pro-avocat',
        name: 'Cabinet d\'Avocats',
        shortName: 'Avocats',
        description: 'Avocats, conseil juridique, contentieux',
        category: 'services-pro',
        organizationType: 'entreprise',
        tags: ['Juridique', 'Plaidoirie'],
        colorScheme: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    },
    {
        id: 'pro-comptable',
        name: 'Expert-Comptable',
        shortName: 'Comptable',
        description: 'Comptable, audit, expertise',
        category: 'services-pro',
        organizationType: 'entreprise',
        tags: ['Comptabilité', 'Audit'],
        colorScheme: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    },
    {
        id: 'pro-conseil',
        name: 'Cabinet de Conseil',
        shortName: 'Conseil',
        description: 'Conseil en stratégie, management',
        category: 'services-pro',
        organizationType: 'entreprise',
        tags: ['Stratégie', 'Conseil'],
        colorScheme: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    },
    {
        id: 'pro-assurance',
        name: 'Assurance / Courtage',
        shortName: 'Assurance',
        description: 'Assurance, courtage, prévoyance',
        category: 'services-pro',
        organizationType: 'entreprise',
        tags: ['Assurance', 'Risques'],
        colorScheme: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    },
    // === TECH & TÉLÉCOM ===
    {
        id: 'tech-startup',
        name: 'Startup Tech',
        shortName: 'Startup',
        description: 'Startup, innovation, SaaS',
        category: 'tech-telecom',
        organizationType: 'entreprise',
        tags: ['Innovation', 'Digital'],
        colorScheme: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    },
    {
        id: 'tech-telecom',
        name: 'Télécom / FAI',
        shortName: 'Télécom',
        description: 'Télécommunications, fournisseur internet',
        category: 'tech-telecom',
        organizationType: 'entreprise',
        tags: ['Télécom', 'Internet'],
        colorScheme: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    },
    {
        id: 'tech-it-services',
        name: 'Services IT / ESN',
        shortName: 'IT Services',
        description: 'ESN, intégration, développement',
        category: 'tech-telecom',
        organizationType: 'entreprise',
        tags: ['IT', 'Services'],
        colorScheme: 'linear-gradient(135deg, #0891b2 0%, #6366f1 100%)',
    },
    // === AUTRES ENTREPRISES ===
    {
        id: 'entreprise-pme',
        name: 'PME Classique',
        shortName: 'PME',
        description: 'Petite et moyenne entreprise',
        category: 'autres-entreprises',
        organizationType: 'entreprise',
        tags: ['Générique', 'Flexible'],
        colorScheme: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    },
    {
        id: 'entreprise-corporate',
        name: 'Grande Entreprise',
        shortName: 'Corporate',
        description: 'Grande entreprise, groupe, holding',
        category: 'autres-entreprises',
        organizationType: 'entreprise',
        tags: ['Corporate', 'Groupe'],
        colorScheme: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
    },
    // === GOUVERNEMENT CENTRAL ===
    {
        id: 'admin-ministere',
        name: 'Ministère',
        shortName: 'Ministère',
        description: 'Ministère, département ministériel',
        category: 'gouvernement-central',
        organizationType: 'administration',
        tags: ['Officiel', 'National'],
        colorScheme: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
    },
    {
        id: 'admin-presidence',
        name: 'Présidence / Primature',
        shortName: 'Présidence',
        description: 'Présidence, primature, cabinet',
        category: 'gouvernement-central',
        organizationType: 'administration',
        tags: ['Exécutif', 'National'],
        colorScheme: 'linear-gradient(135deg, #115e59 0%, #0d9488 100%)',
    },
    {
        id: 'admin-direction',
        name: 'Direction Générale',
        shortName: 'Direction',
        description: 'Direction générale, services centraux',
        category: 'gouvernement-central',
        organizationType: 'administration',
        tags: ['Direction', 'Central'],
        colorScheme: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    },
    {
        id: 'admin-agence',
        name: 'Agence d\'État',
        shortName: 'Agence',
        description: 'Agence, établissement public',
        category: 'gouvernement-central',
        organizationType: 'administration',
        tags: ['Agence', 'Établissement'],
        colorScheme: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    },
    // === JUSTICE ===
    {
        id: 'justice-tribunal',
        name: 'Tribunal / Cour',
        shortName: 'Tribunal',
        description: 'Tribunal, cour de justice',
        category: 'justice',
        organizationType: 'administration',
        tags: ['Judiciaire', 'Cour'],
        colorScheme: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
    },
    {
        id: 'justice-parquet',
        name: 'Parquet / Procureur',
        shortName: 'Parquet',
        description: 'Parquet, procureur, ministère public',
        category: 'justice',
        organizationType: 'administration',
        tags: ['Parquet', 'Poursuites'],
        colorScheme: 'linear-gradient(135deg, #9a3412 0%, #ea580c 100%)',
    },
    {
        id: 'justice-prison',
        name: 'Administration Pénitentiaire',
        shortName: 'Pénitentiaire',
        description: 'Prison, pénitentiaire, réhabilitation',
        category: 'justice',
        organizationType: 'administration',
        tags: ['Pénal', 'Détention'],
        colorScheme: 'linear-gradient(135deg, #78350f 0%, #a16207 100%)',
    },
    // === COLLECTIVITÉS ===
    {
        id: 'local-mairie',
        name: 'Mairie / Commune',
        shortName: 'Mairie',
        description: 'Mairie, commune, municipalité',
        category: 'collectivites',
        organizationType: 'administration',
        tags: ['Local', 'Commune'],
        colorScheme: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    },
    {
        id: 'local-conseil-departemental',
        name: 'Conseil Départemental',
        shortName: 'Département',
        description: 'Conseil départemental',
        category: 'collectivites',
        organizationType: 'administration',
        tags: ['Département', 'Local'],
        colorScheme: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
    },
    {
        id: 'local-province',
        name: 'Gouvernorat / Province',
        shortName: 'Province',
        description: 'Gouvernorat, province',
        category: 'collectivites',
        organizationType: 'administration',
        tags: ['Province', 'Région'],
        colorScheme: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
    // === SÉCURITÉ & DÉFENSE ===
    {
        id: 'securite-police',
        name: 'Police / Gendarmerie',
        shortName: 'Police',
        description: 'Police nationale, gendarmerie',
        category: 'securite-defense',
        organizationType: 'administration',
        tags: ['Sécurité', 'Ordre'],
        colorScheme: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    },
    {
        id: 'securite-armee',
        name: 'Forces Armées',
        shortName: 'Armée',
        description: 'Forces armées, défense nationale',
        category: 'securite-defense',
        organizationType: 'administration',
        tags: ['Défense', 'Militaire'],
        colorScheme: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
    },
    {
        id: 'securite-douane',
        name: 'Douanes',
        shortName: 'Douanes',
        description: 'Douanes, fiscalité aux frontières',
        category: 'securite-defense',
        organizationType: 'administration',
        tags: ['Douane', 'Frontières'],
        colorScheme: 'linear-gradient(135deg, #134e4a 0%, #0d9488 100%)',
    },
    // === ÉDUCATION & CULTURE ===
    {
        id: 'education-universite',
        name: 'Université / Grande École',
        shortName: 'Université',
        description: 'Université, grande école',
        category: 'education-culture',
        organizationType: 'administration',
        tags: ['Supérieur', 'Recherche'],
        colorScheme: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    },
    {
        id: 'education-lycee',
        name: 'Lycée / Collège',
        shortName: 'Lycée',
        description: 'Lycée, collège, établissement scolaire',
        category: 'education-culture',
        organizationType: 'administration',
        tags: ['Secondaire', 'Enseignement'],
        colorScheme: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
    },
    {
        id: 'culture-musee',
        name: 'Musée / Patrimoine',
        shortName: 'Musée',
        description: 'Musée, centre culturel, patrimoine',
        category: 'education-culture',
        organizationType: 'administration',
        tags: ['Culture', 'Patrimoine'],
        colorScheme: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)',
    },
    // === SANTÉ PUBLIQUE ===
    {
        id: 'sante-hopital',
        name: 'Hôpital Public',
        shortName: 'Hôpital',
        description: 'Centre hospitalier, CHU, hôpital',
        category: 'sante-publique',
        organizationType: 'administration',
        tags: ['Hospitalier', 'Urgences'],
        colorScheme: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    },
    {
        id: 'sante-centre',
        name: 'Centre de Santé',
        shortName: 'Centre Santé',
        description: 'Centre de santé, dispensaire',
        category: 'sante-publique',
        organizationType: 'administration',
        tags: ['Soins', 'Proximité'],
        colorScheme: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
    },
    // === CUSTOM ===
    {
        id: 'custom',
        name: 'Personnalisé',
        shortName: 'Personnalisé',
        description: 'Créez votre propre structure',
        category: 'autres-entreprises', // Default category
        organizationType: 'entreprise',
        tags: ['Flexible', 'Sur mesure'],
        colorScheme: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
    },
];

// =============================================================================
// IMAGE & MEDIA TYPES
// =============================================================================

export interface ImageConfig {
    url: string;
    alt: string;
    width: string;           // '100%', '500px', 'auto'
    height: string;          // '400px', '50vh', 'auto'
    objectFit: 'cover' | 'contain' | 'fill' | 'none';
    objectPosition: string;  // 'center', 'top', '50% 30%'
    borderRadius: string;    // '0', '8px', '1rem', '50%'
    overlay?: {
        enabled: boolean;
        color: string;
        opacity: number;
    };
}

export interface MediaItem {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'video' | 'document';
    mimeType: string;
    size: number;
    uploadedAt: number;
    thumbnailUrl?: string;
    tags?: string[];
}

// =============================================================================
// THEME TYPES
// =============================================================================

export interface ThemeConfig {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        card: string;
        cardForeground: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    shadows: 'none' | 'sm' | 'md' | 'lg';
    animations: boolean;
}

// =============================================================================
// SECTION CONFIGS
// =============================================================================

export interface HeroConfig {
    enabled: boolean;
    layout: 'centered' | 'left' | 'right' | 'split';
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: ImageConfig | null;
    logo: ImageConfig | null;
    badge?: string;
    cta?: {
        primary: { text: string; link: string };
        secondary?: { text: string; link: string };
    };
    height: 'sm' | 'md' | 'lg' | 'xl' | 'screen';
    showStats: boolean;
    stats?: { label: string; value: string }[];
}

export interface AboutConfig {
    enabled: boolean;
    layout: 'text-only' | 'text-image' | 'image-text' | 'cards';
    title: string;
    subtitle: string;
    content: string;
    image: ImageConfig | null;
    features?: { icon: string; title: string; description: string }[];
    certifications?: string[];
    timeline?: { year: string; event: string }[];
}

export interface ServicesConfig {
    enabled: boolean;
    layout: 'grid' | 'list' | 'cards' | 'tabs';
    title: string;
    subtitle: string;
    services: {
        id: string;
        icon: string;
        title: string;
        description: string;
        image?: ImageConfig;
        link?: string;
    }[];
}

export interface TeamConfig {
    enabled: boolean;
    layout: 'grid' | 'carousel' | 'featured';
    title: string;
    subtitle: string;
    showLeadership: boolean;
    members: {
        id: string;
        name: string;
        role: string;
        department?: string;
        photo: ImageConfig | null;
        bio?: string;
        social?: { linkedin?: string; twitter?: string; email?: string };
    }[];
}

export interface ContactConfig {
    enabled: boolean;
    layout: 'form-map' | 'form-info' | 'info-only' | 'cards';
    title: string;
    subtitle: string;
    showForm: boolean;
    showMap: boolean;
    mapCoordinates?: { lat: number; lng: number };
    address: {
        street: string;
        city: string;
        postalCode?: string;
        country: string;
    };
    phone: string;
    email: string;
    hours?: string;
    social?: {
        linkedin?: string;
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
    };
}

export interface DocumentsConfig {
    enabled: boolean;
    layout: 'grid' | 'list' | 'categories';
    title: string;
    subtitle: string;
    categories: {
        id: string;
        name: string;
        documents: {
            id: string;
            title: string;
            description?: string;
            fileUrl: string;
            fileType: string;
            fileSize: string;
            uploadedAt: string;
        }[];
    }[];
}

export interface GalleryConfig {
    enabled: boolean;
    layout: 'grid' | 'masonry' | 'carousel';
    title: string;
    subtitle: string;
    images: (ImageConfig & { caption?: string })[];
}

export interface NewsConfig {
    enabled: boolean;
    layout: 'grid' | 'list' | 'featured';
    title: string;
    subtitle: string;
    showPagination: boolean;
    articles: {
        id: string;
        title: string;
        excerpt: string;
        image?: ImageConfig;
        date: string;
        category?: string;
        link?: string;
    }[];
}

// Union type for all section configs
export type SectionConfig =
    | HeroConfig
    | AboutConfig
    | ServicesConfig
    | TeamConfig
    | ContactConfig
    | DocumentsConfig
    | GalleryConfig
    | NewsConfig;

// =============================================================================
// PUBLIC PAGE (V2 Multi-Page Structure)
// =============================================================================

export interface PublicPage {
    id: string;
    slug: string;              // 'a-propos', 'equipe', 'contact'
    title: string;             // Displayed in navigation
    isHome: boolean;           // Is this the homepage?
    orderIndex: number;        // Order in navigation
    showInNav: boolean;        // Show in navigation menu
    themeOverride?: Partial<ThemeConfig>; // Per-page theme override
    sections: SectionType[];   // Sections on this page
    sectionConfigs: {
        hero?: HeroConfig;
        about?: AboutConfig;
        services?: ServicesConfig;
        team?: TeamConfig;
        contact?: ContactConfig;
        documents?: DocumentsConfig;
        gallery?: GalleryConfig;
        news?: NewsConfig;
    };
    seo?: {
        title?: string;
        description?: string;
    };
}

// Navigation Configuration
export interface NavigationConfig {
    showInHeader: boolean;
    showInFooter: boolean;
    style: 'tabs' | 'dropdown' | 'sidebar' | 'minimal';
    logo?: ImageConfig;
    showSocialLinks: boolean;
}

// =============================================================================
// COMPLETE PAGE CONFIGURATION (V2)
// =============================================================================

export interface PublicPageConfiguration {
    // Meta
    id: string;
    organizationId: string;
    organizationType: OrganizationType;
    templateId: TemplateId;
    isPublished: boolean;
    lastSavedAt: number;
    slug: string;
    version: 2;

    // Global Theme (default for all pages)
    theme: ThemeConfig;

    // V2: Multi-page structure
    pages: PublicPage[];
    navigation: NavigationConfig;

    // V2: Media Library
    mediaLibrary: MediaItem[];

    // Global SEO
    seo: {
        title: string;
        description: string;
        keywords: string[];
        ogImage?: string;
    };

    // Footer
    footer: {
        showLinks: boolean;
        showContact: boolean;
        showSocial: boolean;
        copyright: string;
        links?: { label: string; url: string }[];
    };
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const defaultImageConfig: ImageConfig = {
    url: '',
    alt: '',
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    objectPosition: 'center',
    borderRadius: '8px',
};

export const defaultTheme: ThemeConfig = {
    colors: {
        primary: '#3b82f6',
        secondary: '#6366f1',
        accent: '#8b5cf6',
        background: '#0f172a',
        foreground: '#f8fafc',
        muted: '#334155',
        card: '#1e293b',
        cardForeground: '#f8fafc',
    },
    fonts: {
        heading: 'Inter',
        body: 'Inter',
    },
    borderRadius: 'lg',
    shadows: 'md',
    animations: true,
};

const defaultHero: HeroConfig = {
    enabled: true,
    layout: 'centered',
    title: 'Bienvenue',
    subtitle: '',
    description: '',
    backgroundImage: null,
    logo: null,
    height: 'lg',
    showStats: false,
};

const defaultAbout: AboutConfig = {
    enabled: true,
    layout: 'text-image',
    title: 'À propos',
    subtitle: '',
    content: '',
    image: null,
};

const defaultServices: ServicesConfig = {
    enabled: true,
    layout: 'grid',
    title: 'Nos Services',
    subtitle: '',
    services: [],
};

const defaultTeam: TeamConfig = {
    enabled: true,
    layout: 'grid',
    title: 'Notre Équipe',
    subtitle: '',
    showLeadership: true,
    members: [],
};

const defaultContact: ContactConfig = {
    enabled: true,
    layout: 'form-info',
    title: 'Contact',
    subtitle: '',
    showForm: true,
    showMap: false,
    address: { street: '', city: '', country: '' },
    phone: '',
    email: '',
};

const defaultDocuments: DocumentsConfig = {
    enabled: false,
    layout: 'categories',
    title: 'Documents',
    subtitle: '',
    categories: [],
};

const defaultGallery: GalleryConfig = {
    enabled: false,
    layout: 'grid',
    title: 'Galerie',
    subtitle: '',
    images: [],
};

const defaultNews: NewsConfig = {
    enabled: false,
    layout: 'grid',
    title: 'Actualités',
    subtitle: '',
    showPagination: true,
    articles: [],
};

// =============================================================================
// TEMPLATE PRESETS V2
// =============================================================================

interface TemplatePreset {
    id: TemplateId;
    name: string;
    description: string;
    organizationType: OrganizationType;
    theme: ThemeConfig;
    pages: Omit<PublicPage, 'id'>[];
}

export const TEMPLATE_PRESETS_V2: TemplatePreset[] = [
    // =========================================================================
    // ENTREPRISE TEMPLATES
    // =========================================================================
    {
        id: 'corporate-pro',
        name: 'Entreprise Corporate',
        description: 'Structure complète pour grandes entreprises',
        organizationType: 'entreprise',
        theme: {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: '#1e3a5f',
                secondary: '#2d4a6f',
                accent: '#f59e0b',
                background: '#ffffff',
                foreground: '#1e293b',
                card: '#f8fafc',
                cardForeground: '#1e293b',
            },
            borderRadius: 'sm',
        },
        pages: [
            {
                slug: '',
                title: 'Accueil',
                isHome: true,
                orderIndex: 0,
                showInNav: true,
                sections: ['hero', 'about', 'services'],
                sectionConfigs: {
                    hero: {
                        ...defaultHero, layout: 'left', showStats: true, stats: [
                            { label: "Années d'expérience", value: '25+' },
                            { label: 'Clients satisfaits', value: '500+' },
                            { label: 'Projets réalisés', value: '1000+' },
                        ]
                    },
                    about: { ...defaultAbout, layout: 'text-image' },
                    services: { ...defaultServices, layout: 'cards' },
                },
            },
            {
                slug: 'a-propos',
                title: 'À propos',
                isHome: false,
                orderIndex: 1,
                showInNav: true,
                sections: ['hero', 'about', 'team'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Notre Histoire' },
                    about: { ...defaultAbout, layout: 'cards' },
                    team: { ...defaultTeam, showLeadership: true },
                },
            },
            {
                slug: 'services',
                title: 'Services',
                isHome: false,
                orderIndex: 2,
                showInNav: true,
                sections: ['hero', 'services'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Nos Services' },
                    services: { ...defaultServices, layout: 'tabs' },
                },
            },
            {
                slug: 'equipe',
                title: 'Équipe',
                isHome: false,
                orderIndex: 3,
                showInNav: true,
                sections: ['hero', 'team'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Notre Équipe' },
                    team: { ...defaultTeam, layout: 'featured' },
                },
            },
            {
                slug: 'contact',
                title: 'Contact',
                isHome: false,
                orderIndex: 4,
                showInNav: true,
                sections: ['hero', 'contact'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Contactez-nous' },
                    contact: { ...defaultContact, layout: 'form-map' },
                },
            },
        ],
    },
    {
        id: 'startup-tech',
        name: 'Startup Tech',
        description: 'Design moderne avec animations',
        organizationType: 'entreprise',
        theme: {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: '#8b5cf6',
                secondary: '#ec4899',
                accent: '#06b6d4',
            },
            borderRadius: 'xl',
            shadows: 'lg',
        },
        pages: [
            {
                slug: '',
                title: 'Accueil',
                isHome: true,
                orderIndex: 0,
                showInNav: true,
                sections: ['hero', 'services', 'team', 'cta'],
                sectionConfigs: {
                    hero: { ...defaultHero, layout: 'split', height: 'screen' },
                    services: { ...defaultServices, title: 'Produit', layout: 'cards' },
                    team: { ...defaultTeam, layout: 'carousel' },
                },
            },
            {
                slug: 'produit',
                title: 'Produit',
                isHome: false,
                orderIndex: 1,
                showInNav: true,
                sections: ['hero', 'services', 'gallery'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'md', title: 'Notre Produit' },
                    services: { ...defaultServices, title: 'Fonctionnalités' },
                    gallery: { ...defaultGallery, enabled: true, title: 'Screenshots' },
                },
            },
            {
                slug: 'contact',
                title: 'Contact',
                isHome: false,
                orderIndex: 2,
                showInNav: true,
                sections: ['hero', 'contact'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Parlons de votre projet' },
                    contact: { ...defaultContact, layout: 'form-info' },
                },
            },
        ],
    },
    {
        id: 'pme-classic',
        name: 'PME Classique',
        description: 'Simple et efficace',
        organizationType: 'entreprise',
        theme: {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: '#2563eb',
                secondary: '#3b82f6',
                accent: '#f97316',
                background: '#ffffff',
                foreground: '#1f2937',
                card: '#f9fafb',
                cardForeground: '#1f2937',
            },
            borderRadius: 'md',
        },
        pages: [
            {
                slug: '',
                title: 'Accueil',
                isHome: true,
                orderIndex: 0,
                showInNav: true,
                sections: ['hero', 'services', 'contact'],
                sectionConfigs: {
                    hero: { ...defaultHero, layout: 'centered' },
                    services: { ...defaultServices, layout: 'grid' },
                    contact: { ...defaultContact, layout: 'cards' },
                },
            },
        ],
    },
    {
        id: 'cabinet-legal',
        name: 'Cabinet Juridique',
        description: 'Élégant et professionnel',
        organizationType: 'entreprise',
        theme: {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: '#374151',
                secondary: '#6b7280',
                accent: '#b91c1c',
                background: '#ffffff',
                foreground: '#111827',
                card: '#f9fafb',
                cardForeground: '#111827',
            },
            borderRadius: 'none',
            shadows: 'sm',
        },
        pages: [
            {
                slug: '',
                title: 'Accueil',
                isHome: true,
                orderIndex: 0,
                showInNav: true,
                sections: ['hero', 'about', 'services'],
                sectionConfigs: {
                    hero: { ...defaultHero, layout: 'left' },
                    about: { ...defaultAbout, title: 'Le Cabinet' },
                    services: { ...defaultServices, title: 'Domaines d\'expertise', layout: 'list' },
                },
            },
            {
                slug: 'expertise',
                title: 'Expertise',
                isHome: false,
                orderIndex: 1,
                showInNav: true,
                sections: ['hero', 'services'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Nos Domaines' },
                    services: { ...defaultServices, layout: 'tabs' },
                },
            },
            {
                slug: 'equipe',
                title: 'Équipe',
                isHome: false,
                orderIndex: 2,
                showInNav: true,
                sections: ['hero', 'team'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Nos Avocats' },
                    team: { ...defaultTeam, layout: 'featured' },
                },
            },
            {
                slug: 'documents',
                title: 'Ressources',
                isHome: false,
                orderIndex: 3,
                showInNav: true,
                sections: ['hero', 'documents'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Ressources Juridiques' },
                    documents: { ...defaultDocuments, enabled: true },
                },
            },
            {
                slug: 'contact',
                title: 'Contact',
                isHome: false,
                orderIndex: 4,
                showInNav: true,
                sections: ['hero', 'contact'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Nous Contacter' },
                    contact: { ...defaultContact, layout: 'form-map' },
                },
            },
        ],
    },

    // =========================================================================
    // ADMINISTRATION TEMPLATES
    // =========================================================================
    {
        id: 'ministere',
        name: 'Ministère',
        description: 'Structure institutionnelle officielle',
        organizationType: 'administration',
        theme: {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: '#047857',
                secondary: '#059669',
                accent: '#fbbf24',
                background: '#f0fdf4',
                foreground: '#1e293b',
                card: '#ffffff',
                cardForeground: '#1e293b',
            },
            borderRadius: 'sm',
            shadows: 'sm',
        },
        pages: [
            {
                slug: '',
                title: 'Accueil',
                isHome: true,
                orderIndex: 0,
                showInNav: true,
                sections: ['hero', 'about', 'services', 'news'],
                sectionConfigs: {
                    hero: {
                        ...defaultHero, layout: 'centered', badge: 'République Gabonaise', showStats: true, stats: [
                            { label: 'Services', value: '12' },
                            { label: 'Agents', value: '150+' },
                            { label: 'Dossiers traités', value: '5000+' },
                        ]
                    },
                    about: { ...defaultAbout, title: 'Notre Mission' },
                    services: { ...defaultServices, title: 'Services aux usagers' },
                    news: { ...defaultNews, enabled: true },
                },
            },
            {
                slug: 'mission',
                title: 'Mission',
                isHome: false,
                orderIndex: 1,
                showInNav: true,
                sections: ['hero', 'about'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Notre Mission' },
                    about: { ...defaultAbout, layout: 'text-only' },
                },
            },
            {
                slug: 'services',
                title: 'Services',
                isHome: false,
                orderIndex: 2,
                showInNav: true,
                sections: ['hero', 'services'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Services aux Citoyens' },
                    services: { ...defaultServices, layout: 'cards' },
                },
            },
            {
                slug: 'documents',
                title: 'Documents',
                isHome: false,
                orderIndex: 3,
                showInNav: true,
                sections: ['hero', 'documents'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Documents Officiels' },
                    documents: { ...defaultDocuments, enabled: true },
                },
            },
            {
                slug: 'actualites',
                title: 'Actualités',
                isHome: false,
                orderIndex: 4,
                showInNav: true,
                sections: ['hero', 'news'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Actualités' },
                    news: { ...defaultNews, enabled: true, layout: 'list' },
                },
            },
            {
                slug: 'contact',
                title: 'Contact',
                isHome: false,
                orderIndex: 5,
                showInNav: true,
                sections: ['hero', 'contact'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Nous Contacter' },
                    contact: { ...defaultContact, layout: 'info-only' },
                },
            },
        ],
    },
    {
        id: 'mairie',
        name: 'Mairie / Commune',
        description: 'Portail de collectivité locale',
        organizationType: 'administration',
        theme: {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: '#1d4ed8',
                secondary: '#3b82f6',
                accent: '#eab308',
                background: '#eff6ff',
                foreground: '#1e293b',
                card: '#ffffff',
                cardForeground: '#1e293b',
            },
            borderRadius: 'md',
        },
        pages: [
            {
                slug: '',
                title: 'Accueil',
                isHome: true,
                orderIndex: 0,
                showInNav: true,
                sections: ['hero', 'services', 'news', 'contact'],
                sectionConfigs: {
                    hero: { ...defaultHero, layout: 'centered' },
                    services: { ...defaultServices, title: 'Démarches', layout: 'cards' },
                    news: { ...defaultNews, enabled: true, layout: 'featured' },
                    contact: { ...defaultContact, layout: 'cards' },
                },
            },
            {
                slug: 'demarches',
                title: 'Démarches',
                isHome: false,
                orderIndex: 1,
                showInNav: true,
                sections: ['hero', 'services'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Vos Démarches' },
                    services: { ...defaultServices, layout: 'list' },
                },
            },
            {
                slug: 'actualites',
                title: 'Actualités',
                isHome: false,
                orderIndex: 2,
                showInNav: true,
                sections: ['hero', 'news'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Actualités Locales' },
                    news: { ...defaultNews, enabled: true },
                },
            },
            {
                slug: 'contact',
                title: 'Contact',
                isHome: false,
                orderIndex: 3,
                showInNav: true,
                sections: ['hero', 'contact'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Nous Contacter' },
                    contact: { ...defaultContact, layout: 'form-map' },
                },
            },
        ],
    },
    {
        id: 'institution',
        name: 'Institution Publique',
        description: 'Page institutionnelle sobre',
        organizationType: 'administration',
        theme: {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: '#4338ca',
                secondary: '#6366f1',
                accent: '#f59e0b',
                background: '#faf5ff',
                foreground: '#1e293b',
                card: '#ffffff',
                cardForeground: '#1e293b',
            },
            borderRadius: 'sm',
            shadows: 'sm',
        },
        pages: [
            {
                slug: '',
                title: 'Accueil',
                isHome: true,
                orderIndex: 0,
                showInNav: true,
                sections: ['hero', 'about', 'documents'],
                sectionConfigs: {
                    hero: { ...defaultHero, layout: 'left' },
                    about: { ...defaultAbout, title: 'Présentation' },
                    documents: { ...defaultDocuments, enabled: true },
                },
            },
            {
                slug: 'presentation',
                title: 'Présentation',
                isHome: false,
                orderIndex: 1,
                showInNav: true,
                sections: ['hero', 'about', 'team'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Qui sommes-nous' },
                    about: { ...defaultAbout, layout: 'cards' },
                    team: { ...defaultTeam, title: 'Direction', layout: 'featured' },
                },
            },
            {
                slug: 'documents',
                title: 'Documents',
                isHome: false,
                orderIndex: 2,
                showInNav: true,
                sections: ['hero', 'documents'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Publications' },
                    documents: { ...defaultDocuments, enabled: true },
                },
            },
            {
                slug: 'contact',
                title: 'Contact',
                isHome: false,
                orderIndex: 3,
                showInNav: true,
                sections: ['hero', 'contact'],
                sectionConfigs: {
                    hero: { ...defaultHero, height: 'sm', title: 'Contact' },
                    contact: { ...defaultContact, layout: 'info-only' },
                },
            },
        ],
    },

    // =========================================================================
    // CUSTOM TEMPLATE
    // =========================================================================
    {
        id: 'custom',
        name: 'Personnalisé',
        description: 'Créez votre propre structure',
        organizationType: 'entreprise',
        theme: defaultTheme,
        pages: [
            {
                slug: '',
                title: 'Accueil',
                isHome: true,
                orderIndex: 0,
                showInNav: true,
                sections: ['hero'],
                sectionConfigs: {
                    hero: defaultHero,
                },
            },
        ],
    },
];

// =============================================================================
// STORE INTERFACE
// =============================================================================

type ActiveEditorSection = SectionType | 'overview' | 'theme' | 'pages' | 'media';

interface PublicPageEditorStore {
    // State
    config: PublicPageConfiguration | null;
    isDirty: boolean;
    activeSection: ActiveEditorSection;
    activePageId: string | null; // Current page being edited

    // Actions - Config
    initializeFromTemplate: (templateId: TemplateId, orgName: string, orgId: string, orgType: OrganizationType) => void;
    setConfig: (config: Partial<PublicPageConfiguration>) => void;
    setActiveSection: (section: ActiveEditorSection) => void;
    updateTheme: (updates: Partial<ThemeConfig>) => void;

    // Actions - Pages (V2)
    setActivePageId: (pageId: string | null) => void;
    addPage: (page: Omit<PublicPage, 'id'>) => void;
    removePage: (pageId: string) => void;
    updatePage: (pageId: string, updates: Partial<PublicPage>) => void;
    reorderPages: (pageIds: string[]) => void;
    updatePageSection: <K extends keyof PublicPage['sectionConfigs']>(
        pageId: string,
        sectionType: K,
        updates: Partial<NonNullable<PublicPage['sectionConfigs'][K]>>
    ) => void;
    togglePageSection: (pageId: string, sectionType: SectionType, enabled: boolean) => void;

    // Actions - Media Library (V2)
    addMedia: (media: Omit<MediaItem, 'id' | 'uploadedAt'>) => void;
    removeMedia: (mediaId: string) => void;
    getMediaById: (mediaId: string) => MediaItem | undefined;

    // Actions - Navigation
    updateNavigation: (updates: Partial<NavigationConfig>) => void;

    // Actions - Save/Publish
    save: () => Promise<void>;
    publish: () => Promise<void>;
    reset: () => void;
}

// =============================================================================
// CREATE STORE
// =============================================================================

export const usePublicPageEditorStore = create<PublicPageEditorStore>()(
    persist(
        (set, get) => ({
            config: null,
            isDirty: false,
            activeSection: 'overview',
            activePageId: null,

            initializeFromTemplate: (templateId, orgName, orgId, orgType) => {
                const preset = TEMPLATE_PRESETS_V2.find(t => t.id === templateId) || TEMPLATE_PRESETS_V2.find(t => t.id === 'custom')!;

                const pages: PublicPage[] = preset.pages.map((p, index) => ({
                    ...p,
                    id: crypto.randomUUID(),
                    sectionConfigs: {
                        ...p.sectionConfigs,
                        hero: p.sectionConfigs.hero ? { ...p.sectionConfigs.hero, title: index === 0 ? orgName : p.sectionConfigs.hero.title } : undefined,
                    },
                }));

                const config: PublicPageConfiguration = {
                    id: crypto.randomUUID(),
                    organizationId: orgId,
                    organizationType: orgType,
                    templateId,
                    isPublished: false,
                    lastSavedAt: Date.now(),
                    slug: orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    version: 2,
                    theme: preset.theme,
                    pages,
                    navigation: {
                        showInHeader: true,
                        showInFooter: true,
                        style: 'tabs',
                        showSocialLinks: true,
                    },
                    mediaLibrary: [],
                    seo: {
                        title: orgName,
                        description: `Bienvenue sur la page officielle de ${orgName}`,
                        keywords: [],
                    },
                    footer: {
                        showLinks: true,
                        showContact: true,
                        showSocial: true,
                        copyright: `© ${new Date().getFullYear()} ${orgName}. Tous droits réservés.`,
                    },
                };

                set({
                    config,
                    isDirty: false,
                    activeSection: 'overview',
                    activePageId: pages[0]?.id || null,
                });
            },

            setConfig: (updates) => {
                set((state) => ({
                    config: state.config ? { ...state.config, ...updates } : null,
                    isDirty: true,
                }));
            },

            setActiveSection: (section) => {
                set({ activeSection: section });
            },

            updateTheme: (updates) => {
                set((state) => {
                    if (!state.config) return state;
                    return {
                        config: {
                            ...state.config,
                            theme: { ...state.config.theme, ...updates },
                        },
                        isDirty: true,
                    };
                });
            },

            // Pages
            setActivePageId: (pageId) => {
                set({ activePageId: pageId });
            },

            addPage: (pageData) => {
                set((state) => {
                    if (!state.config) return state;
                    const newPage: PublicPage = {
                        ...pageData,
                        id: crypto.randomUUID(),
                    };
                    return {
                        config: {
                            ...state.config,
                            pages: [...state.config.pages, newPage],
                        },
                        isDirty: true,
                    };
                });
            },

            removePage: (pageId) => {
                set((state) => {
                    if (!state.config) return state;
                    const pages = state.config.pages.filter(p => p.id !== pageId);
                    return {
                        config: { ...state.config, pages },
                        isDirty: true,
                        activePageId: state.activePageId === pageId ? (pages[0]?.id || null) : state.activePageId,
                    };
                });
            },

            updatePage: (pageId, updates) => {
                set((state) => {
                    if (!state.config) return state;
                    return {
                        config: {
                            ...state.config,
                            pages: state.config.pages.map(p =>
                                p.id === pageId ? { ...p, ...updates } : p
                            ),
                        },
                        isDirty: true,
                    };
                });
            },

            reorderPages: (pageIds) => {
                set((state) => {
                    if (!state.config) return state;
                    const pageMap = new Map(state.config.pages.map(p => [p.id, p]));
                    const reorderedPages = pageIds
                        .map((id, index) => {
                            const page = pageMap.get(id);
                            return page ? { ...page, orderIndex: index } : null;
                        })
                        .filter((p): p is PublicPage => p !== null);
                    return {
                        config: { ...state.config, pages: reorderedPages },
                        isDirty: true,
                    };
                });
            },

            updatePageSection: (pageId, sectionType, updates) => {
                set((state) => {
                    if (!state.config) return state;
                    return {
                        config: {
                            ...state.config,
                            pages: state.config.pages.map(p => {
                                if (p.id !== pageId) return p;
                                const currentSection = p.sectionConfigs[sectionType] || {};
                                return {
                                    ...p,
                                    sectionConfigs: {
                                        ...p.sectionConfigs,
                                        [sectionType]: { ...currentSection, ...updates },
                                    },
                                };
                            }),
                        },
                        isDirty: true,
                    };
                });
            },

            togglePageSection: (pageId, sectionType, enabled) => {
                set((state) => {
                    if (!state.config) return state;
                    return {
                        config: {
                            ...state.config,
                            pages: state.config.pages.map(p => {
                                if (p.id !== pageId) return p;
                                const sections = enabled
                                    ? [...p.sections, sectionType]
                                    : p.sections.filter(s => s !== sectionType);
                                return { ...p, sections };
                            }),
                        },
                        isDirty: true,
                    };
                });
            },

            // Media Library
            addMedia: (mediaData) => {
                set((state) => {
                    if (!state.config) return state;
                    const newMedia: MediaItem = {
                        ...mediaData,
                        id: crypto.randomUUID(),
                        uploadedAt: Date.now(),
                    };
                    return {
                        config: {
                            ...state.config,
                            mediaLibrary: [...state.config.mediaLibrary, newMedia],
                        },
                        isDirty: true,
                    };
                });
            },

            removeMedia: (mediaId) => {
                set((state) => {
                    if (!state.config) return state;
                    return {
                        config: {
                            ...state.config,
                            mediaLibrary: state.config.mediaLibrary.filter(m => m.id !== mediaId),
                        },
                        isDirty: true,
                    };
                });
            },

            getMediaById: (mediaId) => {
                const { config } = get();
                return config?.mediaLibrary.find(m => m.id === mediaId);
            },

            // Navigation
            updateNavigation: (updates) => {
                set((state) => {
                    if (!state.config) return state;
                    return {
                        config: {
                            ...state.config,
                            navigation: { ...state.config.navigation, ...updates },
                        },
                        isDirty: true,
                    };
                });
            },

            // Save/Publish
            save: async () => {
                const { config } = get();
                if (!config) return;
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set({
                    config: { ...config, lastSavedAt: Date.now() },
                    isDirty: false,
                });
            },

            publish: async () => {
                const { config } = get();
                if (!config) return;
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set({
                    config: { ...config, isPublished: true, lastSavedAt: Date.now() },
                    isDirty: false,
                });
            },

            reset: () => {
                set({ config: null, isDirty: false, activeSection: 'overview', activePageId: null });
            },
        }),
        {
            name: 'public-page-editor-v2',
            partialize: (state) => ({ config: state.config }),
        }
    )
);
