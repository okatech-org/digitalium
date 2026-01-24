/**
 * iArchive Module Layout
 * Wrapper for all iArchive pages with category navigation
 */

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Archive,
    FileText,
    Users,
    Scale,
    Briefcase,
    Shield,
    Award,
    Settings,
    Upload,
    Search,
    Filter,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const CATEGORIES = [
    { id: 'fiscal', label: 'Fiscal', icon: FileText, retention: '10 ans', count: 2847, color: 'text-green-500' },
    { id: 'social', label: 'Social', icon: Users, retention: '5 ans', count: 1523, color: 'text-blue-500' },
    { id: 'legal', label: 'Juridique', icon: Scale, retention: '30 ans', count: 456, color: 'text-purple-500' },
    { id: 'clients', label: 'Clients', icon: Briefcase, retention: '10 ans', count: 892, color: 'text-orange-500' },
    { id: 'vault', label: 'Coffre-fort', icon: Shield, retention: 'Permanent', count: 34, color: 'text-red-500' },
    { id: 'certificates', label: 'Certificats', icon: Award, retention: '-', count: 156, color: 'text-emerald-500' },
];

export default function IArchiveLayout() {
    const location = useLocation();
    const activeCategory = location.pathname.split('/').pop() || 'fiscal';

    return (
        <div className="h-full flex">
            {/* Sidebar */}
            <aside className="w-72 border-r bg-card p-4 space-y-4 overflow-auto">
                {/* Header */}
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Archive className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">iArchive</h1>
                        <p className="text-xs text-muted-foreground">Archivage légal</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                        <Upload className="h-4 w-4 mr-2" />
                        Archiver des documents
                    </Button>
                </div>

                {/* Categories */}
                <div className="space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Catégories
                    </h2>
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <Link
                                key={cat.id}
                                to={`/pro/iarchive/${cat.id}`}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'hover:bg-muted'
                                )}
                            >
                                <cat.icon className={cn('h-4 w-4', cat.color)} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{cat.label}</p>
                                    <p className="text-xs text-muted-foreground">{cat.retention}</p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {cat.count.toLocaleString()}
                                </Badge>
                            </Link>
                        );
                    })}
                </div>

                {/* Alerts */}
                <Card className="border-orange-500/30">
                    <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">12 expirations</p>
                                <p className="text-xs text-muted-foreground">
                                    Documents à traiter dans 30 jours
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Storage */}
                <div className="px-2 pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Stockage archive</span>
                        <span className="font-medium">156 GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-emerald-500 rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">156 / 200 GB utilisés</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <header className="border-b px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Recherche légale..." className="pl-9" />
                        </div>
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtres avancés
                        </Button>
                        <Button variant="outline">
                            <Award className="h-4 w-4 mr-2" />
                            Générer certificat
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
