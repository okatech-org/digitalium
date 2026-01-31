/**
 * useOrganizationContext - Hook to detect the current organization context
 * Returns organization-specific data based on the logged-in user's email
 */

import { useAuth } from '@/contexts/FirebaseAuthContext';

export type OrganizationType = 'ascoma' | 'peche' | 'generic';

interface OrganizationMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
    department: string;
    initials: string;
    joinedAt: number;
    lastActiveAt?: number;
    status: 'active' | 'pending' | 'suspended';
}

interface OrganizationConfig {
    type: OrganizationType;
    name: string;
    shortName: string;
    address: string;
    city: string;
    country: string;
    nif: string;
    apiPrefix: string;
    primaryColor: string;
    gradient: string;
    members: OrganizationMember[];
    stats: {
        documents: { value: number; change: number };
        archives: { value: number; change: number };
        signatures: { value: number; change: number };
        users: { value: number; change: number };
    };
    topDocuments: { name: string; views: number; category: string }[];
    storageUsed: number;
    storageTotalGB: number;
    planName: string;
    planPrice: number;
    isInstitutional: boolean;
}

// ASCOMA Assurances - Enterprise insurance company
const ASCOMA_CONFIG: OrganizationConfig = {
    type: 'ascoma',
    name: 'ASCOMA Assurances SARL',
    shortName: 'ASCOMA',
    address: 'Boulevard Triomphal Omar Bongo',
    city: 'Libreville',
    country: 'Gabon',
    nif: 'GA-ASC-2024-001',
    apiPrefix: 'asc',
    primaryColor: 'emerald',
    gradient: 'from-emerald-500 to-green-500',
    members: [
        {
            id: 'dg-ascoma',
            name: 'Directeur Général',
            email: 'dg@ascoma.ga',
            role: 'admin',
            department: 'Direction Générale',
            initials: 'DG',
            joinedAt: Date.now() - 730 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 30 * 60 * 1000,
            status: 'active',
        },
        {
            id: 'dc-ascoma',
            name: 'Directeur Commercial',
            email: 'commercial@ascoma.ga',
            role: 'manager',
            department: 'Commercial',
            initials: 'DC',
            joinedAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 2 * 60 * 60 * 1000,
            status: 'active',
        },
        {
            id: 'gs-ascoma',
            name: 'Gestionnaire Sinistres',
            email: 'sinistres@ascoma.ga',
            role: 'manager',
            department: 'Sinistres',
            initials: 'GS',
            joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 1 * 60 * 60 * 1000,
            status: 'active',
        },
        {
            id: 'agent-ascoma',
            name: 'Agent Commercial',
            email: 'agent@ascoma.ga',
            role: 'member',
            department: 'Commercial',
            initials: 'AC',
            joinedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
            status: 'active',
        },
        {
            id: 'juriste-ascoma',
            name: 'Juriste',
            email: 'legal@ascoma.ga',
            role: 'viewer',
            department: 'Juridique',
            initials: 'JU',
            joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
            status: 'pending',
        },
    ],
    stats: {
        documents: { value: 1456, change: 12.5 },
        archives: { value: 892, change: 8.2 },
        signatures: { value: 234, change: 15.3 },
        users: { value: 5, change: 0 },
    },
    topDocuments: [
        { name: 'Police Auto PRO-2026-001', views: 289, category: 'police' },
        { name: 'Contrat Multirisque Entreprise', views: 214, category: 'contrat' },
        { name: 'Déclaration Sinistre #2026-045', views: 187, category: 'sinistre' },
        { name: 'Avenant Police Incendie', views: 156, category: 'avenant' },
        { name: 'Conditions Générales 2026', views: 134, category: 'legal' },
    ],
    storageUsed: 3.8,
    storageTotalGB: 50,
    planName: 'Enterprise',
    planPrice: 200000,
    isInstitutional: false,
};

// Ministère de la Pêche et des Mers
const PECHE_CONFIG: OrganizationConfig = {
    type: 'peche',
    name: 'Ministère de la Pêche et des Mers',
    shortName: 'Min. Pêche',
    address: "Boulevard de l'Indépendance",
    city: 'Libreville',
    country: 'Gabon',
    nif: 'GA-GOV-MPM-001',
    apiPrefix: 'mpm',
    primaryColor: 'purple',
    gradient: 'from-purple-600 to-violet-700',
    members: [
        {
            id: 'ministre',
            name: 'Ministère de la Pêche',
            email: 'ministre-peche@digitalium.io',
            role: 'admin',
            department: 'Cabinet Ministériel',
            initials: 'MP',
            joinedAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 15 * 60 * 1000,
            status: 'active',
        },
        {
            id: 'dgpa',
            name: 'Directeur Général Pêche (DGPA)',
            email: 'dgpa@digitalium.io',
            role: 'manager',
            department: 'Direction Générale Pêche',
            initials: 'DP',
            joinedAt: Date.now() - 300 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 3 * 60 * 60 * 1000,
            status: 'active',
        },
        {
            id: 'inspecteur',
            name: 'Inspecteur Pêche',
            email: 'inspecteur@digitalium.io',
            role: 'member',
            department: 'Inspection',
            initials: 'IP',
            joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
            status: 'active',
        },
        {
            id: 'anpa',
            name: 'Agent ANPA',
            email: 'anpa@digitalium.io',
            role: 'member',
            department: 'ANPA',
            initials: 'AN',
            joinedAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
            status: 'active',
        },
    ],
    stats: {
        documents: { value: 3247, change: 18.7 },
        archives: { value: 1856, change: 12.4 },
        signatures: { value: 567, change: 25.8 },
        users: { value: 4, change: 0 },
    },
    topDocuments: [
        { name: 'Permis Pêche Artisanale #2026-156', views: 412, category: 'permis' },
        { name: 'Licence Industrielle SINO-GA', views: 356, category: 'licence' },
        { name: "Rapport Inspection Zone 3", views: 287, category: 'inspection' },
        { name: 'Autorisation Exportation Thon', views: 234, category: 'autorisation' },
        { name: 'Quota Annuel 2026', views: 198, category: 'quota' },
    ],
    storageUsed: 8.2,
    storageTotalGB: 100,
    planName: 'Institutionnel',
    planPrice: 0,
    isInstitutional: true,
};

// Generic fallback
const GENERIC_CONFIG: OrganizationConfig = {
    type: 'generic',
    name: 'Entreprise Demo SARL',
    shortName: 'Demo',
    address: '123 Boulevard Triomphal',
    city: 'Libreville',
    country: 'Gabon',
    nif: 'GA12345678',
    apiPrefix: 'dgm',
    primaryColor: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    members: [],
    stats: {
        documents: { value: 1247, change: 12.5 },
        archives: { value: 856, change: 8.2 },
        signatures: { value: 324, change: -3.1 },
        users: { value: 18, change: 22.0 },
    },
    topDocuments: [
        { name: 'Contrat Fournisseur ABC', views: 234, category: 'juridique' },
        { name: 'Facture Q4 2025', views: 189, category: 'fiscal' },
        { name: 'Bulletin Décembre', views: 156, category: 'social' },
        { name: 'Statuts Société', views: 142, category: 'juridique' },
        { name: 'Devis Client XYZ', views: 98, category: 'client' },
    ],
    storageUsed: 2.4,
    storageTotalGB: 10,
    planName: 'Pro',
    planPrice: 75000,
    isInstitutional: false,
};

export function useOrganizationContext(): OrganizationConfig {
    const { user } = useAuth();
    const email = user?.email?.toLowerCase() || '';

    // Detect ASCOMA environment
    if (email.endsWith('@ascoma.ga')) {
        return ASCOMA_CONFIG;
    }

    // Detect Ministère de la Pêche environment
    const pecheEmails = [
        'ministre-peche@digitalium.io',
        'dgpa@digitalium.io',
        'inspecteur@digitalium.io',
        'anpa@digitalium.io',
        'admin-peche@digitalium.io',
    ];
    if (pecheEmails.includes(email)) {
        return PECHE_CONFIG;
    }

    // Default to generic
    return GENERIC_CONFIG;
}

export type { OrganizationConfig, OrganizationMember };
