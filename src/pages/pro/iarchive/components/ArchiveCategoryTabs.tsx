/**
 * ArchiveCategoryTabs - Horizontal category navigation for iArchive
 * Replaces the vertical sidebar for more efficient space usage
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Users,
    Scale,
    Briefcase,
    Shield,
    Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORIES = [
    { id: 'fiscal', label: 'Fiscal', icon: FileText, count: 2847, color: 'emerald' },
    { id: 'social', label: 'Social', icon: Users, count: 1523, color: 'blue' },
    { id: 'legal', label: 'Juridique', icon: Scale, count: 456, color: 'purple' },
    { id: 'clients', label: 'Clients', icon: Briefcase, count: 892, color: 'orange' },
    { id: 'vault', label: 'Coffre', icon: Shield, count: 34, color: 'red' },
    { id: 'certificates', label: 'Certif.', icon: Award, count: 156, color: 'amber' },
];

const colorMap: Record<string, { active: string; hover: string; text: string }> = {
    emerald: { active: 'bg-emerald-500', hover: 'hover:bg-emerald-500/10', text: 'text-emerald-500' },
    blue: { active: 'bg-blue-500', hover: 'hover:bg-blue-500/10', text: 'text-blue-500' },
    purple: { active: 'bg-purple-500', hover: 'hover:bg-purple-500/10', text: 'text-purple-500' },
    orange: { active: 'bg-orange-500', hover: 'hover:bg-orange-500/10', text: 'text-orange-500' },
    red: { active: 'bg-red-500', hover: 'hover:bg-red-500/10', text: 'text-red-500' },
    amber: { active: 'bg-amber-500', hover: 'hover:bg-amber-500/10', text: 'text-amber-500' },
};

export function ArchiveCategoryTabs() {
    const location = useLocation();
    const pathParts = location.pathname.split('/');
    const activeCategory = pathParts[pathParts.length - 1] || 'fiscal';

    return (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id ||
                    (activeCategory === 'juridique' && cat.id === 'legal') ||
                    (activeCategory === 'coffre-fort' && cat.id === 'vault') ||
                    (activeCategory === 'certificats' && cat.id === 'certificates');
                const colors = colorMap[cat.color];
                const Icon = cat.icon;

                return (
                    <Link
                        key={cat.id}
                        to={`/pro/iarchive/${cat.id}`}
                        className="relative flex-shrink-0"
                    >
                        <motion.div
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                                isActive
                                    ? `${colors.active} text-white`
                                    : `${colors.hover} text-muted-foreground`
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon className={cn('h-4 w-4', isActive ? 'text-white' : colors.text)} />
                            <span className={cn(
                                'text-sm font-medium',
                                isActive ? 'text-white' : ''
                            )}>
                                {cat.label}
                            </span>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    'text-[10px] px-1.5 py-0 h-5',
                                    isActive
                                        ? 'bg-white/20 text-white border-0'
                                        : 'bg-muted'
                                )}
                            >
                                {cat.count >= 1000
                                    ? `${(cat.count / 1000).toFixed(1)}k`
                                    : cat.count}
                            </Badge>
                        </motion.div>
                    </Link>
                );
            })}
        </div>
    );
}

export default ArchiveCategoryTabs;
