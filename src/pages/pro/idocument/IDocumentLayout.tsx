/**
 * iDocument Module Layout
 * Wrapper for all iDocument pages with sub-navigation
 */

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Share2,
    Users,
    FileStack,
    Trash2,
    Settings,
    Plus,
    Upload,
    Search,
    Grid3X3,
    List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { label: 'Mes Documents', href: '/pro/idocument', icon: FileText },
    { label: 'Partagés', href: '/pro/idocument/shared', icon: Share2 },
    { label: 'Équipe', href: '/pro/idocument/team', icon: Users },
    { label: 'Modèles', href: '/pro/idocument/templates', icon: FileStack },
    { label: 'Corbeille', href: '/pro/idocument/trash', icon: Trash2 },
];

export default function IDocumentLayout() {
    const location = useLocation();
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <FileText className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">iDocument</h1>
                                <p className="text-sm text-muted-foreground">Documents collaboratifs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Importer
                            </Button>
                            <Button className="bg-blue-500 hover:bg-blue-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Nouveau
                            </Button>
                        </div>
                    </div>

                    {/* Sub-navigation */}
                    <div className="flex items-center justify-between">
                        <Tabs value={location.pathname} className="w-auto">
                            <TabsList className="bg-muted/50">
                                {NAV_ITEMS.map((item) => (
                                    <TabsTrigger
                                        key={item.href}
                                        value={item.href}
                                        asChild
                                        className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500"
                                    >
                                        <Link to={item.href} className="flex items-center gap-2">
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher..."
                                    className="pl-9 w-64"
                                />
                            </div>
                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-6">
                <Outlet context={{ viewMode }} />
            </main>
        </div>
    );
}
