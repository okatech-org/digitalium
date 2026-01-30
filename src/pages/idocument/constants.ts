
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
// MOCK DATA: REMOVED - Data now comes from database
// ========================================

export const MOCK_CLASSEURS: IClasseur[] = [];

// ========================================
// MOCK DATA: MINISTÈRE - REMOVED
// Data now comes from database
// ========================================

export const MOCK_CLASSEURS_MINISTERE_PECHE: IClasseur[] = [];

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
