
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
