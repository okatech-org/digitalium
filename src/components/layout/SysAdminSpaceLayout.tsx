/**
 * SysAdminSpaceLayout - Main layout for system administration
 * Provides unified sidebar navigation for sysadmin modules
 */

import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Server,
    Activity,
    Database,
    Terminal,
    ShieldAlert,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeType?: 'default' | 'warning' | 'error' | 'success';
    children?: { label: string; href: string; badge?: number }[];
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Console Système',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        label: 'Infrastructure',
        href: '/admin/infrastructure',
        icon: Server,
        badge: '4',
        badgeType: 'success',
    },
    {
        label: 'Monitoring',
        href: '/admin/monitoring',
        icon: Activity,
    },
    {
        label: 'Bases de Données',
        href: '/admin/databases',
        icon: Database,
        children: [
            { label: 'Vue d\'ensemble', href: '/admin/databases' },
            { label: 'Réplicas', href: '/admin/databases/replicas' },
            { label: 'Backups', href: '/admin/databases/backups' },
        ],
    },
    {
        label: 'Logs Système',
        href: '/admin/logs',
        icon: Terminal,
    },
    {
        label: 'Sécurité',
        href: '/admin/security',
        icon: ShieldAlert,
        badge: 'A+',
        badgeType: 'success',
    },
    {
        label: 'Utilisateurs IAM',
        href: '/admin/iam',
        icon: Users,
    },
    {
        label: 'Configuration Orga',
        href: '/admin/organization',
        icon: Building2,
    },
    {
        label: 'Thème Design',
        href: '/admin/design-theme',
        icon: Palette,
    },
];

// Business management items - separate section
const BUSINESS_NAV_ITEMS: NavItem[] = [
    {
        label: 'Gestion Utilisateurs',
        href: '/admin/users',
        icon: Users,
    },
    {
        label: 'Leads & Prospects',
        href: '/admin/leads',
        icon: Activity,
    },
    {
        label: 'Abonnements',
        href: '/admin/subscriptions',
        icon: Database,
    },
    {
        label: 'Modèles de Workflow',
        href: '/admin/workflow-templates',
        icon: GitBranch,
    },
];

export default function SysAdminSpaceLayout() {
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
        if (href === '/admin') {
            return location.pathname === '/admin';
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
                                ? 'bg-primary/10 text-foreground'
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
                                                ? 'bg-primary/10 text-foreground'
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
                        ? 'bg-primary/10 text-foreground'
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
                                    item.badgeType === 'error' && 'bg-red-500/20 text-red-400'
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
                        <div className="p-2 rounded-lg bg-muted border border-border">
                            <Cpu className="h-6 w-6 text-blue-400" />
                        </div>
                        {isSidebarOpen && (
                            <div>
                                <h1 className="font-bold text-foreground">Console Système</h1>
                                <p className="text-xs text-muted-foreground">Admin Infrastructure</p>
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

                {/* System Status Banner */}
                {isSidebarOpen && (
                    <div className="mx-3 mt-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-mono text-green-500">LIVE MONITORING</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Tous les systèmes opérationnels</p>
                    </div>
                )}

                {/* Navigation */}
                <ScrollArea className="flex-1 p-3">
                    <nav className="space-y-1">
                        {NAV_ITEMS.map(renderNavItem)}
                    </nav>

                    {/* Business Management Section */}
                    {isSidebarOpen && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground px-3 mb-2 uppercase tracking-wider">
                                Gestion Métier
                            </p>
                        </div>
                    )}
                    <nav className="space-y-1 mt-1">
                        {BUSINESS_NAV_ITEMS.map(renderNavItem)}
                    </nav>
                </ScrollArea>

                {/* User Section */}
                <div className="p-3 border-t border-border">
                    <div className={cn(
                        'flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors',
                        !isSidebarOpen && 'justify-center'
                    )}>
                        <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback className="bg-muted text-foreground">
                                {user?.displayName?.slice(0, 2).toUpperCase() || 'SA'}
                            </AvatarFallback>
                        </Avatar>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-foreground">
                                    {user?.displayName || 'SysAdmin'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email}
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
    );
}
