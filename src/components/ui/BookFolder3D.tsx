/**
 * BookFolder3D - A standing 3D folder component for iDocument
 * Mimics a real physical folder standing up, with open/close states and pages inside.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileText, MoreVertical, Star } from 'lucide-react';

interface BookFolder3DProps {
    title: string;
    color?: string;
    documentCount: number;
    hasContent: boolean; // true = pages inside, false = empty
    isStarred?: boolean;
    onClick?: () => void;
}

export function BookFolder3D({
    title,
    color = '#F59E0B', // Default yellow/amber
    documentCount,
    hasContent,
    isStarred,
    onClick
}: BookFolder3DProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Dynamic colors based on prop or default
    const folderColor = color;
    // Darker shade for inside/spine
    const folderDark = adjustColor(folderColor, -20);
    const folderLight = adjustColor(folderColor, 10);

    return (
        <div
            className="relative w-40 h-52 perspective-[1000px] cursor-pointer group select-none mx-auto my-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
                onClick?.();
            }}
        >
            {/* Whole Folder Container - Rotates slightly on hover for 3D feel */}
            <motion.div
                className="relative w-full h-full preserve-3d"
                animate={{
                    rotateY: isHovered ? -15 : -5,
                    rotateX: 5,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {/* --- BACK COVER --- */}
                <div
                    className="absolute inset-0 rounded-l-sm border-l border-white/20"
                    style={{
                        background: folderColor,
                        transform: 'translateZ(-10px)', // Push back half of spine width
                        boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.1)'
                    }}
                />

                {/* --- SPINE --- */}
                <div
                    className="absolute top-0 bottom-0 w-5 left-0 origin-left"
                    style={{
                        background: folderDark,
                        transform: 'rotateY(-90deg) translateX(-10px)', // Position as spine
                    }}
                >
                    {/* Spine Label/Detail */}
                    <div className="absolute top-4 left-1 right-1 h-12 bg-white/20 rounded-sm" />
                    <div className="absolute bottom-4 left-1 right-1 h-6 bg-white/10 rounded-sm flex items-center justify-center">
                        <span className="text-[8px] text-white/80 font-mono">{documentCount}</span>
                    </div>
                </div>

                {/* --- PAGES BLOCK (Visible when open) --- */}
                {hasContent && (
                    <motion.div
                        className="absolute top-1 bottom-1 left-2 w-[90%] bg-white rounded-r-sm origin-left"
                        style={{
                            background: 'linear-gradient(to right, #e5e5e5 0%, #ffffff 5%, #ffffff 95%, #e5e5e5 100%)',
                            border: '1px solid #e5e5e5',
                            // Thickness of pages
                            transform: 'translateZ(-5px) translateX(2px)',
                        }}
                        initial={{ rotateY: 0 }}
                        animate={{
                            rotateY: isOpen ? -10 : 0, // Pages fan out slightly if open
                            x: isOpen ? 0 : 0
                        }}
                    >
                        {/* Page lines effect (side view of stack) */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-[repeating-linear-gradient(to_bottom,#eee_0px,#eee_1px,#fff_1px,#fff_2px)] opacity-50" />

                        {/* Content Preview on first page */}
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-3 text-[5px] text-gray-300 space-y-1 overflow-hidden h-full"
                            >
                                <div className="w-1/2 h-2 bg-gray-200 mb-2 rounded-sm" />
                                <div className="w-full h-1 bg-gray-100 rounded-sm" />
                                <div className="w-full h-1 bg-gray-100 rounded-sm" />
                                <div className="w-3/4 h-1 bg-gray-100 rounded-sm" />
                                <div className="w-full h-1 bg-gray-100 rounded-sm" />
                                <div className="w-5/6 h-1 bg-gray-100 rounded-sm" />
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* --- FRONT COVER --- */}
                <motion.div
                    className="absolute inset-0 rounded-l-sm rounded-r-md origin-left preserve-3d"
                    style={{
                        background: `linear-gradient(135deg, ${folderColor} 0%, ${folderLight} 100%)`,
                        transformOrigin: '0% 50%',
                    }}
                    animate={{
                        rotateY: isOpen ? -100 : 0
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 20
                    }}
                >
                    {/* Front Cover Inside (visible when open) */}
                    <div
                        className="absolute inset-0 backface-hidden"
                        style={{
                            background: folderDark,
                            transform: 'rotateY(180deg) translateZ(1px)',
                            borderRadius: '2px'
                        }}
                    >
                        {/* Pocket inside cover */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/10 border-t border-white/10 rounded-bl-sm" />
                    </div>

                    {/* Front Cover Outside Detail */}
                    <div className="absolute inset-0 backface-hidden p-4 flex flex-col justify-between">
                        {/* Header/Tab Area */}

                        {/* Title Area */}
                        <div className="mt-auto bg-white/10 backdrop-blur-sm p-3 rounded-md border border-white/10 transform translate-z-1">
                            <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md line-clamp-2">
                                {title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <FileText className="w-3 h-3 text-white/70" />
                                <span className="text-[10px] text-white/80">{documentCount} files</span>
                            </div>
                        </div>

                        {/* Star Badge */}
                        {isStarred && (
                            <div className="absolute top-2 right-2 text-yellow-300 drop-shadow-sm">
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                        )}
                    </div>

                    {/* Crease line near spine */}
                    <div className="absolute top-0 bottom-0 left-2 w-[1px] bg-black/10" />
                    <div className="absolute top-0 bottom-0 left-[6px] w-[1px] bg-white/20" />

                </motion.div>

                {/* --- SHADOW --- */}
                <motion.div
                    className="absolute -bottom-4 left-0 right-0 h-4 bg-black/20 blur-md rounded-full mx-2"
                    animate={{
                        opacity: isOpen ? 0.15 : 0.3,
                        scaleX: isOpen ? 1.2 : 1,
                    }}
                />
            </motion.div>
        </div>
    );
}

// Helper to adjust color brightness (simple implementation)
function adjustColor(color: string, amount: number) {
    return color; // Placeholder - in a real app would use a color lib, but for now we rely on the gradient and opacity
}

export default BookFolder3D;
