
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { FileText, Receipt, Calculator, BarChart3, Rocket, Archive, Trash2, FolderOpen } from "lucide-react";

export type CategoryId = 'all' | 'contrats' | 'factures' | 'devis' | 'rapports' | 'projets' | 'archives' | 'trash';

interface Category {
    id: CategoryId;
    label: string;
    icon: React.ReactNode;
    folderId?: string;
    color: string;
}

const CATEGORIES: Category[] = [
    { id: 'all', label: 'Tous', icon: <FolderOpen className="h-4 w-4" />, color: 'text-primary' },
    { id: 'contrats', label: 'Contrats', icon: <FileText className="h-4 w-4" />, folderId: 'contrats', color: 'text-blue-500' },
    { id: 'factures', label: 'Factures', icon: <Receipt className="h-4 w-4" />, folderId: 'factures', color: 'text-green-500' },
    { id: 'devis', label: 'Devis', icon: <Calculator className="h-4 w-4" />, folderId: 'devis', color: 'text-yellow-500' },
    { id: 'rapports', label: 'Rapports', icon: <BarChart3 className="h-4 w-4" />, folderId: 'rapports', color: 'text-purple-500' },
    { id: 'projets', label: 'Projets', icon: <Rocket className="h-4 w-4" />, folderId: 'projets', color: 'text-primary' },
    { id: 'archives', label: 'Archives', icon: <Archive className="h-4 w-4" />, folderId: 'archives', color: 'text-gray-500' },
    { id: 'trash', label: 'Corbeille', icon: <Trash2 className="h-4 w-4" />, color: 'text-destructive' },
];

interface CategoryTabsProps {
    activeCategory: CategoryId;
    onCategoryChange: (category: CategoryId) => void;
    counts: Record<CategoryId, number>;
}

export function CategoryTabs({ activeCategory, onCategoryChange, counts }: CategoryTabsProps) {
    return (
        <div className="mb-6">
            <div className="bg-card border border-border/40 p-1.5 rounded-2xl inline-flex flex-wrap gap-1 shadow-sm">
                {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const count = counts[cat.id] || 0;

                    return (
                        <motion.button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <span className={cn(
                                "transition-colors",
                                isActive ? cat.color : "text-inherit"
                            )}>
                                {cat.icon}
                            </span>
                            <span className="hidden sm:inline">{cat.label}</span>
                            {count > 0 && (
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {count}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

export { CATEGORIES };
export type { Category };
