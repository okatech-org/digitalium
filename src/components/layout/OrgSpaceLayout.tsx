/**
 * OrgSpaceLayout - Layout for Organism organizations
 * Éducation, Culture, Santé Publique, Associations
 */

import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Archive,
    PenTool,
    Users,
    BarChart3,
    CreditCard,
    Shield,
    Globe,
    Menu,
    X,
    Upload,
    Sparkles,
    Settings,
    LogOut,
    Sun,
    Moon,
    GraduationCap,
    FolderOpen,
    BookOpen,
    ClipboardSignature,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { QuickActionBar } from '@/components/pro/QuickActionBar';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SpaceProvider } from '@/contexts/SpaceContext';
import { IAstedChat } from '@/pages/pro/iarchive/components/IAstedChat';

// Module color tokens for Organisms
export const ORG_MODULE_COLORS = {
    iDocument: {
        primary: '#22C55E',
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        border: 'border-green-500/30',
    },
    iArchive: {
        primary: '#6366F1',
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-500',
        border: 'border-indigo-500/30',
    },
    iSignature: {
        primary: '#EC4899',
        bg: 'bg-pink-500/10',
        text: 'text-pink-500',
        border: 'border-pink-500/30',
    },
};

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    module?: 'iDocument' | 'iArchive' | 'iSignature';
    badge?: string | number;
}

interface NavSection {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    items: NavItem[];
}

// Dashboard
const DASHBOARD_ITEM: NavItem = {
    label: 'Tableau de Bord',
    href: '/org',
    icon: LayoutDashboard,
};

// Workflow Modules for Organisms
const WORKFLOW_SECTION: NavSection = {
    title: 'Modules',
    icon: GraduationCap,
    items: [
        {
            label: 'Documents',
            href: '/org/idocument',
            icon: FolderOpen,
            module: 'iDocument',
        },
        {
            label: 'Archives',
            href: '/org/iarchive',
            icon: BookOpen,
            module: 'iArchive',
        },
        {
            label: 'Signatures',
            href: '/org/isignature',
            icon: ClipboardSignature,
            module: 'iSignature',
        },
    ],
};

// Administration Section
const ADMIN_SECTION: NavSection = {
    title: 'Gestion',
    icon: Settings,
    items: [
        { label: 'Membres', href: '/org/team', icon: Users },
        { label: 'Statistiques', href: '/org/analytics', icon: BarChart3 },
        { label: 'Finances', href: '/org/billing', icon: CreditCard },
        { label: 'Sécurité', href: '/org/security', icon: Shield },
        { label: 'Site Web', href: '/org/public', icon: Globe },
    ],
};

export default function OrgSpaceLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isIAstedOpen, setIsIAstedOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/org') return location.pathname === '/org';
        return location.pathname.startsWith(href);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const renderNavItem = (item: NavItem) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        const moduleColors = item.module ? ORG_MODULE_COLORS[item.module] : null;

        const button = (
            <Link
                to={item.href}
                className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    active
                        ? moduleColors
                            ? `${moduleColors.bg} text-foreground`
                            : 'bg-green-500/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
            >
                <Icon className={cn(
                    'h-5 w-5',
                    moduleColors && moduleColors.text
                )} />
                {isSidebarOpen && (
                    <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                                {item.badge}
                            </Badge>
                        )}
                    </>
                )}
            </Link>
        );

        if (!isSidebarOpen) {
            return (
                <TooltipProvider key={item.label}>
                    <Tooltip>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{item.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return <div key={item.label}>{button}</div>;
    };

    return (
        <SpaceProvider spaceType="org">
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? 280 : 72 }}
                    className="h-full border-r border-border bg-card flex flex-col"
                >
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className={cn('flex items-center gap-3', !isSidebarOpen && 'justify-center')}>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30">
                                <GraduationCap className="h-6 w-6 text-green-500" />
                            </div>
                            {isSidebarOpen && (
                                <div>
                                    <h1 className="font-bold text-foreground">Organisme</h1>
                                    <p className="text-xs text-muted-foreground">Gestion collaborative</p>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Quick Actions */}
                    {isSidebarOpen && (
                        <div className="p-3 space-y-2 border-b border-border">
                            <Button
                                className="w-full justify-start bg-green-500 hover:bg-green-600"
                                onClick={() => navigate('/org/iarchive/upload')}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Archiver un document
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start border-pink-500/30 text-pink-500 hover:bg-pink-500/10"
                                onClick={() => setIsIAstedOpen(true)}
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Assistant iAsted
                            </Button>
                        </div>
                    )}

                    {/* Navigation */}
                    <ScrollArea className="flex-1 p-3">
                        <nav className="space-y-1">
                            {renderNavItem(DASHBOARD_ITEM)}
                        </nav>

                        {/* Workflow Modules Section */}
                        {isSidebarOpen && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 px-3 mb-2">
                                    <GraduationCap className="h-3.5 w-3.5 text-green-400" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {WORKFLOW_SECTION.title}
                                    </p>
                                </div>
                            </div>
                        )}
                        <nav className="space-y-1 mt-1">
                            {WORKFLOW_SECTION.items.map(renderNavItem)}
                        </nav>

                        {/* Administration Section */}
                        {isSidebarOpen && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 px-3 mb-2">
                                    <Settings className="h-3.5 w-3.5 text-gray-400" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {ADMIN_SECTION.title}
                                    </p>
                                </div>
                            </div>
                        )}
                        <nav className="space-y-1 mt-1">
                            {ADMIN_SECTION.items.map(renderNavItem)}
                        </nav>
                    </ScrollArea>

                    {/* User Section */}
                    <div className="p-3 border-t border-border">
                        <div className={cn(
                            'flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors',
                            !isSidebarOpen && 'justify-center'
                        )}>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
                                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'M'}
                            </div>
                            {isSidebarOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-foreground">
                                        {user?.displayName || 'Membre'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user?.email || 'membre@organisme.ga'}
                                    </p>
                                </div>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                            onClick={toggleTheme}
                                        >
                                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>{theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                            onClick={handleSignOut}
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Déconnexion</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </motion.aside>

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
                        <span className="font-semibold">Organisme</span>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-auto">
                        <Outlet />
                    </div>

                    {/* Quick Action Bar */}
                    <QuickActionBar />
                </main>

                {/* iAsted AI Chat */}
                <IAstedChat
                    isOpen={isIAstedOpen}
                    onClose={() => setIsIAstedOpen(false)}
                />
            </div>
        </SpaceProvider>
    );
}
