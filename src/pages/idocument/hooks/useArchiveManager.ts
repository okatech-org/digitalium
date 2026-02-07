/**
 * useArchiveManager Hook
 * Real Firebase-backed document management
 * New hook that uses archiveService for persistence
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/FirebaseAuthContext';
import * as archiveService from '@/lib/archiveService';
import type {
    ArchiveFolder,
    ArchiveDocument,
    DocumentType,
    FolderLevel,
    UploadOptions,
} from '@/lib/archiveService';
import { CategoryId } from '../components/CategoryTabs';

export type NavigationLevel = 'classeurs' | 'dossiers' | 'fichiers' | 'details';
export type SortType = 'date_desc' | 'date_asc' | 'name' | 'type';

// Map document types to UI categories
const TYPE_TO_CATEGORY: Record<DocumentType, CategoryId> = {
    contract: 'contrats',
    invoice: 'factures',
    quote: 'devis',
    report: 'rapports',
    project: 'projets',
    hr: 'all',
    legal: 'all',
    fiscal: 'all',
    other: 'all',
};

export function useArchiveManager() {
    const { toast } = useToast();
    const { user } = useAuth();
    const currentUserId = user?.uid || null;

    // Data State
    const [folders, setFolders] = useState<ArchiveFolder[]>([]);
    const [documents, setDocuments] = useState<ArchiveDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Navigation State
    const [selectedClasseur, setSelectedClasseur] = useState<ArchiveFolder | null>(null);
    const [selectedDossier, setSelectedDossier] = useState<ArchiveFolder | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<ArchiveDocument | null>(null);

    // Filter/Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('date_desc');
    const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

    // Storage stats
    const [storageStats, setStorageStats] = useState({
        usedBytes: 0,
        documentCount: 0,
        folderCount: 0,
    });

    // Navigation level
    const navigationLevel = useMemo<NavigationLevel>(() => {
        if (selectedDocument) return 'details';
        if (selectedDossier) return 'fichiers';
        if (selectedClasseur) return 'dossiers';
        return 'classeurs';
    }, [selectedClasseur, selectedDossier, selectedDocument]);

    // ===================================
    // Data Loading
    // ===================================

    const loadFolders = useCallback(async (parentId?: string) => {
        try {
            const data = await archiveService.getFolders(parentId);
            return data;
        } catch (error) {
            console.error('Error loading folders:', error);
            return [];
        }
    }, []);

    const loadDocuments = useCallback(async (folderId?: string) => {
        try {
            const data = await archiveService.getDocuments(folderId);
            return data;
        } catch (error) {
            console.error('Error loading documents:', error);
            return [];
        }
    }, []);

    const loadStorageStats = useCallback(async () => {
        try {
            const stats = await archiveService.getStorageUsage();
            setStorageStats({
                usedBytes: stats.usedBytes,
                documentCount: stats.documentCount,
                folderCount: stats.folderCount,
            });
        } catch (error) {
            console.error('Error loading storage stats:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        const initialize = async () => {
            if (!currentUserId) {
                setFolders([]);
                setDocuments([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const [loadedFolders, loadedDocs] = await Promise.all([
                    loadFolders(),
                    loadDocuments(),
                ]);
                setFolders(loadedFolders);
                setDocuments(loadedDocs);
                await loadStorageStats();
            } catch (error) {
                console.error('Error initializing archive:', error);
                toast({
                    title: 'Erreur de chargement',
                    description: 'Impossible de charger vos documents.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        initialize();
    }, [currentUserId, loadFolders, loadDocuments, loadStorageStats, toast]);

    // Load content when navigation changes
    useEffect(() => {
        const loadCurrentLevel = async () => {
            if (!currentUserId) return;

            if (selectedDossier) {
                // Load documents in dossier
                const docs = await loadDocuments(selectedDossier.id);
                setDocuments(docs);
            } else if (selectedClasseur) {
                // Load dossiers in classeur
                const subFolders = await loadFolders(selectedClasseur.id);
                setFolders(subFolders);
            } else {
                // Load root classeurs
                const rootFolders = await loadFolders();
                setFolders(rootFolders);
            }
        };

        loadCurrentLevel();
    }, [selectedClasseur, selectedDossier, currentUserId, loadFolders, loadDocuments]);

    // ===================================
    // Computed Properties
    // ===================================

    // Get classeurs (level = classeur)
    const classeurs = useMemo(() => {
        return folders.filter(f => f.level === 'classeur' && !f.parent_id);
    }, [folders]);

    // Get dossiers in current classeur
    const dossiers = useMemo(() => {
        if (!selectedClasseur) return [];
        return folders.filter(f => f.parent_id === selectedClasseur.id);
    }, [folders, selectedClasseur]);

    // Get fichiers in current dossier
    const fichiers = useMemo(() => {
        if (!selectedDossier) return [];
        return documents.filter(d => d.folder_id === selectedDossier.id);
    }, [documents, selectedDossier]);

    // Trash (soft deleted documents)
    const trashDocuments = useMemo(() => {
        return documents.filter(d => d.deleted_at);
    }, [documents]);

    // Category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<CategoryId, number> = {
            all: documents.filter(d => !d.deleted_at).length,
            contrats: 0,
            factures: 0,
            devis: 0,
            rapports: 0,
            projets: 0,
            archives: 0,
            trash: trashDocuments.length,
        };

        documents.filter(d => !d.deleted_at).forEach(doc => {
            const category = TYPE_TO_CATEGORY[doc.document_type];
            if (category && category !== 'all') {
                counts[category]++;
            }
        });

        // Count archived status
        counts.archives = documents.filter(d => d.status === 'archived' && !d.deleted_at).length;

        return counts;
    }, [documents, trashDocuments]);

    // Filtered documents by category and search
    const filteredDocuments = useMemo(() => {
        let result = documents.filter(d => !d.deleted_at);

        // Filter by category
        if (activeCategory !== 'all') {
            if (activeCategory === 'trash') {
                result = trashDocuments;
            } else if (activeCategory === 'archives') {
                result = result.filter(d => d.status === 'archived');
            } else {
                const targetTypes = Object.entries(TYPE_TO_CATEGORY)
                    .filter(([, cat]) => cat === activeCategory)
                    .map(([type]) => type as DocumentType);
                result = result.filter(d => targetTypes.includes(d.document_type));
            }
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.title.toLowerCase().includes(query) ||
                d.description?.toLowerCase().includes(query) ||
                d.reference?.toLowerCase().includes(query) ||
                d.tags.some(t => t.toLowerCase().includes(query))
            );
        }

        // Sort
        switch (sortBy) {
            case 'date_desc':
                result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'date_asc':
                result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                break;
            case 'name':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'type':
                result.sort((a, b) => a.document_type.localeCompare(b.document_type));
                break;
        }

        return result;
    }, [documents, activeCategory, searchQuery, sortBy, trashDocuments]);

    // Stats
    const stats = useMemo(() => ({
        totalClasseurs: classeurs.length,
        totalDossiers: dossiers.length,
        totalDocuments: documents.filter(d => !d.deleted_at).length,
        totalAttachments: 0, // Not used in new structure
        byType: Object.fromEntries(
            (['contract', 'invoice', 'quote', 'report', 'project'] as DocumentType[]).map(type => [
                type,
                documents.filter(d => d.document_type === type && !d.deleted_at).length
            ])
        ) as Record<string, number>,
        brouillons: documents.filter(d => d.status === 'draft' && !d.deleted_at).length,
        trashCount: trashDocuments.length,
        storageUsed: storageStats.usedBytes,
    }), [classeurs, dossiers, documents, trashDocuments, storageStats]);

    // ===================================
    // Navigation Actions
    // ===================================

    const handleSelectClasseur = useCallback((folder: ArchiveFolder) => {
        setSelectedClasseur(folder);
        setSelectedDossier(null);
        setSelectedDocument(null);
        setSearchQuery('');
    }, []);

    const handleSelectDossier = useCallback((folder: ArchiveFolder) => {
        setSelectedDossier(folder);
        setSelectedDocument(null);
        setSearchQuery('');
    }, []);

    const handleSelectDocument = useCallback((doc: ArchiveDocument) => {
        setSelectedDocument(doc);
    }, []);

    const handleNavigateToClasseurs = useCallback(() => {
        setSelectedClasseur(null);
        setSelectedDossier(null);
        setSelectedDocument(null);
        setSearchQuery('');
    }, []);

    const handleNavigateToDossiers = useCallback(() => {
        setSelectedDossier(null);
        setSelectedDocument(null);
        setSearchQuery('');
    }, []);

    const handleNavigateToFichiers = useCallback(() => {
        setSelectedDocument(null);
    }, []);

    // ===================================
    // CRUD Actions - Folders
    // ===================================

    const handleCreateClasseur = useCallback(async (data: {
        name: string;
        description?: string;
        icon?: string;
        color?: string;
    }) => {
        try {
            const folder = await archiveService.createFolder({
                ...data,
                level: 'classeur',
            });

            setFolders(prev => [...prev, folder]);
            await loadStorageStats();

            toast({
                title: "📚 Classeur créé",
                description: `${folder.name} a été créé avec succès`,
            });

            return folder;
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Échec de création",
                variant: "destructive",
            });
            throw error;
        }
    }, [toast, loadStorageStats]);

    const handleCreateDossier = useCallback(async (classeurId: string, data: {
        name: string;
        description?: string;
        icon?: string;
        color?: string;
    }) => {
        try {
            const folder = await archiveService.createFolder({
                ...data,
                parentId: classeurId,
                level: 'dossier',
            });

            setFolders(prev => [...prev, folder]);
            await loadStorageStats();

            toast({
                title: "📁 Dossier créé",
                description: `${folder.name} ajouté dans le classeur`,
            });

            return folder;
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Échec de création",
                variant: "destructive",
            });
            throw error;
        }
    }, [toast, loadStorageStats]);

    // ===================================
    // CRUD Actions - Documents
    // ===================================

    const handleUploadDocument = useCallback(async (
        file: File,
        options?: UploadOptions
    ) => {
        try {
            const folderId = options?.folderId || selectedDossier?.id;
            const doc = await archiveService.uploadDocument(file, {
                ...options,
                folderId,
            });

            setDocuments(prev => [doc, ...prev]);
            await loadStorageStats();

            toast({
                title: "📄 Document importé",
                description: `${doc.title} a été ajouté`,
            });

            return doc;
        } catch (error) {
            toast({
                title: "Erreur d'import",
                description: error instanceof Error ? error.message : "Échec de l'import",
                variant: "destructive",
            });
            throw error;
        }
    }, [selectedDossier, toast, loadStorageStats]);

    const handleDeleteDocument = useCallback(async (docId: string) => {
        try {
            await archiveService.deleteDocument(docId, false);

            setDocuments(prev => prev.map(d =>
                d.id === docId ? { ...d, deleted_at: new Date().toISOString() } : d
            ));

            if (selectedDocument?.id === docId) {
                setSelectedDocument(null);
            }

            toast({
                title: "🗑️ Document déplacé vers la corbeille",
                description: "Vous pourrez le restaurer depuis la corbeille.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Échec de suppression",
                variant: "destructive",
            });
        }
    }, [selectedDocument, toast]);

    const handleRestoreDocument = useCallback(async (docId: string) => {
        try {
            const doc = await archiveService.restoreDocument(docId);

            setDocuments(prev => prev.map(d =>
                d.id === docId ? { ...d, deleted_at: undefined } : d
            ));

            toast({
                title: "♻️ Document restauré",
                description: `${doc.title} a été restauré.`,
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Échec de restauration",
                variant: "destructive",
            });
        }
    }, [toast]);

    const handlePermanentDeleteDocument = useCallback(async (docId: string) => {
        try {
            await archiveService.deleteDocument(docId, true);

            setDocuments(prev => prev.filter(d => d.id !== docId));
            await loadStorageStats();

            if (selectedDocument?.id === docId) {
                setSelectedDocument(null);
            }

            toast({
                title: "🚫 Document supprimé définitivement",
                description: "Cette action est irréversible.",
                variant: "destructive",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Échec de suppression",
                variant: "destructive",
            });
        }
    }, [selectedDocument, toast, loadStorageStats]);

    // Bulk actions
    const performBulkAction = useCallback(async (
        action: 'delete' | 'restore' | 'permanent_delete',
        docIds: string[]
    ) => {
        if (docIds.length === 0) return;

        for (const id of docIds) {
            try {
                if (action === 'delete') {
                    await archiveService.deleteDocument(id, false);
                } else if (action === 'restore') {
                    await archiveService.restoreDocument(id);
                } else if (action === 'permanent_delete') {
                    await archiveService.deleteDocument(id, true);
                }
            } catch (error) {
                console.error(`Failed to ${action} document ${id}:`, error);
            }
        }

        // Refresh documents
        const docs = await loadDocuments(selectedDossier?.id);
        setDocuments(docs);
        await loadStorageStats();

        toast({
            title: action === 'delete' ? "Corbeille" :
                action === 'restore' ? "Restauré" : "Supprimé",
            description: `${docIds.length} document(s) traités.`,
        });
    }, [selectedDossier, loadDocuments, loadStorageStats, toast]);

    // Search
    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchQuery('');
            return;
        }

        try {
            const results = await archiveService.searchDocuments(query);
            setDocuments(results);
            setSearchQuery(query);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }, []);

    return {
        // Data State
        folders,
        documents,
        isLoading,

        // Derived Data
        classeurs,
        dossiers,
        fichiers,
        trashDocuments,

        // Navigation State
        selectedClasseur,
        selectedDossier,
        selectedDocument,
        navigationLevel,

        // Filter/Sort State
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        activeCategory,
        setActiveCategory,

        // Computed
        stats,
        categoryCounts,
        filteredDocuments,
        storageStats,

        // Navigation Actions
        handleSelectClasseur,
        handleSelectDossier,
        handleSelectDocument,
        handleNavigateToClasseurs,
        handleNavigateToDossiers,
        handleNavigateToFichiers,

        // CRUD Actions
        handleCreateClasseur,
        handleCreateDossier,
        handleUploadDocument,
        handleDeleteDocument,
        handleRestoreDocument,
        handlePermanentDeleteDocument,
        performBulkAction,
        handleSearch,

        // Refresh
        refresh: async () => {
            const [f, d] = await Promise.all([loadFolders(), loadDocuments()]);
            setFolders(f);
            setDocuments(d);
            await loadStorageStats();
        },
    };
}
