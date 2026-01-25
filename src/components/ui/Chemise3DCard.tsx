/**
 * Chemise3DCard - 3D-styled A4 folder card that opens from the right
 * Standard manila folder design for A4 documents
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
const CATEGORY_COLORS: Record<string, { folder: string; folderDark: string; tab: string }> = {
    fiscal: { folder: '#34D399', folderDark: '#10B981', tab: '#059669' },
    social: { folder: '#60A5FA', folderDark: '#3B82F6', tab: '#2563EB' },
    legal: { folder: '#A78BFA', folderDark: '#8B5CF6', tab: '#7C3AED' },
    clients: { folder: '#FBBF24', folderDark: '#F59E0B', tab: '#D97706' },
    vault: { folder: '#F87171', folderDark: '#EF4444', tab: '#DC2626' },
    certificates: { folder: '#22D3EE', folderDark: '#06B6D4', tab: '#0891B2' },
    default: { folder: '#E5D3B3', folderDark: '#D4A574', tab: '#B8956E' },
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

    return (
        <motion.div
            className="relative select-none"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ perspective: '1000px' }}
        >
            {/* Folder container */}
            <div
                className="relative cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Back of folder (fixed) */}
                <div
                    className="relative w-44 rounded-sm shadow-md transition-all duration-300"
                    style={{
                        height: '220px',
                        background: `linear-gradient(135deg, ${colors.folder} 0%, ${colors.folderDark} 100%)`,
                        transform: isHovered && !isOpen ? 'translateY(-4px)' : 'translateY(0)',
                        boxShadow: isHovered
                            ? '0 12px 24px -8px rgba(0,0,0,0.3)'
                            : '0 4px 12px -4px rgba(0,0,0,0.2)',
                    }}
                >
                    {/* Tab on top right */}
                    <div
                        className="absolute -top-3 right-6 w-10 h-5 rounded-t-sm flex items-center justify-center"
                        style={{ backgroundColor: colors.tab }}
                    >
                        <div className="bg-white/90 rounded-[2px] px-1.5 py-0.5">
                            <span className="text-[9px] font-bold text-gray-700">
                                {documentCount}
                            </span>
                        </div>
                    </div>

                    {/* Edge line (top detail) */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 rounded-t-sm" />

                    {/* Folder name (bottom left) */}
                    <div className="absolute bottom-3 left-3 right-10">
                        <p className="text-white font-semibold text-sm truncate drop-shadow-sm">
                            {name}
                        </p>
                        <p className="text-white/60 text-xs mt-0.5">
                            {documentCount} doc{documentCount > 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Open indicator */}
                    <motion.div
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        animate={{ x: isHovered ? 4 : 0 }}
                    >
                        <ChevronRight className={cn(
                            "h-5 w-5 text-white/50 transition-transform duration-300",
                            isOpen && "rotate-90"
                        )} />
                    </motion.div>
                </div>

                {/* Front flap (opens to the right) */}
                <motion.div
                    className="absolute top-0 right-0 w-44 rounded-sm origin-left"
                    style={{
                        height: '220px',
                        background: `linear-gradient(135deg, ${colors.folder} 0%, ${colors.folderDark} 100%)`,
                        boxShadow: isOpen
                            ? '4px 0 20px -4px rgba(0,0,0,0.3)'
                            : 'none',
                    }}
                    animate={{
                        rotateY: isOpen ? -70 : 0,
                        x: isOpen ? 20 : 0,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    {/* Front edge detail */}
                    <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-white/10" />

                    {/* Slight gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent rounded-sm" />
                </motion.div>

                {/* Documents inside (visible when open) */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: 0.2 }}
                            className="absolute top-2 left-2 right-8 bottom-10 flex flex-col gap-1 overflow-hidden"
                        >
                            {documents.slice(0, 4).map((doc, i) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="bg-white rounded-sm shadow-sm p-2 cursor-pointer hover:bg-gray-50 hover:shadow transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDocumentClick?.(doc);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        <span className="text-[10px] font-medium text-gray-700 truncate flex-1">
                                            {doc.name}
                                        </span>
                                        {doc.verified && (
                                            <Shield className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {documentCount > 4 && (
                                <div className="text-[10px] text-white/70 text-center mt-1">
                                    +{documentCount - 4} autres
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Shadow under folder */}
            <motion.div
                className="absolute -bottom-1 left-2 right-2 h-3 bg-black/15 blur-sm rounded-full"
                animate={{
                    scaleX: isHovered ? 1.05 : 1,
                    opacity: isHovered ? 0.3 : 0.15,
                }}
            />

            {/* Extended document list when open */}
            <AnimatePresence>
                {isOpen && documentCount > 4 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 overflow-hidden"
                    >
                        <div className="bg-card border rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto">
                            {documents.slice(4).map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                                    onClick={() => onDocumentClick?.(doc)}
                                >
                                    <FileText className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs truncate flex-1">{doc.name}</span>
                                    {doc.verified && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[10px] px-1 py-0">
                                            ✓
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
