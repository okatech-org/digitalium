
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";

// Hooks
import { useDocumentManager } from './hooks/useDocumentManager';
import { useSmartImport } from './hooks/useSmartImport';

// Types
import { IAttachment, IFichier } from './types';

// Components
import { StatsOverview } from './components/StatsOverview';
import { CategoryTabs } from './components/CategoryTabs';
import { ContentHeader } from './components/ContentHeader';
import { ClasseurList } from './components/ClasseurList';
import { DossierList } from './components/DossierList';
import { FichierList } from './components/FichierList';
import { FichierDetails } from './components/FichierDetails';

// Modals
import { NewClasseurModal } from './modals/NewClasseurModal';
import { NewDossierModal } from './modals/NewDossierModal';
import { NewFichierModal } from './modals/NewFichierModal';
import { SmartImportModal } from './modals/SmartImportModal';
import { GlobalImportModal } from './modals/GlobalImportModal';
import { FilePreviewModal } from './modals/FilePreviewModal';

const IDocumentPage = () => {
    const { toast } = useToast();

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [isGlobalImportOpen, setIsGlobalImportOpen] = useState(false);
    const [isNewClasseurModalOpen, setIsNewClasseurModalOpen] = useState(false);
    const [isNewDossierModalOpen, setIsNewDossierModalOpen] = useState(false);
    const [isNewFichierModalOpen, setIsNewFichierModalOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<IAttachment | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Managers
    const docManager = useDocumentManager();
    const smartImport = useSmartImport();

    // File Input for Import
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            smartImport.analyzeFiles(Array.from(e.target.files));
            setIsGlobalImportOpen(false);
        }
    };

    // Selection logic
    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = (checked: boolean) => {
        if (checked && docManager.currentViewDossier) {
            setSelectedIds(docManager.currentViewDossier.fichiers.filter(f => !f.deleted_at).map(f => f.id));
        } else {
            setSelectedIds([]);
        }
    };

    // Handle Smart Import Confirm
    const handleSmartImportConfirm = () => {
        // Smart import creates fichiers in the appropriate dossier
        const documentsToAdd = smartImport.analysisResults.map(res => ({
            name: res.smartName,
            type: res.type as IFichier['type'],
            classeurId: res.classeurId,
            dossierId: res.dossierId,
            file: res.file,
            confidence: res.confidence
        }));

        let addedCount = 0;

        documentsToAdd.forEach(item => {
            if (item.classeurId && item.dossierId) {
                docManager.handleCreateFichier(item.classeurId, item.dossierId, {
                    name: item.name,
                    type: item.type,
                    description: `Document importé automatiquement (Confiance: ${Math.round(item.confidence * 100)}%)`,
                    tags: ['import-ia', new Date().getFullYear().toString()],
                    attachments: [{
                        id: `att-${Date.now()}`,
                        name: item.file.name,
                        type: 'pdf',
                        size: `${(item.file.size / 1024).toFixed(1)} KB`,
                        url: URL.createObjectURL(item.file),
                        created_at: new Date().toISOString()
                    }]
                });
                addedCount++;
            }
        });

        smartImport.clearAnalysis();
        toast({
            title: "✅ Import terminé",
            description: `${addedCount} fichiers ont été importés et classés.`,
        });
    };

    // Dynamic "New" button handler based on navigation level
    const handleNewAction = () => {
        switch (docManager.navigationLevel) {
            case 'classeurs':
                setIsNewClasseurModalOpen(true);
                break;
            case 'dossiers':
                setIsNewDossierModalOpen(true);
                break;
            case 'fichiers':
                setIsNewFichierModalOpen(true);
                break;
        }
    };

    const isSmartImportModalOpen = smartImport.isAnalyzing || smartImport.analysisResults.length > 0;

    // Render content based on navigation level
    const renderContent = () => {
        // Details view
        if (docManager.selectedFichier) {
            return (
                <FichierDetails
                    fichier={docManager.selectedFichier}
                    onBack={docManager.handleNavigateToFichiers}
                    onPreviewFile={setPreviewFile}
                    onDelete={() => {
                        docManager.handleDeleteFichier(docManager.selectedFichier!.id);
                        docManager.handleNavigateToFichiers();
                    }}
                />
            );
        }

        // Fichiers view (inside a dossier)
        if (docManager.selectedDossier && docManager.currentViewDossier) {
            const fichiers = docManager.currentViewDossier.fichiers.filter(f => !f.deleted_at);

            if (fichiers.length === 0) {
                return (
                    <EmptyState
                        icon="📄"
                        title="Aucun fichier dans ce dossier"
                        description="Créez ou importez des fichiers pour commencer à les organiser."
                        onCreateAction={() => setIsNewFichierModalOpen(true)}
                        createLabel="Nouveau Fichier"
                        onImportAction={() => setIsGlobalImportOpen(true)}
                    />
                );
            }

            return (
                <>
                    <FichierList
                        fichiers={fichiers}
                        viewMode={viewMode}
                        selectedIds={selectedIds}
                        onToggleSelection={toggleSelection}
                        onToggleAll={toggleAll}
                        onSelectFichier={docManager.handleSelectFichier}
                        onAction={(action, fichier) => {
                            switch (action) {
                                case 'open': docManager.handleSelectFichier(fichier); break;
                                case 'delete': docManager.handleDeleteFichier(fichier.id); break;
                                case 'restore': docManager.handleRestoreFichier(fichier.id); break;
                                case 'permanent_delete': docManager.handlePermanentDeleteFichier(fichier.id); break;
                            }
                        }}
                    />
                    <BulkActionsBar
                        selectedCount={selectedIds.length}
                        isTrash={false}
                        onDelete={() => { docManager.performBulkAction('delete', selectedIds); setSelectedIds([]); }}
                        onRestore={() => { docManager.performBulkAction('restore', selectedIds); setSelectedIds([]); }}
                        onPermanentDelete={() => { docManager.performBulkAction('permanent_delete', selectedIds); setSelectedIds([]); }}
                    />
                </>
            );
        }

        // Dossiers view (inside a classeur)
        if (docManager.selectedClasseur && docManager.currentViewClasseur) {
            const dossiers = docManager.currentViewClasseur.dossiers;

            if (dossiers.length === 0) {
                return (
                    <EmptyState
                        icon="📁"
                        title="Aucun dossier dans ce classeur"
                        description="Créez des dossiers pour organiser vos fichiers par thème ou catégorie."
                        onCreateAction={() => setIsNewDossierModalOpen(true)}
                        createLabel="Nouveau Dossier"
                    />
                );
            }

            return (
                <DossierList
                    dossiers={dossiers}
                    onSelectDossier={docManager.handleSelectDossier}
                />
            );
        }

        // Classeurs view (root level)
        if (docManager.classeurs.length === 0) {
            return (
                <EmptyState
                    icon="📚"
                    title="Bienvenue dans Document Pro"
                    description="Commencez par créer un classeur pour organiser vos dossiers et documents."
                    onCreateAction={() => setIsNewClasseurModalOpen(true)}
                    createLabel="Nouveau Classeur"
                />
            );
        }

        return (
            <ClasseurList
                classeurs={docManager.classeurs}
                onSelectClasseur={docManager.handleSelectClasseur}
            />
        );
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Main Content */}
            <div className="h-full flex flex-col relative overflow-hidden">
                {/* Header Section */}
                <div className="px-6 pt-6 space-y-4">
                    {/* Stats Cards */}
                    <StatsOverview stats={docManager.stats} />

                    {/* Horizontal Category Tabs (only at root level) */}
                    {docManager.navigationLevel === 'classeurs' && (
                        <CategoryTabs
                            activeCategory={docManager.activeCategory}
                            onCategoryChange={docManager.setActiveCategory}
                            counts={docManager.categoryCounts}
                        />
                    )}

                    {/* Search, Filters & Actions */}
                    <ContentHeader
                        navigationLevel={docManager.navigationLevel}
                        selectedClasseur={docManager.selectedClasseur}
                        selectedDossier={docManager.selectedDossier}
                        selectedFichier={docManager.selectedFichier}
                        searchQuery={docManager.searchQuery}
                        onSearchChange={docManager.setSearchQuery}
                        viewMode={viewMode}
                        onToggleViewMode={setViewMode}
                        sortBy={docManager.sortBy}
                        onSortChange={docManager.setSortBy}
                        onImport={() => setIsGlobalImportOpen(true)}
                        onNew={handleNewAction}
                        onNavigateToClasseurs={docManager.handleNavigateToClasseurs}
                        onNavigateToDossiers={docManager.handleNavigateToDossiers}
                        onNavigateToFichiers={docManager.handleNavigateToFichiers}
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto px-6 pb-6 relative">
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                    />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={docManager.navigationLevel + (docManager.selectedClasseur?.id || '') + (docManager.selectedDossier?.id || '') + (docManager.selectedFichier?.id || '')}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals */}
            <GlobalImportModal
                isOpen={isGlobalImportOpen}
                onClose={() => setIsGlobalImportOpen(false)}
                onImportLocal={() => fileInputRef.current?.click()}
                onImportScanner={() => toast({ title: "Scanner", description: "Fonctionnalité à venir" })}
            />

            <SmartImportModal
                isOpen={isSmartImportModalOpen}
                onClose={smartImport.clearAnalysis}
                isAnalyzing={smartImport.isAnalyzing}
                progress={smartImport.analysisProgress}
                results={smartImport.analysisResults}
                folders={docManager.classeurs.flatMap(c => c.dossiers.map(d => ({
                    id: d.id,
                    name: `${c.icon} ${c.name} / ${d.icon} ${d.name}`,
                    icon: d.icon,
                    color: d.color,
                    documents: d.fichiers,
                    is_system: false,
                    created_at: d.created_at
                })))}
                onUpdateResult={smartImport.updateAnalysisResult}
                onRemoveResult={smartImport.removeAnalysisResult}
                onConfirmImport={handleSmartImportConfirm}
            />

            <NewClasseurModal
                isOpen={isNewClasseurModalOpen}
                onClose={() => setIsNewClasseurModalOpen(false)}
                onCreate={docManager.handleCreateClasseur}
            />

            <NewDossierModal
                isOpen={isNewDossierModalOpen}
                onClose={() => setIsNewDossierModalOpen(false)}
                onCreate={(data) => {
                    if (docManager.selectedClasseur) {
                        docManager.handleCreateDossier(docManager.selectedClasseur.id, data);
                    }
                }}
                classeurName={docManager.selectedClasseur?.name}
            />

            <NewFichierModal
                isOpen={isNewFichierModalOpen}
                onClose={() => setIsNewFichierModalOpen(false)}
                onCreate={(data) => {
                    if (docManager.selectedClasseur && docManager.selectedDossier) {
                        docManager.handleCreateFichier(
                            docManager.selectedClasseur.id,
                            docManager.selectedDossier.id,
                            data
                        );
                    }
                }}
                dossierName={docManager.selectedDossier?.name}
            />

            <FilePreviewModal
                file={previewFile}
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </div>
    );
};

// ========================================
// Helper Components
// ========================================

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    onCreateAction: () => void;
    createLabel: string;
    onImportAction?: () => void;
}

function EmptyState({ icon, title, description, onCreateAction, createLabel, onImportAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted/50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl opacity-60">{icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>

            <div className="flex items-center gap-4">
                <button
                    onClick={onCreateAction}
                    className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg"
                >
                    <span className="text-lg">+</span>
                    {createLabel}
                </button>
                {onImportAction && (
                    <button
                        onClick={onImportAction}
                        className="bg-card border border-border/40 px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                    >
                        <span className="text-lg">📥</span>
                        Importer des fichiers
                    </button>
                )}
            </div>
        </div>
    );
}

interface BulkActionsBarProps {
    selectedCount: number;
    isTrash: boolean;
    onDelete: () => void;
    onRestore: () => void;
    onPermanentDelete: () => void;
}

function BulkActionsBar({ selectedCount, isTrash, onDelete, onRestore, onPermanentDelete }: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-card border border-border/40 shadow-xl px-6 py-3 rounded-full flex items-center gap-4 z-50"
            >
                <span className="font-semibold text-foreground">{selectedCount} sélectionné(s)</span>
                <div className="h-4 w-px bg-border"></div>
                {isTrash ? (
                    <>
                        <button onClick={onRestore} className="text-green-600 hover:text-green-700 font-medium text-sm">
                            Restaurer
                        </button>
                        <button onClick={onPermanentDelete} className="text-destructive hover:text-destructive/80 font-medium text-sm">
                            Supprimer définitivement
                        </button>
                    </>
                ) : (
                    <button onClick={onDelete} className="text-destructive hover:text-destructive/80 font-medium text-sm">
                        Supprimer
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

export default IDocumentPage;
