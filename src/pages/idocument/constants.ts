
import { FileText, File as FileIcon, Image, FileSpreadsheet } from "lucide-react";
import { IClasseur } from "./types";

export const DOCUMENT_TYPES = {
    contrat: { label: 'Contrat', color: 'bg-blue-500/10 text-blue-600', icon: FileText },
    facture: { label: 'Facture', color: 'bg-green-500/10 text-green-600', icon: FileText },
    devis: { label: 'Devis', color: 'bg-yellow-500/10 text-yellow-600', icon: FileText },
    rapport: { label: 'Rapport', color: 'bg-purple-500/10 text-purple-600', icon: FileText },
    projet: { label: 'Projet', color: 'bg-primary/10 text-primary', icon: FileText },
    other: { label: 'Autre', color: 'bg-gray-500/10 text-gray-600', icon: FileIcon },
};

export const STATUS_CONFIG = {
    brouillon: { label: 'Brouillon', color: 'bg-yellow-500/10 text-yellow-600' },
    en_revision: { label: 'En révision', color: 'bg-blue-500/10 text-blue-600' },
    approuve: { label: 'Approuvé', color: 'bg-green-500/10 text-green-600' },
    archive: { label: 'Archivé', color: 'bg-gray-500/10 text-gray-600' },
};

export const FILE_TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string }> = {
    pdf: { icon: FileText, color: 'text-red-500' },
    doc: { icon: FileText, color: 'text-blue-500' },
    image: { icon: Image, color: 'text-green-500' },
    spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-500' },
    other: { icon: FileIcon, color: 'text-gray-500' },
};

// ========================================
// MOCK DATA: 3-LEVEL HIERARCHY
// ========================================

export const MOCK_CLASSEURS: IClasseur[] = [
    {
        id: 'entreprise-2024',
        name: 'Gestion Entreprise 2024',
        description: 'Documents de gestion de l\'année en cours',
        icon: '📚',
        color: 'bg-blue-500',
        is_system: true,
        created_at: '2024-01-01',
        dossiers: [
            {
                id: 'contrats-clients',
                name: 'Contrats Clients',
                description: 'Contrats signés avec les clients',
                icon: '📝',
                color: 'bg-blue-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'fichier-1',
                        name: 'Contrat de prestation Acme Corp',
                        description: 'Contrat annuel de prestations de services',
                        type: 'contrat',
                        reference: 'CTR-2024-001',
                        author: 'Direction',
                        status: 'approuve',
                        tags: ['client', 'prestation', 'annuel'],
                        created_at: '2024-12-01',
                        attachments: [
                            { id: 'att-1', name: 'contrat-acme-2024.pdf', type: 'pdf', size: '245 KB', created_at: '2024-12-01' },
                            { id: 'att-2', name: 'annexe-conditions.pdf', type: 'pdf', size: '89 KB', created_at: '2024-12-01' },
                        ]
                    },
                    {
                        id: 'fichier-2',
                        name: 'Accord cadre partenariat TechSolutions',
                        description: 'Accord de partenariat stratégique',
                        type: 'contrat',
                        reference: 'CTR-2024-002',
                        author: 'Direction',
                        status: 'en_revision',
                        tags: ['partenaire', 'stratégique'],
                        created_at: '2024-11-28',
                        attachments: [
                            { id: 'att-3', name: 'accord-techsolutions.pdf', type: 'pdf', size: '1.2 MB', created_at: '2024-11-28' },
                        ]
                    },
                ]
            },
            {
                id: 'factures-fournisseurs',
                name: 'Factures Fournisseurs',
                description: 'Factures reçues des fournisseurs',
                icon: '🧾',
                color: 'bg-green-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'fichier-3',
                        name: 'Facture AWS Décembre 2024',
                        type: 'facture',
                        reference: 'FAC-2024-089',
                        author: 'Comptabilité',
                        status: 'approuve',
                        tags: ['cloud', 'infrastructure', 'décembre'],
                        created_at: '2024-12-15',
                        attachments: [
                            { id: 'att-4', name: 'facture-aws-dec24.pdf', type: 'pdf', size: '156 KB', created_at: '2024-12-15' },
                        ]
                    },
                ]
            },
            {
                id: 'devis-prospects',
                name: 'Devis Prospects',
                description: 'Propositions commerciales en cours',
                icon: '💰',
                color: 'bg-yellow-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'fichier-4',
                        name: 'Devis refonte site web - StartupXYZ',
                        type: 'devis',
                        reference: 'DEV-2024-045',
                        author: 'Commercial',
                        status: 'brouillon',
                        tags: ['web', 'refonte', 'startup'],
                        created_at: '2024-12-10',
                        attachments: [
                            { id: 'att-5', name: 'devis-startupxyz.pdf', type: 'pdf', size: '890 KB', created_at: '2024-12-10' },
                            { id: 'att-6', name: 'annexe-technique.xlsx', type: 'spreadsheet', size: '456 KB', created_at: '2024-12-10' },
                        ]
                    },
                ]
            },
        ]
    },
    {
        id: 'projets-2024',
        name: 'Projets 2024',
        description: 'Documentation des projets en cours',
        icon: '🚀',
        color: 'bg-purple-500',
        is_system: true,
        created_at: '2024-01-01',
        dossiers: [
            {
                id: 'projet-digitalium',
                name: 'Projet Digitalium V2',
                description: 'Documentation du projet Digitalium V2',
                icon: '💎',
                color: 'bg-purple-400',
                created_at: '2024-06-01',
                fichiers: [
                    {
                        id: 'fichier-5',
                        name: 'Cahier des charges - Digitalium V2',
                        type: 'projet',
                        reference: 'PRJ-2024-012',
                        author: 'Chef de projet',
                        status: 'approuve',
                        tags: ['cdc', 'v2', 'digitalium'],
                        created_at: '2024-12-08',
                        attachments: [
                            { id: 'att-7', name: 'cdc-digitalium-v2.pdf', type: 'pdf', size: '1.8 MB', created_at: '2024-12-08' },
                        ]
                    },
                    {
                        id: 'fichier-6',
                        name: 'Rapport d\'avancement Q4',
                        type: 'rapport',
                        reference: 'RAP-2024-004',
                        author: 'Chef de projet',
                        status: 'brouillon',
                        tags: ['avancement', 'Q4', '2024'],
                        created_at: '2024-12-20',
                        attachments: [
                            { id: 'att-8', name: 'rapport-q4-2024.pdf', type: 'pdf', size: '2.3 MB', created_at: '2024-12-20' },
                            { id: 'att-9', name: 'statistiques-q4.xlsx', type: 'spreadsheet', size: '789 KB', created_at: '2024-12-20' },
                        ]
                    },
                ]
            },
        ]
    },
    {
        id: 'rh-2024',
        name: 'Ressources Humaines',
        description: 'Documents RH et administratifs',
        icon: '👥',
        color: 'bg-orange-500',
        is_system: true,
        created_at: '2024-01-01',
        dossiers: [
            {
                id: 'procedures-rh',
                name: 'Procédures RH',
                description: 'Procédures et politiques internes',
                icon: '📋',
                color: 'bg-orange-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'fichier-7',
                        name: 'Procédure de Recrutement',
                        type: 'other',
                        reference: 'PROC-RH-001',
                        author: 'DRH',
                        status: 'approuve',
                        tags: ['recrutement', 'procédure', 'rh'],
                        created_at: '2024-03-15',
                        attachments: [
                            { id: 'att-10', name: 'procedure-recrutement.pdf', type: 'pdf', size: '450 KB', created_at: '2024-03-15' },
                        ]
                    },
                ]
            },
        ]
    },
    {
        id: 'archives-2023',
        name: 'Archives 2023',
        description: 'Documents archivés de l\'année précédente',
        icon: '📦',
        color: 'bg-gray-500',
        is_system: false,
        created_at: '2024-01-01',
        dossiers: []
    },
];

// ========================================
// MOCK DATA: MINISTÈRE DE LA PÊCHE ET DES MERS
// Documents administratifs pour les comptes démo du ministère
// ========================================

export const MOCK_CLASSEURS_MINISTERE_PECHE: IClasseur[] = [
    {
        id: 'mp-secretariat-general',
        name: 'Secrétariat Général',
        description: 'Documents administratifs du Secrétariat Général',
        icon: '🏛️',
        color: 'bg-blue-500',
        is_system: true,
        created_at: '2024-01-01',
        dossiers: [
            {
                id: 'mp-notes-service',
                name: 'Notes de Service',
                description: 'Notes et circulaires internes',
                icon: '📝',
                color: 'bg-blue-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'mp-fichier-1',
                        name: 'Note de service - Organisation du travail 2026',
                        description: 'Note relative aux horaires et modalités de travail',
                        type: 'other',
                        reference: 'NS/SG/2026-001',
                        author: 'Secrétaire Général',
                        status: 'approuve',
                        tags: ['organisation', 'rh', '2026'],
                        created_at: '2026-01-15',
                        attachments: [
                            { id: 'mp-att-1', name: 'note-service-organisation-2026.pdf', type: 'pdf', size: '145 KB', created_at: '2026-01-15' }
                        ]
                    },
                    {
                        id: 'mp-fichier-2',
                        name: 'Circulaire - Procédure de validation des documents',
                        description: 'Procédure de circuit de validation',
                        type: 'other',
                        reference: 'CIRC/SG/2026-003',
                        author: 'Cabinet',
                        status: 'approuve',
                        tags: ['procédure', 'validation'],
                        created_at: '2026-01-10',
                        attachments: [
                            { id: 'mp-att-2', name: 'circulaire-validation-docs.pdf', type: 'pdf', size: '89 KB', created_at: '2026-01-10' }
                        ]
                    },
                    {
                        id: 'mp-fichier-3',
                        name: 'Note - Réunion hebdomadaire de coordination',
                        description: 'Convocation à la réunion de coordination',
                        type: 'other',
                        reference: 'NS/SG/2026-012',
                        author: 'Secrétaire Général',
                        status: 'brouillon',
                        tags: ['réunion', 'coordination'],
                        created_at: '2026-01-28',
                        attachments: [
                            { id: 'mp-att-3', name: 'convocation-reunion-coordination.pdf', type: 'pdf', size: '56 KB', created_at: '2026-01-28' }
                        ]
                    }
                ]
            },
            {
                id: 'mp-arretes',
                name: 'Arrêtés Ministériels',
                description: 'Arrêtés et décisions du Ministre',
                icon: '⚖️',
                color: 'bg-purple-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'mp-fichier-4',
                        name: 'Arrêté - Période de fermeture de la pêche 2026',
                        description: 'Fixation de la période de fermeture pour la reproduction',
                        type: 'contrat',
                        reference: 'ARR/MPM/2026-001',
                        author: 'Cabinet du Ministre',
                        status: 'approuve',
                        tags: ['arrêté', 'réglementation', 'pêche'],
                        created_at: '2026-01-05',
                        attachments: [
                            { id: 'mp-att-4', name: 'arrete-fermeture-peche-2026.pdf', type: 'pdf', size: '234 KB', created_at: '2026-01-05' }
                        ]
                    },
                    {
                        id: 'mp-fichier-5',
                        name: 'Arrêté - Quotas de capture annuels',
                        description: 'Fixation des quotas de capture par espèce',
                        type: 'contrat',
                        reference: 'ARR/MPM/2026-002',
                        author: 'Cabinet du Ministre',
                        status: 'en_revision',
                        tags: ['arrêté', 'quotas', 'environnement'],
                        created_at: '2026-01-20',
                        attachments: [
                            { id: 'mp-att-5', name: 'arrete-quotas-capture-2026.pdf', type: 'pdf', size: '312 KB', created_at: '2026-01-20' },
                            { id: 'mp-att-5b', name: 'annexe-tableau-quotas.xlsx', type: 'spreadsheet', size: '45 KB', created_at: '2026-01-20' }
                        ]
                    }
                ]
            },
            {
                id: 'mp-courriers',
                name: 'Courriers Officiels',
                description: 'Correspondances officielles',
                icon: '✉️',
                color: 'bg-amber-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'mp-fichier-6',
                        name: 'Courrier au Ministère de l\'Environnement',
                        description: 'Coordination sur la protection des zones maritimes',
                        type: 'other',
                        reference: 'COUR/SG/2026-045',
                        author: 'Secrétaire Général',
                        status: 'approuve',
                        tags: ['courrier', 'environnement', 'coordination'],
                        created_at: '2026-01-22',
                        attachments: [
                            { id: 'mp-att-6', name: 'courrier-min-environnement.pdf', type: 'pdf', size: '178 KB', created_at: '2026-01-22' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'mp-direction-peche',
        name: 'Direction de la Pêche',
        description: 'Documents opérationnels de la Direction de la Pêche',
        icon: '🐟',
        color: 'bg-cyan-500',
        is_system: true,
        created_at: '2024-01-01',
        dossiers: [
            {
                id: 'mp-licences',
                name: 'Licences de Pêche',
                description: 'Dossiers de licences accordées',
                icon: '📋',
                color: 'bg-cyan-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'mp-fichier-7',
                        name: 'Licence - Navire ATLANTIC STAR',
                        description: 'Licence de pêche industrielle',
                        type: 'contrat',
                        reference: 'LIC/DP/2026-001',
                        author: 'Direction de la Pêche',
                        status: 'approuve',
                        tags: ['licence', 'industrielle', 'navire'],
                        created_at: '2026-01-08',
                        attachments: [
                            { id: 'mp-att-7', name: 'licence-atlantic-star.pdf', type: 'pdf', size: '456 KB', created_at: '2026-01-08' }
                        ]
                    },
                    {
                        id: 'mp-fichier-8',
                        name: 'Licence - Coopérative Cap Lopez',
                        description: 'Licence de pêche artisanale collective',
                        type: 'contrat',
                        reference: 'LIC/DP/2026-015',
                        author: 'Direction de la Pêche',
                        status: 'approuve',
                        tags: ['licence', 'artisanale', 'coopérative'],
                        created_at: '2026-01-12',
                        attachments: [
                            { id: 'mp-att-8', name: 'licence-coop-cap-lopez.pdf', type: 'pdf', size: '389 KB', created_at: '2026-01-12' }
                        ]
                    },
                    {
                        id: 'mp-fichier-9',
                        name: 'Demande de licence - OCEAN HARVEST LTD',
                        description: 'Dossier de demande en cours de traitement',
                        type: 'contrat',
                        reference: 'DEM/DP/2026-023',
                        author: 'Service des Licences',
                        status: 'en_revision',
                        tags: ['demande', 'licence', 'en_attente'],
                        created_at: '2026-01-25',
                        attachments: [
                            { id: 'mp-att-9', name: 'demande-ocean-harvest.pdf', type: 'pdf', size: '1.2 MB', created_at: '2026-01-25' },
                            { id: 'mp-att-9b', name: 'pieces-justificatives.zip', type: 'other', size: '4.5 MB', created_at: '2026-01-25' }
                        ]
                    }
                ]
            },
            {
                id: 'mp-inspections',
                name: 'Rapports d\'Inspection',
                description: 'Rapports des inspections maritimes',
                icon: '🔍',
                color: 'bg-orange-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'mp-fichier-10',
                        name: 'Rapport d\'inspection - Port d\'Owendo',
                        description: 'Inspection trimestrielle du port de pêche',
                        type: 'rapport',
                        reference: 'RAP/INS/2026-Q1-001',
                        author: 'Inspecteur Maritime',
                        status: 'approuve',
                        tags: ['inspection', 'port', 'owendo'],
                        created_at: '2026-01-18',
                        attachments: [
                            { id: 'mp-att-10', name: 'rapport-inspection-owendo-q1.pdf', type: 'pdf', size: '2.3 MB', created_at: '2026-01-18' },
                            { id: 'mp-att-10b', name: 'photos-inspection.zip', type: 'other', size: '12 MB', created_at: '2026-01-18' }
                        ]
                    },
                    {
                        id: 'mp-fichier-11',
                        name: 'PV de contrôle - Navire BLUE HORIZON',
                        description: 'Procès-verbal de contrôle en mer',
                        type: 'rapport',
                        reference: 'PV/INS/2026-089',
                        author: 'Agent de Contrôle',
                        status: 'approuve',
                        tags: ['contrôle', 'mer', 'conformité'],
                        created_at: '2026-01-20',
                        attachments: [
                            { id: 'mp-att-11', name: 'pv-controle-blue-horizon.pdf', type: 'pdf', size: '567 KB', created_at: '2026-01-20' }
                        ]
                    }
                ]
            },
            {
                id: 'mp-conventions',
                name: 'Conventions',
                description: 'Accords et conventions de pêche',
                icon: '🤝',
                color: 'bg-emerald-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'mp-fichier-12',
                        name: 'Convention de partenariat - UE 2024-2027',
                        description: 'Accord de pêche avec l\'Union Européenne',
                        type: 'contrat',
                        reference: 'CONV/MPM/2024-001',
                        author: 'Cabinet du Ministre',
                        status: 'approuve',
                        tags: ['convention', 'ue', 'international'],
                        created_at: '2024-07-01',
                        attachments: [
                            { id: 'mp-att-12', name: 'convention-ue-2024-2027.pdf', type: 'pdf', size: '3.4 MB', created_at: '2024-07-01' }
                        ]
                    },
                    {
                        id: 'mp-fichier-13',
                        name: 'Protocole d\'accord - CEMAC',
                        description: 'Coopération régionale sur les ressources halieutiques',
                        type: 'contrat',
                        reference: 'PROT/MPM/2025-003',
                        author: 'Direction de la Coopération',
                        status: 'approuve',
                        tags: ['protocole', 'cemac', 'régional'],
                        created_at: '2025-03-15',
                        attachments: [
                            { id: 'mp-att-13', name: 'protocole-cemac-halieutique.pdf', type: 'pdf', size: '1.8 MB', created_at: '2025-03-15' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'mp-daf',
        name: 'Direction Administrative et Financière',
        description: 'Documents financiers et administratifs',
        icon: '💰',
        color: 'bg-emerald-500',
        is_system: true,
        created_at: '2024-01-01',
        dossiers: [
            {
                id: 'mp-budget',
                name: 'Budget 2026',
                description: 'Documents budgétaires de l\'exercice',
                icon: '📊',
                color: 'bg-emerald-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'mp-fichier-14',
                        name: 'Projet de budget 2026',
                        description: 'Document de programmation budgétaire',
                        type: 'rapport',
                        reference: 'BUD/DAF/2026-001',
                        author: 'Directeur DAF',
                        status: 'approuve',
                        tags: ['budget', '2026', 'programmation'],
                        created_at: '2025-11-15',
                        attachments: [
                            { id: 'mp-att-14', name: 'projet-budget-2026.pdf', type: 'pdf', size: '2.1 MB', created_at: '2025-11-15' },
                            { id: 'mp-att-14b', name: 'annexes-budget-2026.xlsx', type: 'spreadsheet', size: '890 KB', created_at: '2025-11-15' }
                        ]
                    },
                    {
                        id: 'mp-fichier-15',
                        name: 'Rapport d\'exécution budgétaire - Janvier 2026',
                        description: 'Suivi de l\'exécution du budget',
                        type: 'rapport',
                        reference: 'RAP/DAF/2026-001',
                        author: 'Service Comptabilité',
                        status: 'brouillon',
                        tags: ['exécution', 'budget', 'janvier'],
                        created_at: '2026-01-28',
                        attachments: [
                            { id: 'mp-att-15', name: 'execution-budget-jan-2026.pdf', type: 'pdf', size: '678 KB', created_at: '2026-01-28' }
                        ]
                    }
                ]
            },
            {
                id: 'mp-marches',
                name: 'Marchés Publics',
                description: 'Dossiers de marchés et appels d\'offres',
                icon: '📑',
                color: 'bg-red-400',
                created_at: '2024-01-01',
                fichiers: [
                    {
                        id: 'mp-fichier-16',
                        name: 'DAO - Acquisition équipements de surveillance maritime',
                        description: 'Dossier d\'appel d\'offres ouvert',
                        type: 'projet',
                        reference: 'DAO/DAF/2026-002',
                        author: 'Service Marchés Publics',
                        status: 'en_revision',
                        tags: ['dao', 'surveillance', 'équipements'],
                        created_at: '2026-01-22',
                        attachments: [
                            { id: 'mp-att-16', name: 'dao-equipements-surveillance.pdf', type: 'pdf', size: '4.5 MB', created_at: '2026-01-22' },
                            { id: 'mp-att-16b', name: 'cahier-charges-technique.pdf', type: 'pdf', size: '1.2 MB', created_at: '2026-01-22' }
                        ]
                    },
                    {
                        id: 'mp-fichier-17',
                        name: 'Marché - Entretien véhicules 2026',
                        description: 'Contrat de maintenance du parc automobile',
                        type: 'contrat',
                        reference: 'MRC/DAF/2026-001',
                        author: 'Service Marchés Publics',
                        status: 'approuve',
                        tags: ['marché', 'maintenance', 'véhicules'],
                        created_at: '2026-01-10',
                        attachments: [
                            { id: 'mp-att-17', name: 'marche-entretien-vehicules.pdf', type: 'pdf', size: '890 KB', created_at: '2026-01-10' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'mp-archives-2025',
        name: 'Archives 2025',
        description: 'Documents archivés de l\'année précédente',
        icon: '📦',
        color: 'bg-gray-500',
        is_system: false,
        created_at: '2026-01-01',
        dossiers: []
    }
];

// CLASSEUR TEMPLATES for creation modal

export const CLASSEUR_TEMPLATES = [
    { icon: '📚', color: 'bg-blue-500', name: 'Gestion Annuelle', description: 'Documents de gestion par année' },
    { icon: '🚀', color: 'bg-purple-500', name: 'Projet', description: 'Documentation projet' },
    { icon: '👥', color: 'bg-orange-500', name: 'Ressources Humaines', description: 'Documents RH' },
    { icon: '💰', color: 'bg-green-500', name: 'Comptabilité', description: 'Documents financiers' },
    { icon: '📦', color: 'bg-gray-500', name: 'Archives', description: 'Documents archivés' },
];

// DOSSIER TEMPLATES for creation modal
export const DOSSIER_TEMPLATES = [
    { icon: '📝', color: 'bg-blue-400', name: 'Contrats', description: 'Contrats et accords' },
    { icon: '🧾', color: 'bg-green-400', name: 'Factures', description: 'Factures et paiements' },
    { icon: '💰', color: 'bg-yellow-400', name: 'Devis', description: 'Propositions commerciales' },
    { icon: '📊', color: 'bg-purple-400', name: 'Rapports', description: 'Analyses et rapports' },
    { icon: '📋', color: 'bg-orange-400', name: 'Procédures', description: 'Procédures internes' },
];

export const CLASSEUR_COLORS = [
    { value: 'bg-blue-500', label: 'Bleu' },
    { value: 'bg-green-500', label: 'Vert' },
    { value: 'bg-purple-500', label: 'Violet' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-red-500', label: 'Rouge' },
    { value: 'bg-pink-500', label: 'Rose' },
    { value: 'bg-yellow-500', label: 'Jaune' },
    { value: 'bg-gray-500', label: 'Gris' },
];

export const CLASSEUR_ICONS = ['📚', '📒', '📔', '📕', '📗', '📘', '📙', '🗂️', '📁', '🚀', '💼', '🏢'];
export const DOSSIER_ICONS = ['📁', '📂', '📄', '🧾', '💰', '📊', '📝', '🗂️', '📋', '📑', '👥', '💼'];
