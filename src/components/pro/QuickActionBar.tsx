/**
 * QuickActionBar - Floating action bar for quick access to common actions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    FileText,
    Archive,
    PenTool,
    Search,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    action: () => void;
}

export function QuickActionBar() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const actions: QuickAction[] = [
        {
            id: 'document',
            label: 'Nouveau document',
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500',
            action: () => navigate('/pro/idocument?action=new'),
        },
        {
            id: 'archive',
            label: 'Archiver',
            icon: Archive,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500',
            action: () => navigate('/pro/iarchive?action=import'),
        },
        {
            id: 'signature',
            label: 'Envoyer à signature',
            icon: PenTool,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500',
            action: () => navigate('/pro/isignature?action=new'),
        },
        {
            id: 'search',
            label: 'Recherche globale',
            icon: Search,
            color: 'text-primary',
            bgColor: 'bg-primary',
            action: () => {
                // TODO: Open global search modal
                console.log('Open search');
            },
        },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-16 right-0 mb-2 space-y-2"
                    >
                        {actions.map((action, index) => (
                            <motion.div
                                key={action.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-end gap-3"
                            >
                                <span className="px-3 py-1.5 bg-card border rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
                                    {action.label}
                                </span>
                                <Button
                                    size="icon"
                                    className={cn(
                                        'h-12 w-12 rounded-full shadow-lg',
                                        action.bgColor,
                                        'hover:opacity-90'
                                    )}
                                    onClick={() => {
                                        action.action();
                                        setIsOpen(false);
                                    }}
                                >
                                    <action.icon className="h-5 w-5 text-white" />
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    size="icon"
                    className={cn(
                        'h-14 w-14 rounded-full shadow-xl',
                        isOpen
                            ? 'bg-muted text-foreground'
                            : 'bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500'
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Plus className="h-6 w-6 text-white" />
                        )}
                    </motion.div>
                </Button>
            </motion.div>
        </div>
    );
}
