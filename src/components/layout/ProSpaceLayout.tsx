/**
 * ProSpaceLayout - Main layout wrapper for Pro user space
 * Provides unified sidebar navigation for iDocument, iArchive, iSignature
 */

import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Archive,
    PenTool,
    Users,
    BarChart3,
    CreditCard,
    Key,
    Shield,
    Globe,
    ChevronRight,
    ChevronDown,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuickActionBar } from '@/components/pro/QuickActionBar';

// Module color tokens
export const MODULE_COLORS = {
    iDocument: {
        primary: '#3B82F6',
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/30',
    },
    iArchive: {
        primary: '#10B981',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500',
        border: 'border-emerald-500/30',
    },
    iSignature: {
        primary: '#8B5CF6',
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        border: 'border-purple-500/30',
    },
};

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    module?: 'iDocument' | 'iArchive' | 'iSignature';
    badge?: string | number;
    children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Vue d\'ensemble',
        href: '/pro',
        icon: LayoutDashboard,
    },
    {
        label: 'iDocument',
        href: '/pro/idocument',
        icon: FileText,
        module: 'iDocument',
        children: [
            { label: 'Mes Documents', href: '/pro/idocument' },
            { label: 'Documents Partagés', href: '/pro/idocument/shared' },
            { label: 'Documents Équipe', href: '/pro/idocument/team' },
            { label: 'Modèles', href: '/pro/idocument/templates' },
            { label: 'Corbeille', href: '/pro/idocument/trash' },
        ],
    },
    {
        label: 'iArchive',
        href: '/pro/iarchive',
        icon: Archive,
        module: 'iArchive',
        children: [
            { label: 'Archive Fiscale', href: '/pro/iarchive/fiscal' },
            { label: 'Archive Sociale', href: '/pro/iarchive/social' },
            { label: 'Archive Juridique', href: '/pro/iarchive/legal' },
            { label: 'Coffre-fort', href: '/pro/iarchive/vault' },
            { label: 'Certificats', href: '/pro/iarchive/certificates' },
        ],
    },
    {
        label: 'iSignature',
        href: '/pro/isignature',
        icon: PenTool,
        module: 'iSignature',
        badge: 5,
        children: [
            { label: 'À signer', href: '/pro/isignature' },
            { label: 'En attente', href: '/pro/isignature/pending' },
            { label: 'Signés', href: '/pro/isignature/signed' },
            { label: 'Workflows', href: '/pro/isignature/workflows' },
        ],
    },
    {
        label: 'Gestion Équipe',
        href: '/team',
        icon: Users,
    },
    {
        label: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
    },
    {
        label: 'Facturation Pro',
        href: '/billing-pro',
        icon: CreditCard,
    },
    {
        label: 'Accès API',
        href: '/api',
        icon: Key,
    },
    {
        label: 'Sécurité',
        href: '/security',
        icon: Shield,
    },
    {
        label: 'Espace Public',
        href: '/public-profile',
        icon: Globe,
    },
];

export default function ProSpaceLayout() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedItems, setExpandedItems] = useState<string[]>(['iDocument', 'iArchive', 'iSignature']);

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    const isActive = (href: string) => {
        if (href === '/pro') return location.pathname === '/pro';
        return location.pathname.startsWith(href);
    };

    const getModuleStyles = (module?: 'iDocument' | 'iArchive' | 'iSignature', active?: boolean) => {
        if (!module) return active ? 'bg-primary/10 text-primary' : '';
        const colors = MODULE_COLORS[module];
        return active ? `${colors.bg} ${colors.text}` : '';
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:relative z-40 h-full bg-card border-r transition-all duration-300',
                    isSidebarOpen ? 'w-64' : 'w-0 lg:w-16'
                )}
            >
                {/* Mobile overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <div className={cn(
                    'relative h-full flex flex-col',
                    isSidebarOpen ? 'w-64' : 'w-16 lg:flex hidden'
                )}>
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b">
                        {isSidebarOpen && (
                            <Link to="/pro" className="flex items-center gap-2">
                                <span className="text-xl font-bold gradient-text">Pro</span>
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:flex hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 py-4">
                        <nav className="px-2 space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const active = isActive(item.href);
                                const expanded = expandedItems.includes(item.label);
                                const hasChildren = item.children && item.children.length > 0;

                                return (
                                    <div key={item.label}>
                                        <div
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group',
                                                getModuleStyles(item.module, active),
                                                !active && 'hover:bg-muted'
                                            )}
                                            onClick={() => hasChildren ? toggleExpand(item.label) : null}
                                        >
                                            {hasChildren ? (
                                                <>
                                                    <item.icon className={cn(
                                                        'h-5 w-5 flex-shrink-0',
                                                        item.module && MODULE_COLORS[item.module].text
                                                    )} />
                                                    {isSidebarOpen && (
                                                        <>
                                                            <span className="flex-1 font-medium">{item.label}</span>
                                                            {item.badge && (
                                                                <span className={cn(
                                                                    'px-2 py-0.5 text-xs rounded-full',
                                                                    item.module ? MODULE_COLORS[item.module].bg : 'bg-primary/10'
                                                                )}>
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                            {expanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <Link to={item.href} className="flex items-center gap-3 w-full">
                                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                                    {isSidebarOpen && (
                                                        <span className="font-medium">{item.label}</span>
                                                    )}
                                                </Link>
                                            )}
                                        </div>

                                        {/* Sub-items */}
                                        <AnimatePresence>
                                            {hasChildren && expanded && isSidebarOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-muted pl-3">
                                                        {item.children!.map((child) => (
                                                            <Link
                                                                key={child.href}
                                                                to={child.href}
                                                                className={cn(
                                                                    'block px-3 py-2 text-sm rounded-md transition-colors',
                                                                    location.pathname === child.href
                                                                        ? 'bg-muted font-medium'
                                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                                                )}
                                                            >
                                                                {child.label}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </nav>
                    </ScrollArea>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-14 border-b flex items-center px-4 gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold">Espace Pro</span>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>

                {/* Quick Action Bar */}
                <QuickActionBar />
            </main>
        </div>
    );
}
