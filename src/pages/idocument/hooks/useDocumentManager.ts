
import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/FirebaseAuthContext';
import {
    IClasseur,
    IDossier,
    IFichier,
    SortType,
    NavigationLevel
} from '../types';
import { MOCK_CLASSEURS, MOCK_CLASSEURS_MINISTERE_PECHE, DOCUMENT_TYPES } from '../constants';
import { CategoryId } from '../components/CategoryTabs';

// Helper to determine which mock data to use based on user email
const getDefaultClasseurs = (email: string | null | undefined): IClasseur[] => {
    if (!email) return MOCK_CLASSEURS;
    const lowerEmail = email.toLowerCase();
    // Ministry of Fisheries accounts
    if (lowerEmail.includes('peche.gouv.ga') ||
        lowerEmail.includes('peche@digitalium.io') ||
        lowerEmail.includes('ministere-peche@') ||
        lowerEmail.includes('mpm@digitalium') ||
        lowerEmail.includes('secretariat.peche@') ||
        lowerEmail.includes('daf.peche@') ||
        lowerEmail.includes('direction.peche@')) {
        return MOCK_CLASSEURS_MINISTERE_PECHE;
    }
    return MOCK_CLASSEURS;
};

// Key for local storage
const getStorageKey = (userId: string) => `idocument-classeurs-${userId}`;

export function useDocumentManager() {
    const { toast } = useToast();
    const { user } = useAuth();
    const currentUserId = user?.uid || null;

    // Data State
    const [classeurs, setClasseurs] = useState<IClasseur[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Navigation State (3 levels)
    const [selectedClasseur, setSelectedClasseur] = useState<IClasseur | null>(null);
    const [selectedDossier, setSelectedDossier] = useState<IDossier | null>(null);
    const [selectedFichier, setSelectedFichier] = useState<IFichier | null>(null);

    // Filter/Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('date_desc');

    // Category State (for horizontal tabs - filters across all levels)
    const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

    // Current navigation level
    const navigationLevel = useMemo<NavigationLevel>(() => {
        if (selectedFichier) return 'details';
        if (selectedDossier) return 'fichiers';
        if (selectedClasseur) return 'dossiers';
        return 'classeurs';
    }, [selectedClasseur, selectedDossier, selectedFichier]);

    // Initial Data Load
    useEffect(() => {
        const loadUserData = async () => {
            if (!currentUserId) {
                setClasseurs([]);
                setIsLoading(false);
                return;
            }

            try {
                const storageKey = getStorageKey(currentUserId);
                const saved = localStorage.getItem(storageKey);

                // Determine the correct mock data based on user email
                const userEmail = user?.email;
                const defaultData = getDefaultClasseurs(userEmail);

                // Check if user is a ministry user - they should always get fresh ministry data
                const isMinistryUser = userEmail?.toLowerCase().includes('peche.gouv.ga') ||
                    userEmail?.toLowerCase().includes('peche@digitalium.io') ||
                    userEmail?.toLowerCase().includes('ministere-peche@') ||
                    userEmail?.toLowerCase().includes('mpm@digitalium') ||
                    userEmail?.toLowerCase().includes('secretariat.peche@') ||
                    userEmail?.toLowerCase().includes('daf.peche@') ||
                    userEmail?.toLowerCase().includes('direction.peche@');

                // Check if cached data is ministry data (by looking for ministry classeur IDs)
                let cachedIsMinistryData = false;
                if (saved) {
                    try {
                        const parsedData = JSON.parse(saved);
                        cachedIsMinistryData = parsedData.some((c: IClasseur) => c.id.startsWith('mp-'));
                    } catch { /* ignore */ }
                }

                // Force refresh for ministry users if they don't have ministry data cached
                // or for non-ministry users if they have ministry data cached
                const needsRefresh = (isMinistryUser && !cachedIsMinistryData) ||
                    (!isMinistryUser && cachedIsMinistryData);

                if (saved && !needsRefresh) {
                    try {
                        setClasseurs(JSON.parse(saved));
                    } catch {
                        setClasseurs(defaultData);
                        localStorage.setItem(storageKey, JSON.stringify(defaultData));
                    }
                } else {
                    // Force set fresh data (for new users or when cache mismatch)
                    console.log('[useDocumentManager] Loading fresh data for', isMinistryUser ? 'ministry' : 'standard', 'user');
                    setClasseurs(defaultData);
                    localStorage.setItem(storageKey, JSON.stringify(defaultData));
                }
            } catch (error) {
                console.error('[useDocumentManager] Erreur de chargement:', error);
                const defaultData = getDefaultClasseurs(user?.email);
                setClasseurs(defaultData);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUserId) {
            loadUserData();
        }
    }, [currentUserId]);

    // Persistence Helper
    const saveClasseurs = (newClasseurs: IClasseur[]) => {
        setClasseurs(newClasseurs);
        if (currentUserId) {
            const key = getStorageKey(currentUserId);
            localStorage.setItem(key, JSON.stringify(newClasseurs));
        }
    };

    // ===================================
    // Computed Properties
    // ===================================

    // All fichiers across all classeurs/dossiers (flat list)
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

    // Trash folder (virtual)
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
        return deleted;
    }, [classeurs]);

    // Current view items based on navigation level
    const currentViewClasseur = useMemo(() => {
        if (!selectedClasseur) return null;
        return classeurs.find(c => c.id === selectedClasseur.id) || selectedClasseur;
    }, [selectedClasseur, classeurs]);

    const currentViewDossier = useMemo(() => {
        if (!selectedDossier || !currentViewClasseur) return null;
        return currentViewClasseur.dossiers.find(d => d.id === selectedDossier.id) || selectedDossier;
    }, [selectedDossier, currentViewClasseur]);

    // Statistics
    const stats = useMemo(() => {
        const activeFichiers = allFichiers.filter(f => !f.deleted_at);
        const totalDossiers = classeurs.reduce((acc, c) => acc + c.dossiers.length, 0);

        return {
            totalClasseurs: classeurs.length,
            totalDossiers,
            totalFichiers: activeFichiers.length,
            totalAttachments: activeFichiers.reduce((acc, f) => acc + f.attachments.length, 0),
            byType: Object.keys(DOCUMENT_TYPES).reduce((acc, type) => {
                acc[type] = activeFichiers.filter(f => f.type === type).length;
                return acc;
            }, {} as Record<string, number>),
            brouillons: activeFichiers.filter(f => f.status === 'brouillon').length,
            trashCount: trashFichiers.length,
        };
    }, [classeurs, allFichiers, trashFichiers]);

    // Category Counts (for horizontal tabs)
    const categoryCounts = useMemo(() => {
        const activeFichiers = allFichiers;

        return {
            all: activeFichiers.length,
            contrats: activeFichiers.filter(f => f.type === 'contrat').length,
            factures: activeFichiers.filter(f => f.type === 'facture').length,
            devis: activeFichiers.filter(f => f.type === 'devis').length,
            rapports: activeFichiers.filter(f => f.type === 'rapport').length,
            projets: activeFichiers.filter(f => f.type === 'projet').length,
            archives: classeurs.filter(c => c.name.toLowerCase().includes('archive'))
                .flatMap(c => c.dossiers.flatMap(d => d.fichiers.filter(f => !f.deleted_at))).length,
            trash: trashFichiers.length,
        } as Record<CategoryId, number>;
    }, [allFichiers, classeurs, trashFichiers]);

    // Filtered fichiers by category (when viewing categories instead of hierarchy)
    const filteredByCategory = useMemo(() => {
        let fichiers = [...allFichiers];

        // Filter by category
        switch (activeCategory) {
            case 'all':
                break;
            case 'contrats':
                fichiers = fichiers.filter(f => f.type === 'contrat');
                break;
            case 'factures':
                fichiers = fichiers.filter(f => f.type === 'facture');
                break;
            case 'devis':
                fichiers = fichiers.filter(f => f.type === 'devis');
                break;
            case 'rapports':
                fichiers = fichiers.filter(f => f.type === 'rapport');
                break;
            case 'projets':
                fichiers = fichiers.filter(f => f.type === 'projet');
                break;
            case 'archives':
                fichiers = classeurs
                    .filter(c => c.name.toLowerCase().includes('archive'))
                    .flatMap(c => c.dossiers.flatMap(d => d.fichiers.filter(f => !f.deleted_at)))
                    .map(f => ({ ...f, classeurId: '', dossierId: '' }));
                break;
            case 'trash':
                return trashFichiers as any[];
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            fichiers = fichiers.filter(f =>
                f.name.toLowerCase().includes(query) ||
                f.reference?.toLowerCase().includes(query) ||
                f.description?.toLowerCase().includes(query) ||
                f.tags.some(t => t.toLowerCase().includes(query))
            );
        }

        // Apply sort
        switch (sortBy) {
            case 'date_desc':
                fichiers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'date_asc':
                fichiers.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                break;
            case 'name':
                fichiers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'type':
                fichiers.sort((a, b) => a.type.localeCompare(b.type));
                break;
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
    // CRUD Actions - Classeur
    // ===================================

    const handleCreateClasseur = (data: Partial<IClasseur>) => {
        const newClasseur: IClasseur = {
            id: `classeur-${Date.now()}`,
            name: data.name || 'Nouveau Classeur',
            description: data.description || '',
            icon: data.icon || '📚',
            color: data.color || 'bg-blue-500',
            is_system: false,
            dossiers: [],
            created_at: new Date().toISOString(),
        };

        const updated = [...classeurs, newClasseur];
        saveClasseurs(updated);

        toast({
            title: "📚 Classeur créé",
            description: `${newClasseur.name} a été créé avec succès`,
        });

        return newClasseur;
    };

    // ===================================
    // CRUD Actions - Dossier
    // ===================================

    const handleCreateDossier = (classeurId: string, data: Partial<IDossier>) => {
        const newDossier: IDossier = {
            id: `dossier-${Date.now()}`,
            name: data.name || 'Nouveau Dossier',
            description: data.description || '',
            icon: data.icon || '📁',
            color: data.color || 'bg-blue-400',
            fichiers: [],
            created_at: new Date().toISOString(),
        };

        const updated = classeurs.map(c =>
            c.id === classeurId
                ? { ...c, dossiers: [...c.dossiers, newDossier] }
                : c
        );
        saveClasseurs(updated);

        // Update selected classeur if needed
        if (selectedClasseur?.id === classeurId) {
            setSelectedClasseur(updated.find(c => c.id === classeurId) || null);
        }

        toast({
            title: "📁 Dossier créé",
            description: `${newDossier.name} ajouté dans le classeur`,
        });

        return newDossier;
    };

    // ===================================
    // CRUD Actions - Fichier
    // ===================================

    const handleCreateFichier = (classeurId: string, dossierId: string, data: Partial<IFichier>) => {
        const newFichier: IFichier = {
            id: `fichier-${Date.now()}`,
            name: data.name || 'Nouveau Fichier',
            description: data.description,
            type: data.type || 'other',
            reference: data.reference || `REF-${Date.now()}`,
            author: user?.displayName || 'Utilisateur',
            status: 'brouillon',
            tags: data.tags || [],
            attachments: data.attachments || [],
            created_at: new Date().toISOString(),
        };

        const updated = classeurs.map(c =>
            c.id === classeurId
                ? {
                    ...c,
                    dossiers: c.dossiers.map(d =>
                        d.id === dossierId
                            ? { ...d, fichiers: [...d.fichiers, newFichier] }
                            : d
                    )
                }
                : c
        );
        saveClasseurs(updated);

        // Update navigation state
        if (selectedClasseur?.id === classeurId) {
            const updatedClasseur = updated.find(c => c.id === classeurId);
            setSelectedClasseur(updatedClasseur || null);
            if (selectedDossier?.id === dossierId) {
                setSelectedDossier(updatedClasseur?.dossiers.find(d => d.id === dossierId) || null);
            }
        }

        toast({
            title: "📄 Fichier créé",
            description: `${newFichier.name} ajouté dans le dossier`,
        });

        return newFichier;
    };

    const handleDeleteFichier = (fichierId: string) => {
        const updated = classeurs.map(c => ({
            ...c,
            dossiers: c.dossiers.map(d => ({
                ...d,
                fichiers: d.fichiers.map(f =>
                    f.id === fichierId
                        ? { ...f, deleted_at: new Date().toISOString() }
                        : f
                )
            }))
        }));

        saveClasseurs(updated);

        if (selectedFichier?.id === fichierId) {
            setSelectedFichier(null);
        }

        toast({
            title: "🗑️ Fichier déplacé vers la corbeille",
            description: "Vous pourrez le restaurer depuis la corbeille.",
        });
    };

    const handleRestoreFichier = (fichierId: string) => {
        const updated = classeurs.map(c => ({
            ...c,
            dossiers: c.dossiers.map(d => ({
                ...d,
                fichiers: d.fichiers.map(f => {
                    if (f.id === fichierId) {
                        const { deleted_at, ...rest } = f;
                        return rest as IFichier;
                    }
                    return f;
                })
            }))
        }));

        saveClasseurs(updated);

        toast({
            title: "♻️ Fichier restauré",
            description: "Le fichier a été remis dans son dossier d'origine.",
        });
    };

    const handlePermanentDeleteFichier = (fichierId: string) => {
        const updated = classeurs.map(c => ({
            ...c,
            dossiers: c.dossiers.map(d => ({
                ...d,
                fichiers: d.fichiers.filter(f => f.id !== fichierId)
            }))
        }));

        saveClasseurs(updated);

        if (selectedFichier?.id === fichierId) {
            setSelectedFichier(null);
        }

        toast({
            title: "🚫 Fichier supprimé définitivement",
            description: "Cette action est irréversible.",
            variant: "destructive"
        });
    };

    // Bulk Actions
    const performBulkAction = (
        action: 'delete' | 'restore' | 'permanent_delete',
        fichierIds: string[]
    ) => {
        if (fichierIds.length === 0) return;

        let updated = [...classeurs];

        if (action === 'delete') {
            updated = classeurs.map(c => ({
                ...c,
                dossiers: c.dossiers.map(d => ({
                    ...d,
                    fichiers: d.fichiers.map(f =>
                        fichierIds.includes(f.id)
                            ? { ...f, deleted_at: new Date().toISOString() }
                            : f
                    )
                }))
            }));
            toast({ title: "Corbeille", description: `${fichierIds.length} fichier(s) déplacés vers la corbeille.` });
        } else if (action === 'restore') {
            updated = classeurs.map(c => ({
                ...c,
                dossiers: c.dossiers.map(d => ({
                    ...d,
                    fichiers: d.fichiers.map(f => {
                        if (fichierIds.includes(f.id)) {
                            const { deleted_at, ...rest } = f;
                            return rest as IFichier;
                        }
                        return f;
                    })
                }))
            }));
            toast({ title: "Restauré", description: `${fichierIds.length} fichier(s) restaurés.` });
        } else if (action === 'permanent_delete') {
            updated = classeurs.map(c => ({
                ...c,
                dossiers: c.dossiers.map(d => ({
                    ...d,
                    fichiers: d.fichiers.filter(f => !fichierIds.includes(f.id))
                }))
            }));
            toast({ title: "Supprimé", description: `${fichierIds.length} fichier(s) supprimés définitivement.`, variant: "destructive" });
        }

        saveClasseurs(updated);
    };

    return {
        // Data State
        classeurs,
        isLoading,

        // Navigation State
        selectedClasseur,
        selectedDossier,
        selectedFichier,
        navigationLevel,
        currentViewClasseur,
        currentViewDossier,

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
        filteredByCategory,
        allFichiers,
        trashFichiers,

        // Navigation Actions
        handleSelectClasseur,
        handleSelectDossier,
        handleSelectFichier,
        handleNavigateToClasseurs,
        handleNavigateToDossiers,
        handleNavigateToFichiers,

        // CRUD Actions
        handleCreateClasseur,
        handleCreateDossier,
        handleCreateFichier,
        handleDeleteFichier,
        handleRestoreFichier,
        handlePermanentDeleteFichier,
        performBulkAction,

        // Persistence
        saveClasseurs,
    };
}
