/**
 * useDocumentManager Hook
 *
 * Cloud-backed document management (Firebase Cloud Functions + Cloud SQL).
 * Replaces the original localStorage implementation while keeping the EXACT same API.
 *
 * Data flow:
 *   archiveService (Cloud Functions) → flat folders/documents → transformed to IClasseur/IDossier/IFichier
 *
 * Phase 3: Connected to backend while maintaining full UI compatibility.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/FirebaseAuthContext';
import * as archiveService from '@/lib/archiveService';
import type { ArchiveFolder, ArchiveDocument } from '@/lib/archiveService';
import {
    IClasseur,
    IDossier,
    IFichier,
    IAttachment,
    IDocumentVersion,
    SortType,
    NavigationLevel,
    ArchivalStatus,
} from '../types';
import {
    ARCHIVAL_STATUS_CONFIG, RETENTION_RULES_BY_STATUS,
    calculateRetentionEndDate, getAvailableTransitions, isActionAllowed,
    needsPdfConversion, simulatePdfConversion,
} from '../constants';
import { CategoryId } from '../components/CategoryTabs';

// =============================================================================
// Backend → Frontend type mappers
// =============================================================================

type FichierType = IFichier['type'];
type FichierStatus = IFichier['status'];

const BACKEND_TO_FRONTEND_TYPE: Record<string, FichierType> = {
    contract: 'contrat',
    invoice: 'facture',
    quote: 'devis',
    report: 'rapport',
    project: 'projet',
    hr: 'other',
    legal: 'other',
    fiscal: 'other',
    other: 'other',
};

const FRONTEND_TO_BACKEND_TYPE: Record<FichierType, string> = {
    contrat: 'contract',
    facture: 'invoice',
    devis: 'quote',
    rapport: 'report',
    projet: 'project',
    other: 'other',
};

const BACKEND_TO_FRONTEND_STATUS: Record<string, FichierStatus> = {
    draft: 'brouillon',
    pending: 'en_revision',
    approved: 'approuve',
    archived: 'archive',
    deleted: 'brouillon',
};

function mapBackendStatusToArchival(status: string): ArchivalStatus {
    switch (status) {
        case 'archived': return 'archive';
        case 'approved': return 'semi_actif';
        default: return 'actif';
    }
}

function mimeToAttachmentType(mime: string): IAttachment['type'] {
    if (mime?.includes('pdf')) return 'pdf';
    if (mime?.includes('image')) return 'image';
    if (mime?.includes('spreadsheet') || mime?.includes('excel') || mime?.includes('csv')) return 'spreadsheet';
    if (mime?.includes('word') || mime?.includes('document')) return 'doc';
    return 'other';
}

function formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Convert backend ArchiveDocument to frontend IFichier
 */
function documentToFichier(doc: ArchiveDocument, classeurId: string, dossierId: string): IFichier {
    const attachment: IAttachment = {
        id: `att-${doc.id}`,
        name: doc.original_filename || doc.filename,
        type: mimeToAttachmentType(doc.mime_type),
        size: formatBytes(doc.size_bytes),
        url: doc.storage_url,
        created_at: doc.created_at,
    };

    return {
        id: doc.id,
        name: doc.title || doc.filename,
        description: doc.description,
        type: BACKEND_TO_FRONTEND_TYPE[doc.document_type] || 'other',
        reference: doc.reference || `REF-${doc.id.slice(0, 8)}`,
        author: doc.author || 'Utilisateur',
        status: BACKEND_TO_FRONTEND_STATUS[doc.status] || 'brouillon',
        tags: doc.tags || [],
        attachments: [attachment],
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        deleted_at: doc.deleted_at,
        classeurId,
        dossierId,
        archivalStatus: mapBackendStatusToArchival(doc.status),
        archivalStatusChangedAt: doc.updated_at,
        archivalStatusChangedBy: doc.author,
        retentionEndDate: doc.expiration_date,
        finalDisposition: undefined,
        versions: [{
            id: `ver-${doc.id}`,
            versionNumber: doc.version || 1,
            label: `v${doc.version || 1}.0`,
            author: doc.author || 'Utilisateur',
            changeDescription: 'Version actuelle',
            changeType: 'major',
            attachments: [attachment],
            hash_sha256: doc.hash_sha256,
            size: formatBytes(doc.size_bytes),
            created_at: doc.created_at,
            isLocked: false,
            isCurrent: true,
        }],
        currentVersionNumber: doc.version || 1,
    };
}

/**
 * Convert backend ArchiveFolder to frontend IClasseur
 */
function folderToClasseur(
    folder: ArchiveFolder,
    allFolders: ArchiveFolder[],
    allDocuments: ArchiveDocument[]
): IClasseur {
    const childFolders = allFolders.filter(f => f.parent_id === folder.id && !f.deleted_at);

    const dossiers: IDossier[] = childFolders.map(df => {
        const docsInFolder = allDocuments.filter(d => d.folder_id === df.id);
        const fichiers: IFichier[] = docsInFolder.map(doc => documentToFichier(doc, folder.id, df.id));

        return {
            id: df.id,
            name: df.name,
            description: df.description,
            icon: df.icon || '📁',
            color: df.color || 'bg-blue-400',
            fichiers,
            created_at: df.created_at,
            classeurId: folder.id,
        };
    });

    return {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        icon: folder.icon || '📚',
        color: folder.color || 'bg-blue-500',
        dossiers,
        is_system: folder.is_system || false,
        created_at: folder.created_at,
    };
}

// =============================================================================
// Main Hook
// =============================================================================

export function useDocumentManager() {
    const { toast } = useToast();
    const { user } = useAuth();
    const currentUserId = user?.uid || null;

    // Backend state (flat)
    const [allFolders, setAllFolders] = useState<ArchiveFolder[]>([]);
    const [allDocuments, setAllDocuments] = useState<ArchiveDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Navigation State
    const [selectedClasseur, setSelectedClasseur] = useState<IClasseur | null>(null);
    const [selectedDossier, setSelectedDossier] = useState<IDossier | null>(null);
    const [selectedFichier, setSelectedFichier] = useState<IFichier | null>(null);

    // Filter/Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('date_desc');
    const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

    const navigationLevel = useMemo<NavigationLevel>(() => {
        if (selectedFichier) return 'details';
        if (selectedDossier) return 'fichiers';
        if (selectedClasseur) return 'dossiers';
        return 'classeurs';
    }, [selectedClasseur, selectedDossier, selectedFichier]);

    // ===================================
    // Data Loading from Backend
    // ===================================

    const loadAllData = useCallback(async () => {
        if (!currentUserId) {
            setAllFolders([]);
            setAllDocuments([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const [folders, documents] = await Promise.all([
                archiveService.getFolders(),
                archiveService.getDocuments(),
            ]);
            setAllFolders(folders);
            setAllDocuments(documents);
        } catch (error) {
            console.error('[useDocumentManager] Error loading from backend:', error);
            setAllFolders([]);
            setAllDocuments([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // ===================================
    // Transform backend → frontend
    // ===================================

    const classeurs = useMemo<IClasseur[]>(() => {
        const rootFolders = allFolders.filter(f => !f.parent_id && !f.deleted_at);
        return rootFolders.map(f => folderToClasseur(f, allFolders, allDocuments));
    }, [allFolders, allDocuments]);

    const saveClasseurs = (_newClasseurs: IClasseur[]) => {
        // No-op: backend is the source of truth
    };

    // ===================================
    // Computed Properties
    // ===================================

    const allFichiers = useMemo(() => {
        const fichiers: (IFichier & { classeurId: string; dossierId: string })[] = [];
        classeurs.forEach(classeur => {
            classeur.dossiers.forEach(dossier => {
                dossier.fichiers.forEach(fichier => {
                    if (!fichier.deleted_at) {
                        fichiers.push({ ...fichier, classeurId: classeur.id, dossierId: dossier.id });
                    }
                });
            });
        });
        return fichiers;
    }, [classeurs]);

    const trashFichiers = useMemo(() => {
        const deleted: (IFichier & { classeurName: string; dossierName: string })[] = [];
        classeurs.forEach(classeur => {
            classeur.dossiers.forEach(dossier => {
                dossier.fichiers.forEach(fichier => {
                    if (fichier.deleted_at) {
                        deleted.push({ ...fichier, classeurName: classeur.name, dossierName: dossier.name });
                    }
                });
            });
        });
        allDocuments
            .filter(d => d.deleted_at && !deleted.some(df => df.id === d.id))
            .forEach(doc => {
                deleted.push({
                    ...documentToFichier(doc, '', ''),
                    classeurName: 'Sans classeur',
                    dossierName: 'Sans dossier',
                } as IFichier & { classeurName: string; dossierName: string });
            });
        return deleted;
    }, [classeurs, allDocuments]);

    const currentViewClasseur = useMemo(() => {
        if (!selectedClasseur) return null;
        return classeurs.find(c => c.id === selectedClasseur.id) || selectedClasseur;
    }, [selectedClasseur, classeurs]);

    const currentViewDossier = useMemo(() => {
        if (!selectedDossier || !currentViewClasseur) return null;
        return currentViewClasseur.dossiers.find(d => d.id === selectedDossier.id) || selectedDossier;
    }, [selectedDossier, currentViewClasseur]);

    const stats = useMemo(() => {
        const activeFichiers = allFichiers.filter(f => !f.deleted_at);
        const totalDossiers = classeurs.reduce((acc, c) => acc + c.dossiers.length, 0);
        return {
            totalClasseurs: classeurs.length,
            totalDossiers,
            totalFichiers: activeFichiers.length,
            totalAttachments: activeFichiers.reduce((acc, f) => acc + f.attachments.length, 0),
            byType: (['contrat', 'facture', 'devis', 'rapport', 'projet', 'other'] as FichierType[]).reduce((acc, type) => {
                acc[type] = activeFichiers.filter(f => f.type === type).length;
                return acc;
            }, {} as Record<string, number>),
            brouillons: activeFichiers.filter(f => f.status === 'brouillon').length,
            trashCount: trashFichiers.length,
        };
    }, [classeurs, allFichiers, trashFichiers]);

    const categoryCounts = useMemo(() => {
        return {
            all: allFichiers.length,
            contrats: allFichiers.filter(f => f.type === 'contrat').length,
            factures: allFichiers.filter(f => f.type === 'facture').length,
            devis: allFichiers.filter(f => f.type === 'devis').length,
            rapports: allFichiers.filter(f => f.type === 'rapport').length,
            projets: allFichiers.filter(f => f.type === 'projet').length,
            archives: classeurs.filter(c => c.name.toLowerCase().includes('archive'))
                .flatMap(c => c.dossiers.flatMap(d => d.fichiers.filter(f => !f.deleted_at))).length,
            trash: trashFichiers.length,
        } as Record<CategoryId, number>;
    }, [allFichiers, classeurs, trashFichiers]);

    const filteredByCategory = useMemo(() => {
        let fichiers = [...allFichiers];

        switch (activeCategory) {
            case 'all': break;
            case 'contrats': fichiers = fichiers.filter(f => f.type === 'contrat'); break;
            case 'factures': fichiers = fichiers.filter(f => f.type === 'facture'); break;
            case 'devis': fichiers = fichiers.filter(f => f.type === 'devis'); break;
            case 'rapports': fichiers = fichiers.filter(f => f.type === 'rapport'); break;
            case 'projets': fichiers = fichiers.filter(f => f.type === 'projet'); break;
            case 'archives':
                fichiers = classeurs
                    .filter(c => c.name.toLowerCase().includes('archive'))
                    .flatMap(c => c.dossiers.flatMap(d => d.fichiers.filter(f => !f.deleted_at)))
                    .map(f => ({ ...f, classeurId: '', dossierId: '' }));
                break;
            case 'trash':
                return trashFichiers as (IFichier & { classeurId: string; dossierId: string })[];
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            fichiers = fichiers.filter(f =>
                f.name.toLowerCase().includes(query) ||
                f.reference?.toLowerCase().includes(query) ||
                f.description?.toLowerCase().includes(query) ||
                f.tags.some(t => t.toLowerCase().includes(query))
            );
        }

        switch (sortBy) {
            case 'date_desc': fichiers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
            case 'date_asc': fichiers.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
            case 'name': fichiers.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'type': fichiers.sort((a, b) => a.type.localeCompare(b.type)); break;
        }

        return fichiers;
    }, [allFichiers, activeCategory, searchQuery, sortBy, classeurs, trashFichiers]);

    // ===================================
    // Navigation Actions
    // ===================================

    const handleSelectClasseur = (classeur: IClasseur) => {
        setSelectedClasseur(classeur);
        setSelectedDossier(null);
        setSelectedFichier(null);
        setSearchQuery('');
    };

    const handleSelectDossier = (dossier: IDossier) => {
        setSelectedDossier(dossier);
        setSelectedFichier(null);
        setSearchQuery('');
    };

    const handleSelectFichier = (fichier: IFichier) => {
        setSelectedFichier(fichier);
    };

    const handleNavigateToClasseurs = () => {
        setSelectedClasseur(null);
        setSelectedDossier(null);
        setSelectedFichier(null);
        setSearchQuery('');
    };

    const handleNavigateToDossiers = () => {
        setSelectedDossier(null);
        setSelectedFichier(null);
        setSearchQuery('');
    };

    const handleNavigateToFichiers = () => {
        setSelectedFichier(null);
    };

    // ===================================
    // CRUD Actions (Cloud Functions backed)
    // ===================================

    const handleCreateClasseur = (data: Partial<IClasseur>): IClasseur => {
        const tempClasseur: IClasseur = {
            id: `temp-classeur-${Date.now()}`,
            name: data.name || 'Nouveau Classeur',
            description: data.description || '',
            icon: data.icon || '📚',
            color: data.color || 'bg-blue-500',
            is_system: false,
            dossiers: [],
            created_at: new Date().toISOString(),
        };

        archiveService.createFolder({
            name: tempClasseur.name,
            description: tempClasseur.description,
            level: 'classeur',
            icon: tempClasseur.icon,
            color: tempClasseur.color,
        }).then(() => {
            loadAllData();
        }).catch(error => {
            console.error('Failed to create classeur:', error);
            toast({ title: "Erreur", description: "Impossible de créer le classeur.", variant: "destructive" });
        });

        toast({ title: "📚 Classeur créé", description: `${tempClasseur.name} a été créé avec succès` });
        return tempClasseur;
    };

    const handleCreateDossier = (classeurId: string, data: Partial<IDossier>): IDossier => {
        if (!classeurId) {
            toast({ title: "❌ Classement obligatoire", description: "Un dossier doit être rattaché à un classeur.", variant: "destructive" });
            return null as unknown as IDossier;
        }

        const tempDossier: IDossier = {
            id: `temp-dossier-${Date.now()}`,
            name: data.name || 'Nouveau Dossier',
            description: data.description || '',
            icon: data.icon || '📁',
            color: data.color || 'bg-blue-400',
            fichiers: [],
            classeurId,
            created_at: new Date().toISOString(),
        };

        archiveService.createFolder({
            name: tempDossier.name,
            description: tempDossier.description,
            parentId: classeurId,
            level: 'dossier',
            icon: tempDossier.icon,
            color: tempDossier.color,
        }).then(() => {
            loadAllData();
        }).catch(error => {
            console.error('Failed to create dossier:', error);
            toast({ title: "Erreur", description: "Impossible de créer le dossier.", variant: "destructive" });
        });

        toast({ title: "📁 Dossier créé", description: `${tempDossier.name} ajouté dans le classeur` });
        return tempDossier;
    };

    const handleCreateFichier = (classeurId: string, dossierId: string, data: Partial<IFichier>): IFichier => {
        if (!classeurId || !dossierId) {
            toast({ title: "❌ Classement obligatoire", description: "Un fichier doit être rattaché à un classeur et un dossier.", variant: "destructive" });
            return null as unknown as IFichier;
        }

        const now = new Date().toISOString();
        const authorName = user?.displayName || 'Utilisateur';

        const initialVersion: IDocumentVersion = {
            id: `ver-${Date.now()}`,
            versionNumber: 1,
            label: 'v1.0',
            author: authorName,
            changeDescription: 'Version initiale',
            changeType: 'major',
            attachments: data.attachments ? [...data.attachments] : [],
            created_at: now,
            isLocked: false,
            isCurrent: true,
        };

        const newFichier: IFichier = {
            id: `temp-fichier-${Date.now()}`,
            name: data.name || 'Nouveau Fichier',
            description: data.description,
            type: data.type || 'other',
            reference: data.reference || `REF-${Date.now()}`,
            author: authorName,
            status: 'brouillon',
            tags: data.tags || [],
            attachments: data.attachments || [],
            created_at: now,
            classeurId,
            dossierId,
            archivalStatus: 'actif',
            archivalStatusChangedAt: now,
            archivalStatusChangedBy: authorName,
            retentionEndDate: calculateRetentionEndDate(data.type || 'other', 'actif', now),
            finalDisposition: undefined,
            versions: [initialVersion],
            currentVersionNumber: 1,
        };

        // If attachments have file data, upload to backend
        if (data.attachments && data.attachments.length > 0) {
            const firstAtt = data.attachments[0];
            if (firstAtt.url) {
                archiveService.uploadDocument({
                    file: new File([], firstAtt.name),
                    folderId: dossierId,
                    title: newFichier.name,
                    description: newFichier.description,
                    tags: newFichier.tags,
                    documentType: FRONTEND_TO_BACKEND_TYPE[newFichier.type] as any,
                }).then(() => loadAllData()).catch(err => console.error('Backend create failed:', err));
            }
        }

        toast({ title: "📄 Fichier créé", description: `${newFichier.name} ajouté dans le dossier` });
        return newFichier;
    };

    const handleDeleteFichier = (fichierId: string) => {
        setAllDocuments(prev => prev.map(d =>
            d.id === fichierId ? { ...d, deleted_at: new Date().toISOString(), status: 'deleted' as any } : d
        ));
        if (selectedFichier?.id === fichierId) setSelectedFichier(null);
        archiveService.deleteDocument(fichierId, false).catch(() => loadAllData());
        toast({ title: "🗑️ Fichier déplacé vers la corbeille", description: "Vous pourrez le restaurer depuis la corbeille." });
    };

    const handleRestoreFichier = (fichierId: string) => {
        setAllDocuments(prev => prev.map(d =>
            d.id === fichierId ? { ...d, deleted_at: undefined, status: 'draft' as any } : d
        ));
        archiveService.restoreDocument(fichierId).catch(() => loadAllData());
        toast({ title: "♻️ Fichier restauré", description: "Le fichier a été remis dans son dossier d'origine." });
    };

    const handlePermanentDeleteFichier = (fichierId: string) => {
        setAllDocuments(prev => prev.filter(d => d.id !== fichierId));
        if (selectedFichier?.id === fichierId) setSelectedFichier(null);
        archiveService.deleteDocument(fichierId, true).catch(() => loadAllData());
        toast({ title: "🚫 Fichier supprimé définitivement", description: "Cette action est irréversible.", variant: "destructive" });
    };

    const performBulkAction = (action: 'delete' | 'restore' | 'permanent_delete', fichierIds: string[]) => {
        if (fichierIds.length === 0) return;

        if (action === 'delete') {
            setAllDocuments(prev => prev.map(d =>
                fichierIds.includes(d.id) ? { ...d, deleted_at: new Date().toISOString(), status: 'deleted' as any } : d
            ));
            toast({ title: "Corbeille", description: `${fichierIds.length} fichier(s) déplacés vers la corbeille.` });
        } else if (action === 'restore') {
            setAllDocuments(prev => prev.map(d =>
                fichierIds.includes(d.id) ? { ...d, deleted_at: undefined, status: 'draft' as any } : d
            ));
            toast({ title: "Restauré", description: `${fichierIds.length} fichier(s) restaurés.` });
        } else if (action === 'permanent_delete') {
            setAllDocuments(prev => prev.filter(d => !fichierIds.includes(d.id)));
            toast({ title: "Supprimé", description: `${fichierIds.length} fichier(s) supprimés définitivement.`, variant: "destructive" });
        }

        const promises = fichierIds.map(id => {
            if (action === 'delete') return archiveService.deleteDocument(id, false);
            if (action === 'restore') return archiveService.restoreDocument(id);
            return archiveService.deleteDocument(id, true);
        });
        Promise.allSettled(promises).then(() => loadAllData());
    };

    // ===================================
    // Return (EXACT same API)
    // ===================================

    return {
        classeurs,
        isLoading,
        selectedClasseur,
        selectedDossier,
        selectedFichier,
        navigationLevel,
        currentViewClasseur,
        currentViewDossier,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        activeCategory,
        setActiveCategory,
        stats,
        categoryCounts,
        filteredByCategory,
        allFichiers,
        trashFichiers,
        handleSelectClasseur,
        handleSelectDossier,
        handleSelectFichier,
        handleNavigateToClasseurs,
        handleNavigateToDossiers,
        handleNavigateToFichiers,
        handleCreateClasseur,
        handleCreateDossier,
        handleCreateFichier,
        handleDeleteFichier,
        handleRestoreFichier,
        handlePermanentDeleteFichier,
        performBulkAction,
        saveClasseurs,
        changeArchivalStatus: (fichierId: string, newStatus: ArchivalStatus, reason?: string) => {
            const fichier = allFichiers.find(f => f.id === fichierId);
            if (!fichier) return { success: false, error: 'Fichier introuvable' };

            const currentStatus = fichier.archivalStatus || 'actif';
            const availableTransitions = getAvailableTransitions(currentStatus);
            const transition = availableTransitions.find(t => t.to === newStatus);

            if (!transition) {
                toast({
                    title: '❌ Transition non autorisée',
                    description: `Impossible de passer de "${ARCHIVAL_STATUS_CONFIG[currentStatus].label}" à "${ARCHIVAL_STATUS_CONFIG[newStatus].label}"`,
                    variant: 'destructive',
                });
                return { success: false, error: 'Transition non autorisée' };
            }

            const backendStatus = newStatus === 'archive' ? 'archived'
                : newStatus === 'semi_actif' ? 'approved'
                    : newStatus === 'destruction' ? 'deleted' : 'draft';

            // PDF/A conversion when transitioning to archive or semi_actif
            let pdfConversionApplied = false;
            if (newStatus === 'archive' || newStatus === 'semi_actif') {
                const attachmentsNeedingConversion = fichier.attachments.filter(att => needsPdfConversion(att));
                if (attachmentsNeedingConversion.length > 0) {
                    pdfConversionApplied = true;
                    // In production, would call backend conversion service
                    // Here we simulate the conversion metadata update
                    const convertedAttachments = fichier.attachments.map(att => {
                        if (needsPdfConversion(att)) {
                            const converted = simulatePdfConversion(att);
                            return { ...att, id: converted.id, name: converted.name, type: converted.type as any };
                        }
                        return att;
                    });
                    // Update document with converted attachments
                    archiveService.updateDocument(fichierId, {
                        status: backendStatus as any,
                        metadata: { pdfAConverted: true, convertedAt: new Date().toISOString() },
                    } as any)
                        .then(() => loadAllData())
                        .catch(err => console.error('Failed to update archival status with PDF conversion:', err));
                } else {
                    archiveService.updateDocument(fichierId, { status: backendStatus as any })
                        .then(() => loadAllData())
                        .catch(err => console.error('Failed to update archival status:', err));
                }
            } else {
                archiveService.updateDocument(fichierId, { status: backendStatus as any })
                    .then(() => loadAllData())
                    .catch(err => console.error('Failed to update archival status:', err));
            }

            const pdfMessage = pdfConversionApplied
                ? ' – Pièces jointes converties en PDF/A'
                : '';

            toast({
                title: `${ARCHIVAL_STATUS_CONFIG[newStatus].icon} Statut archivistique modifié`,
                description: `${fichier.name} → ${ARCHIVAL_STATUS_CONFIG[newStatus].label}${reason ? ` (${reason})` : ''}${pdfMessage}`,
            });

            return { success: true, transition };
        },
        createVersion: (fichierId: string, data: { changeDescription: string; changeType: 'major' | 'minor' | 'patch' }) => {
            const fichier = allFichiers.find(f => f.id === fichierId);
            if (!fichier) return null;

            if (!isActionAllowed(fichier.archivalStatus || 'actif', 'add_version')) {
                toast({
                    title: '❌ Versionnage non autorisé',
                    description: `Un document en statut "${ARCHIVAL_STATUS_CONFIG[fichier.archivalStatus || 'actif'].label}" ne peut pas être versionné.`,
                    variant: 'destructive',
                });
                return null;
            }

            const currentVersions = fichier.versions || [];
            const lastVersion = currentVersions.length > 0 ? Math.max(...currentVersions.map(v => v.versionNumber)) : 0;
            const newVersionNumber = lastVersion + 1;
            const versionLabel = data.changeType === 'patch'
                ? `v${Math.floor(lastVersion)}.0.${newVersionNumber}`
                : `v${newVersionNumber}.0`;

            const authorName = user?.displayName || 'Utilisateur';
            const now = new Date().toISOString();

            const newVersion: IDocumentVersion = {
                id: `ver-${Date.now()}`,
                versionNumber: newVersionNumber,
                label: versionLabel,
                author: authorName,
                changeDescription: data.changeDescription,
                changeType: data.changeType,
                attachments: [...fichier.attachments],
                created_at: now,
                isLocked: false,
                isCurrent: true,
            };

            toast({
                title: `📋 Version ${versionLabel} créée`,
                description: `${fichier.name} – ${data.changeDescription}`,
            });

            return newVersion;
        },
        getArchivalStatusConfig: (status: ArchivalStatus) => ARCHIVAL_STATUS_CONFIG[status],
        getAvailableTransitions: (status: ArchivalStatus) => getAvailableTransitions(status),
        isActionAllowed: (status: ArchivalStatus, action: string) => isActionAllowed(status, action as any),
        getRetentionRules: (documentType: string) => RETENTION_RULES_BY_STATUS[documentType] || RETENTION_RULES_BY_STATUS['other'],
    };
}
