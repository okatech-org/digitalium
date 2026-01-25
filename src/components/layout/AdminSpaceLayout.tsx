/**
 * AdminSpaceLayout - Main layout for platform administration
 * Provides unified sidebar navigation for admin modules
 */

import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    CreditCard,
    MessageSquare,
    Settings,
    ChevronDown,
    ChevronRight,
    Shield,
    Building2,
    TrendingUp,
    Bell,
    FileText,
    LogOut,
    Menu,
    X,
    Gauge,
    Database,
    Globe,
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

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeType?: 'default' | 'warning' | 'error';
    children?: { label: string; href: string; badge?: number }[];
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Tableau de bord',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        label: 'Leads & Contacts',
        href: '/admin/leads',
        icon: UserPlus,
        badge: 12,
        badgeType: 'warning',
    },
    {
        label: 'Utilisateurs',
        href: '/admin/users',
        icon: Users,
        children: [
            { label: 'Tous les utilisateurs', href: '/admin/users' },
            { label: 'Par organisation', href: '/admin/users/organizations' },
            { label: 'Rôles & Permissions', href: '/admin/users/roles' },
        ],
    },
    {
        label: 'Abonnements',
        href: '/admin/subscriptions',
        icon: CreditCard,
        children: [
            { label: 'Tous les abonnements', href: '/admin/subscriptions' },
            { label: 'Factures', href: '/admin/subscriptions/invoices' },
            { label: 'Transactions', href: '/admin/subscriptions/transactions' },
        ],
    },
    {
        label: 'Organisations',
        href: '/admin/organizations',
        icon: Building2,
    },
    {
        label: 'Analytiques',
        href: '/admin/analytics',
        icon: TrendingUp,
    },
];

const SYSTEM_ITEMS: NavItem[] = [
    {
        label: 'Infrastructure',
        href: '/sysadmin/infrastructure',
        icon: Database,
    },
    {
        label: 'Monitoring',
        href: '/sysadmin/monitoring',
        icon: Gauge,
    },
    {
        label: 'Sécurité',
        href: '/sysadmin/security',
        icon: Shield,
    },
    {
        label: 'Configuration Orga',
        href: '/sysadmin/organization',
        icon: Building2,
    },
];

export default function AdminSpaceLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
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
                                ? 'bg-primary/10 text-primary'
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
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <span>{child.label}</span>
                                        {child.badge && (
                                            <Badge variant="secondary" className="text-xs">
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
                        ? 'bg-primary/10 text-primary'
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
                                    item.badgeType === 'warning' && 'bg-orange-500/20 text-orange-500',
                                    item.badgeType === 'error' && 'bg-red-500/20 text-red-500'
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
                className="h-full border-r bg-card flex flex-col"
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <div className={cn('flex items-center gap-3', !isSidebarOpen && 'justify-center')}>
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <Shield className="h-6 w-6 text-red-500" />
                        </div>
                        {isSidebarOpen && (
                            <div>
                                <h1 className="font-bold">Administration</h1>
                                <p className="text-xs text-muted-foreground">Gestion plateforme</p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 p-3">
                    <nav className="space-y-1">
                        {NAV_ITEMS.map(renderNavItem)}
                    </nav>

                    {isSidebarOpen && (
                        <>
                            <Separator className="my-4" />
                            <p className="px-3 text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                                Système
                            </p>
                        </>
                    )}

                    <nav className="space-y-1">
                        {SYSTEM_ITEMS.map(renderNavItem)}
                    </nav>
                </ScrollArea>

                {/* User Section */}
                <div className="p-3 border-t">
                    <div className={cn(
                        'flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors',
                        !isSidebarOpen && 'justify-center'
                    )}>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.displayName?.slice(0, 2).toUpperCase() || 'AD'}
                            </AvatarFallback>
                        </Avatar>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user?.displayName || 'Admin'}
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
                                        className="h-8 w-8"
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
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
