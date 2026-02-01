/**
 * FolderExplorer - Hierarchical folder tree component for iDocument
 * Displays Digitalium's folder structure in SubAdmin space
 * 
 * Uses parentId-based hierarchy instead of children arrays
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Folder,
    FolderOpen,
    ChevronRight,
    FileText,
    Plus,
    MoreVertical,
    Upload,
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
import { DigitaliumFolder, getSubfolders, getFolderItemCount } from '@/data/digitaliumMockData';

interface FolderExplorerProps {
    folders: DigitaliumFolder[];
    onFolderSelect?: (folder: DigitaliumFolder) => void;
    selectedFolderId?: string;
    className?: string;
}

// Color mapping for folder icons
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

interface FolderNodeProps {
    folder: DigitaliumFolder;
    allFolders: DigitaliumFolder[];
    depth: number;
    onSelect?: (folder: DigitaliumFolder) => void;
    selectedId?: string;
    defaultExpanded?: boolean;
}

function FolderNode({ folder, allFolders, depth, onSelect, selectedId, defaultExpanded = false }: FolderNodeProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded || depth === 0);

    // Get children using parentId-based hierarchy
    const children = useMemo(() => getSubfolders(folder.id), [folder.id]);
    const hasChildren = children.length > 0;

    // Get item count (files + subfolders)
    const itemCount = useMemo(() => getFolderItemCount(folder.id), [folder.id]);
    const totalItems = itemCount.files + itemCount.folders;

    const isSelected = selectedId === folder.id;
    const colorClass = folder.color ? FOLDER_COLORS[folder.color] : 'text-yellow-500';

    const handleClick = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
        onSelect?.(folder);
    };

    // Clean folder name (remove emoji for icon display since we show color)
    const displayName = folder.name.replace(/^[📁💰👥⚖️🔧📈🚀📋🏛️🏢🏫]\\s*/, '');

    return (
        <div>
            <motion.div
                initial={false}
                className={cn(
                    'group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all',
                    'hover:bg-muted/50',
                    isSelected && 'bg-primary/10 border border-primary/30',
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

                {/* Folder icon with emoji if available */}
                {folder.icon ? (
                    <span className="text-sm flex-shrink-0">{folder.icon}</span>
                ) : isExpanded && hasChildren ? (
                    <FolderOpen className={cn('h-4 w-4 flex-shrink-0', colorClass)} />
                ) : (
                    <Folder className={cn('h-4 w-4 flex-shrink-0', colorClass)} />
                )}

                {/* Folder name */}
                <span className={cn(
                    'flex-1 truncate text-sm',
                    isSelected ? 'font-medium' : 'text-foreground/80'
                )}>
                    {displayName}
                </span>

                {/* Item count badge */}
                {totalItems > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {totalItems}
                    </Badge>
                )}

                {/* Empty indicator */}
                {totalItems === 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="text-[10px] text-muted-foreground/50 italic">
                                    vide
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Dossier vide - Glissez des fichiers pour ajouter</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
                            // Trigger create subfolder - would need to be passed as prop
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau sous-dossier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Upload className="h-4 w-4 mr-2" />
                            Importer des fichiers
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
                            <FolderNode
                                key={child.id}
                                folder={child}
                                allFolders={allFolders}
                                depth={depth + 1}
                                onSelect={onSelect}
                                selectedId={selectedId}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FolderExplorer({ folders, onFolderSelect, selectedFolderId, className }: FolderExplorerProps) {
    // Get only root folders (where parentId is null)
    const rootFolders = useMemo(() => folders.filter(f => f.parentId === null), [folders]);

    return (
        <ScrollArea className={cn('h-full', className)}>
            <div className="p-2 space-y-1">
                {rootFolders.map((folder) => (
                    <FolderNode
                        key={folder.id}
                        folder={folder}
                        allFolders={folders}
                        depth={0}
                        onSelect={onFolderSelect}
                        selectedId={selectedFolderId}
                        defaultExpanded={true}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}

export default FolderExplorer;
