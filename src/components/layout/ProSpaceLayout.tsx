/**
 * ProSpaceLayout - Main layout wrapper for Pro user space
 * Provides unified sidebar navigation for iDocument, iArchive, iSignature
 */

import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
    Upload,
    Sparkles,
    Settings,
    LogOut,
    User,
    Bell,
    HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QuickActionBar } from '@/components/pro/QuickActionBar';
import { useAuth } from '@/contexts/FirebaseAuthContext';

// Module color tokens
export const MODULE_COLORS = {
    iDocument: {
        primary: '#3B82F6',
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/30',
        gradient: 'from-blue-500 to-cyan-500',
    },
    iArchive: {
        primary: '#10B981',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-500 to-teal-500',
    },
    iSignature: {
        primary: '#8B5CF6',
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        border: 'border-purple-500/30',
        gradient: 'from-purple-500 to-pink-500',
    },
};

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    module?: 'iDocument' | 'iArchive' | 'iSignature';
    badge?: string | number;
    badgeType?: 'default' | 'warning' | 'error';
    children?: { label: string; href: string; badge?: number }[];
}

const CORE_MODULES: NavItem[] = [
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
            { label: 'Clients', href: '/pro/iarchive/clients' },
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
        badgeType: 'warning',
        children: [
            { label: 'À signer', href: '/pro/isignature', badge: 5 },
            { label: 'En attente', href: '/pro/isignature/pending', badge: 3 },
            { label: 'Signés', href: '/pro/isignature/signed' },
            { label: 'Workflows', href: '/pro/isignature/workflows' },
        ],
    },
];

const ADMIN_ITEMS: NavItem[] = [
    { label: 'Gestion Équipe', href: '/team', icon: Users },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Facturation Pro', href: '/billing-pro', icon: CreditCard },
    { label: 'Accès API', href: '/api', icon: Key },
    { label: 'Sécurité', href: '/security', icon: Shield },
    { label: 'Espace Public', href: '/public-profile', icon: Globe },
];

export default function ProSpaceLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
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

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const renderNavItem = (item: NavItem, isAdminSection = false) => {
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
                    onClick={() => hasChildren ? toggleExpand(item.label) : navigate(item.href)}
                >
                    <item.icon className={cn(
                        'h-5 w-5 flex-shrink-0',
                        item.module && MODULE_COLORS[item.module].text
                    )} />

                    {isSidebarOpen && (
                        <>
                            <span className="flex-1 font-medium text-sm">{item.label}</span>
                            {item.badge && (
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        'text-xs px-1.5 py-0',
                                        item.badgeType === 'warning' && 'bg-orange-500/10 text-orange-500',
                                        item.badgeType === 'error' && 'bg-red-500/10 text-red-500',
                                        item.module && MODULE_COLORS[item.module].bg
                                    )}
                                >
                                    {item.badge}
                                </Badge>
                            )}
                            {hasChildren && (
                                expanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )
                            )}
                        </>
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
                            <div className={cn(
                                'ml-6 mt-1 space-y-0.5 border-l-2 pl-3',
                                item.module ? MODULE_COLORS[item.module].border : 'border-muted'
                            )}>
                                {item.children!.map((child) => (
                                    <Link
                                        key={child.href}
                                        to={child.href}
                                        className={cn(
                                            'flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
                                            location.pathname === child.href
                                                ? 'bg-muted font-medium'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        )}
                                    >
                                        <span>{child.label}</span>
                                        {child.badge && (
                                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                {child.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:relative z-40 h-full bg-card border-r transition-all duration-300',
                    isSidebarOpen ? 'w-72' : 'w-0 lg:w-16'
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
                    isSidebarOpen ? 'w-72' : 'w-16 lg:flex hidden'
                )}>
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b">
                        {isSidebarOpen && (
                            <Link to="/pro" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">P</span>
                                </div>
                                <span className="text-lg font-bold">Espace Pro</span>
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

                    {/* Quick Actions */}
                    {isSidebarOpen && (
                        <div className="p-3 space-y-2 border-b">
                            <Button
                                className="w-full justify-start bg-emerald-500 hover:bg-emerald-600"
                                onClick={() => navigate('/pro/iarchive/upload')}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Archiver un document
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Assistant iAsted
                            </Button>
                        </div>
                    )}

                    {/* Navigation */}
                    <ScrollArea className="flex-1 py-2">
                        <nav className="px-2 space-y-1">
                            {/* Core Modules */}
                            {isSidebarOpen && (
                                <div className="px-3 py-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Modules
                                    </span>
                                </div>
                            )}
                            {CORE_MODULES.map((item) => renderNavItem(item))}

                            {/* Separator */}
                            {isSidebarOpen && (
                                <div className="py-2">
                                    <Separator />
                                </div>
                            )}

                            {/* Admin Section */}
                            {isSidebarOpen && (
                                <div className="px-3 py-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Administration
                                    </span>
                                </div>
                            )}
                            {ADMIN_ITEMS.map((item) => renderNavItem(item, true))}
                        </nav>
                    </ScrollArea>

                    {/* User Profile Section */}
                    <div className="border-t p-3">
                        {isSidebarOpen ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="font-medium text-sm truncate">
                                                {user?.displayName || 'Utilisateur'}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {user?.email || 'email@exemple.com'}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        <User className="h-4 w-4 mr-2" />
                                        Mon Profil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Bell className="h-4 w-4 mr-2" />
                                        Notifications
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Paramètres
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        Aide
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="text-red-500"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Déconnexion
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full"
                                onClick={() => navigate('/profile')}
                            >
                                <User className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
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

