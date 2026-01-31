/**
 * SubAdminSpaceLayout - Layout for sub-administrator (Ornella DOUMBA role)
 * Provides unified sidebar navigation with Configuration Plateforme and Gestion Métier
 * Plus access to iDocument, iArchive, iSignature workflows
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
    Building2,
    ChevronDown,
    ChevronRight,
    LogOut,
    Menu,
    X,
    Cpu,
    Palette,
    Sun,
    Moon,
    GitBranch,
    Settings,
    Briefcase,
    TrendingUp,
    CreditCard,
    ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SpaceProvider } from '@/contexts/SpaceContext';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeType?: 'default' | 'warning' | 'error' | 'success';
    children?: { label: string; href: string; badge?: number }[];
}

interface NavSection {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    items: NavItem[];
}

// Dashboard - Entry point
const DASHBOARD_ITEM: NavItem = {
    label: 'Vue d\'ensemble',
    href: '/subadmin',
    icon: LayoutDashboard,
};

// Workflow Modules Section
const WORKFLOW_SECTION: NavSection = {
    title: 'Modules Métiers',
    icon: FileText,
    items: [
        {
            label: 'iDocument',
            href: '/subadmin/idocument',
            icon: FileText,
            badge: 'Pro',
            badgeType: 'success',
        },
        {
            label: 'iArchive',
            href: '/subadmin/iarchive',
            icon: Archive,
            badge: 'PME',
            badgeType: 'default',
        },
        {
            label: 'iSignature',
            href: '/subadmin/isignature',
            icon: PenTool,
        },
    ],
};

// Configuration Plateforme - Platform settings & organization
const CONFIG_SECTION: NavSection = {
    title: 'Configuration Plateforme',
    icon: Settings,
    items: [
        {
            label: 'Utilisateurs IAM',
            href: '/subadmin/iam',
            icon: Users,
        },
        {
            label: 'Configuration Orga',
            href: '/subadmin/organization',
            icon: Building2,
        },
        {
            label: 'Thème Design',
            href: '/subadmin/design-theme',
            icon: Palette,
        },
        {
            label: 'Modèles de Workflow',
            href: '/subadmin/workflow-templates',
            icon: GitBranch,
        },
    ],
};

// Gestion Métier - Business management
const BUSINESS_SECTION: NavSection = {
    title: 'Gestion Métier',
    icon: Briefcase,
    items: [
        {
            label: 'Gestion Clients',
            href: '/subadmin/clients',
            icon: Users,
        },
        {
            label: 'Leads & Prospects',
            href: '/subadmin/leads',
            icon: TrendingUp,
        },
        {
            label: 'Abonnements',
            href: '/subadmin/subscriptions',
            icon: CreditCard,
        },
    ],
};


export default function SubAdminSpaceLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    const isActive = (href: string) => {
        if (href === '/subadmin') {
            return location.pathname === '/subadmin';
        }
        return location.pathname.startsWith(href);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const renderNavItem = (item: NavItem) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.label);
        const active = isActive(item.href);
        const Icon = item.icon;

        if (hasChildren) {
            return (
                <div key={item.label}>
                    <button
                        onClick={() => toggleExpand(item.label)}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                            active
                                ? 'bg-purple-500/10 text-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        {isSidebarOpen && (
                            <>
                                <span className="flex-1">{item.label}</span>
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </>
                        )}
                    </button>
                    <AnimatePresence>
                        {isExpanded && isSidebarOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-6 mt-1 space-y-1 overflow-hidden"
                            >
                                {item.children!.map(child => (
                                    <Link
                                        key={child.href}
                                        to={child.href}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm',
                                            location.pathname === child.href
                                                ? 'bg-purple-500/10 text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <span>{child.label}</span>
                                        {child.badge && (
                                            <Badge variant="secondary" className="text-xs bg-muted">
                                                {child.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        const button = (
            <Link
                to={item.href}
                className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    active
                        ? 'bg-purple-500/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
            >
                <Icon className="h-5 w-5" />
                {isSidebarOpen && (
                    <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                            <Badge
                                variant="secondary"
                                className={cn(
                                    'text-xs',
                                    item.badgeType === 'success' && 'bg-green-500/20 text-green-400',
                                    item.badgeType === 'warning' && 'bg-orange-500/20 text-orange-400',
                                    item.badgeType === 'error' && 'bg-red-500/20 text-red-400',
                                    item.badgeType === 'default' && 'bg-purple-500/20 text-purple-400'
                                )}
                            >
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
        <SpaceProvider spaceType="subadmin">
            <div className="h-screen flex bg-background">
                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? 280 : 72 }}
                    className="h-full border-r border-border bg-card flex flex-col"
                >
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className={cn('flex items-center gap-3', !isSidebarOpen && 'justify-center')}>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                                <ShieldCheck className="h-6 w-6 text-purple-400" />
                            </div>
                            {isSidebarOpen && (
                                <div>
                                    <h1 className="font-bold text-foreground">Sous-Admin</h1>
                                    <p className="text-xs text-muted-foreground">Config & Gestion Métier</p>
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

                    {/* Role Badge */}
                    {isSidebarOpen && (
                        <div className="mx-3 mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                <span className="text-xs font-medium text-purple-400">SOUS-ADMINISTRATEUR</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Accès Configuration & Métier</p>
                        </div>
                    )}

                    {/* Navigation */}
                    <ScrollArea className="flex-1 p-3">
                        {/* Dashboard */}
                        <nav className="space-y-1">
                            {renderNavItem(DASHBOARD_ITEM)}
                        </nav>

                        {/* Workflow Modules Section */}
                        {isSidebarOpen && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 px-3 mb-2">
                                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {WORKFLOW_SECTION.title}
                                    </p>
                                </div>
                            </div>
                        )}
                        <nav className="space-y-1 mt-1">
                            {WORKFLOW_SECTION.items.map(renderNavItem)}
                        </nav>

                        {/* Configuration Plateforme Section */}
                        {isSidebarOpen && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 px-3 mb-2">
                                    <Settings className="h-3.5 w-3.5 text-purple-400" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {CONFIG_SECTION.title}
                                    </p>
                                </div>
                            </div>
                        )}
                        <nav className="space-y-1 mt-1">
                            {CONFIG_SECTION.items.map(renderNavItem)}
                        </nav>

                        {/* Gestion Métier Section */}
                        {isSidebarOpen && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 px-3 mb-2">
                                    <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {BUSINESS_SECTION.title}
                                    </p>
                                </div>
                            </div>
                        )}
                        <nav className="space-y-1 mt-1">
                            {BUSINESS_SECTION.items.map(renderNavItem)}
                        </nav>
                    </ScrollArea>

                    {/* User Section */}
                    <div className="p-3 border-t border-border">
                        <div className={cn(
                            'flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors',
                            !isSidebarOpen && 'justify-center'
                        )}>
                            <Avatar className="h-9 w-9 border border-purple-500/30">
                                <AvatarImage src={user?.photoURL || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                    OD
                                </AvatarFallback>
                            </Avatar>
                            {isSidebarOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-foreground">
                                        {user?.displayName || 'Ornella DOUMBA'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user?.email || 'ornella.doumba@digitalium.ga'}
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
                                            {theme === 'dark' ? (
                                                <Sun className="h-4 w-4" />
                                            ) : (
                                                <Moon className="h-4 w-4" />
                                            )}
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
                <main className="flex-1 overflow-auto bg-background">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SpaceProvider>
    );
}
