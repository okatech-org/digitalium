/**
 * ArchiveFolderExplorer - Hierarchical folder tree for iArchive
 * Displays archive folder structure per legal category
 * Shows retention periods and archive counts
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Folder,
    FolderOpen,
    ChevronRight,
    Archive,
    Plus,
    MoreVertical,
    Clock,
    Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { DigitaliumArchiveFolder, digitaliumArchives } from '@/data/digitaliumMockData';

interface ArchiveFolderExplorerProps {
    folders: DigitaliumArchiveFolder[];
    onFolderSelect?: (folder: DigitaliumArchiveFolder) => void;
    selectedFolderId?: string;
    className?: string;
    onCreateFolder?: (parentFolder: DigitaliumArchiveFolder) => void;
}

// Color mapping for folder icons (emerald theme for archives)
const FOLDER_COLORS: Record<string, string> = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    red: 'text-red-500',
    cyan: 'text-cyan-500',
    amber: 'text-amber-500',
    violet: 'text-violet-500',
};

interface ArchiveFolderNodeProps {
    folder: DigitaliumArchiveFolder;
    allFolders: DigitaliumArchiveFolder[];
    depth: number;
    onSelect?: (folder: DigitaliumArchiveFolder) => void;
    selectedId?: string;
    defaultExpanded?: boolean;
    onCreateFolder?: (parentFolder: DigitaliumArchiveFolder) => void;
}

function ArchiveFolderNode({
    folder,
    allFolders,
    depth,
    onSelect,
    selectedId,
    defaultExpanded = false,
    onCreateFolder,
}: ArchiveFolderNodeProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded || depth === 0);

    // Get children using parentId-based hierarchy
    const children = useMemo(() =>
        allFolders.filter(f => f.parentId === folder.id),
        [allFolders, folder.id]
    );
    const hasChildren = children.length > 0;

    // Get archive count for this folder
    const archiveCount = useMemo(() =>
        digitaliumArchives.filter(a => a.folderId === folder.id).length,
        [folder.id]
    );
    const totalItems = archiveCount + children.length;

    const isSelected = selectedId === folder.id;
    const colorClass = folder.color ? FOLDER_COLORS[folder.color] : 'text-emerald-500';

    const handleClick = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
        onSelect?.(folder);
    };

    // Format retention display
    const retentionDisplay = folder.retentionYears >= 99 ? '∞' : `${folder.retentionYears}a`;

    return (
        <div>
            <motion.div
                initial={false}
                className={cn(
                    'group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all',
                    'hover:bg-emerald-500/10',
                    isSelected && 'bg-emerald-500/15 border border-emerald-500/30',
                )}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={handleClick}
            >
                {/* Expand/Collapse chevron */}
                <div className="w-4 h-4 flex items-center justify-center">
                    {hasChildren && (
                        <motion.div
                            initial={false}
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </motion.div>
                    )}
                </div>

                {/* Folder icon */}
                {isExpanded && hasChildren ? (
                    <FolderOpen className={cn('h-4 w-4 flex-shrink-0', colorClass)} />
                ) : (
                    <Folder className={cn('h-4 w-4 flex-shrink-0', colorClass)} />
                )}

                {/* Folder name */}
                <span className={cn(
                    'flex-1 truncate text-sm',
                    isSelected ? 'font-medium' : 'text-foreground/80'
                )}>
                    {folder.name}
                </span>

                {/* Retention badge */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 border-muted-foreground/30"
                            >
                                <Clock className="h-2.5 w-2.5 mr-0.5" />
                                {retentionDisplay}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">
                                Rétention: {folder.retentionYears >= 99 ? 'Permanent' : `${folder.retentionYears} ans`}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Archive count */}
                {archiveCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600">
                        <Archive className="h-2.5 w-2.5 mr-0.5" />
                        {archiveCount}
                    </Badge>
                )}

                {/* Empty indicator */}
                {totalItems === 0 && (
                    <span className="text-[10px] text-muted-foreground/50 italic">
                        vide
                    </span>
                )}

                {/* Actions dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onCreateFolder?.(folder);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau sous-dossier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Vérifier les archives
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </motion.div>

            {/* Render children recursively */}
            <AnimatePresence initial={false}>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children.map((child) => (
                            <ArchiveFolderNode
                                key={child.id}
                                folder={child}
                                allFolders={allFolders}
                                depth={depth + 1}
                                onSelect={onSelect}
                                selectedId={selectedId}
                                onCreateFolder={onCreateFolder}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function ArchiveFolderExplorer({
    folders,
    onFolderSelect,
    selectedFolderId,
    className,
    onCreateFolder,
}: ArchiveFolderExplorerProps) {
    // Get only root folders (where parentId is null)
    const rootFolders = useMemo(() => folders.filter(f => f.parentId === null), [folders]);

    return (
        <ScrollArea className={cn('h-full', className)}>
            <div className="p-2 space-y-1">
                {rootFolders.map((folder) => (
                    <ArchiveFolderNode
                        key={folder.id}
                        folder={folder}
                        allFolders={folders}
                        depth={0}
                        onSelect={onFolderSelect}
                        selectedId={selectedFolderId}
                        defaultExpanded={true}
                        onCreateFolder={onCreateFolder}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}

export default ArchiveFolderExplorer;
