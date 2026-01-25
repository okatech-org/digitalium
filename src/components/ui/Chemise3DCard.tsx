/**
 * Chemise3DCard - 3D-styled folder card using CSS transforms
 * Displays a folder icon with documents in a flat layout (no WebGL)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Download, Shield, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Document {
    id: string;
    name: string;
    type: string;
    reference?: string;
    verified?: boolean;
}

interface Chemise3DCardProps {
    name: string;
    color?: string;
    documentCount: number;
    documents: Document[];
    category: string;
    onDocumentClick?: (doc: Document) => void;
}

// Color presets for different categories
const CATEGORY_COLORS: Record<string, { folder: string; tab: string; accent: string }> = {
    fiscal: { folder: '#10B981', tab: '#059669', accent: '#D1FAE5' },
    social: { folder: '#3B82F6', tab: '#2563EB', accent: '#DBEAFE' },
    legal: { folder: '#8B5CF6', tab: '#7C3AED', accent: '#EDE9FE' },
    clients: { folder: '#F59E0B', tab: '#D97706', accent: '#FEF3C7' },
    vault: { folder: '#EF4444', tab: '#DC2626', accent: '#FEE2E2' },
    certificates: { folder: '#06B6D4', tab: '#0891B2', accent: '#CFFAFE' },
    default: { folder: '#D4A574', tab: '#B8956E', accent: '#FDF6E3' },
};

export function Chemise3DCard({
    name,
    color,
    documentCount,
    documents,
    category,
    onDocumentClick,
}: Chemise3DCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
    const folderColor = color || colors.folder;

    return (
        <motion.div
            className="relative"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Main folder container with 3D perspective */}
            <div
                className="relative cursor-pointer group"
                style={{ perspective: '800px' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Folder back panel */}
                <div
                    className="relative w-48 h-56 rounded-lg shadow-lg transition-transform duration-300"
                    style={{
                        background: `linear-gradient(135deg, ${folderColor} 0%, ${colors.tab} 100%)`,
                        transform: isHovered ? 'rotateY(-5deg) rotateX(5deg)' : 'rotateY(0deg)',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Folder tab (top right) */}
                    <div
                        className="absolute -top-2 right-4 w-12 h-6 rounded-t-md"
                        style={{ backgroundColor: colors.tab }}
                    >
                        {/* Tab label slot */}
                        <div className="absolute inset-1 bg-white/90 rounded-sm flex items-center justify-center">
                            <span className="text-[8px] font-medium text-gray-600 truncate px-1">
                                {documentCount}
                            </span>
                        </div>
                    </div>

                    {/* Folder front face (slightly raised) */}
                    <motion.div
                        className="absolute inset-0 rounded-lg overflow-hidden"
                        style={{
                            background: `linear-gradient(180deg, ${folderColor} 0%, ${colors.tab} 100%)`,
                            transformOrigin: 'bottom',
                            boxShadow: isOpen
                                ? 'inset 0 -40px 60px -20px rgba(0,0,0,0.15)'
                                : 'inset 0 -20px 40px -20px rgba(0,0,0,0.1)',
                        }}
                        animate={{
                            rotateX: isOpen ? -45 : 0,
                            y: isOpen ? -20 : 0,
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        {/* Folder edge highlight */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-lg" />

                        {/* Folder name */}
                        <div className="absolute bottom-4 left-3 right-3">
                            <p className="text-white font-medium text-sm truncate drop-shadow-md">
                                {name}
                            </p>
                            <p className="text-white/70 text-xs mt-0.5">
                                {documentCount} documents
                            </p>
                        </div>

                        {/* Open/Close indicator */}
                        <div className="absolute top-3 right-3">
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4 text-white/70" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-white/70" />
                            )}
                        </div>
                    </motion.div>

                    {/* Documents peeking out when open */}
                    <AnimatePresence>
                        {isOpen && documents.slice(0, 3).map((doc, i) => (
                            <motion.div
                                key={doc.id}
                                initial={{ y: 0, opacity: 0 }}
                                animate={{
                                    y: -30 - (i * 15),
                                    opacity: 1,
                                    rotateX: -5,
                                }}
                                exit={{ y: 0, opacity: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.3 }}
                                className="absolute left-2 right-2 h-auto bg-white rounded shadow-md p-2 cursor-pointer hover:shadow-lg"
                                style={{
                                    top: `${40 + i * 5}%`,
                                    zIndex: 10 - i,
                                    transformStyle: 'preserve-3d',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDocumentClick?.(doc);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs font-medium text-gray-700 truncate flex-1">
                                        {doc.name}
                                    </span>
                                    {doc.verified && (
                                        <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Shadow */}
                <div
                    className="absolute -bottom-2 left-2 right-2 h-4 bg-black/10 blur-md rounded-full transition-all duration-300"
                    style={{
                        transform: isHovered ? 'scaleX(1.1) translateY(4px)' : 'scaleX(1)',
                    }}
                />
            </div>

            {/* Expanded document list */}
            <AnimatePresence>
                {isOpen && documents.length > 3 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 overflow-hidden"
                    >
                        <div className="bg-card border rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                            {documents.slice(3).map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                                    onClick={() => onDocumentClick?.(doc)}
                                >
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm truncate flex-1">{doc.name}</span>
                                    {doc.verified && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                                            Vérifié
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Chemise3DCard;
