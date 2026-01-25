/**
 * iArchive Module Layout - Optimized
 * Full-width layout with horizontal category tabs
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Archive,
    Upload,
    Search,
    Filter,
    Award,
    HardDrive,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArchiveCategoryTabs } from './components/ArchiveCategoryTabs';

export default function IArchiveLayout() {
    const location = useLocation();
    const storageUsed = 156;
    const storageTotal = 200;
    const storagePercent = (storageUsed / storageTotal) * 100;

    return (
        <div className="h-full flex flex-col">
            {/* Compact Header Bar */}
            <header className="border-b px-6 py-3 space-y-3">
                {/* Top row: Branding + Search + Actions */}
                <div className="flex items-center gap-4">
                    {/* Module identity */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <Archive className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">iArchive</h1>
                            <p className="text-[10px] text-muted-foreground">Archivage légal</p>
                        </div>
                    </div>

                    {/* Global search */}
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Recherche dans les archives... (⌘K)"
                            className="pl-9 h-9"
                        />
                    </div>

                    {/* Storage indicator - compact */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <div className="w-20">
                            <Progress value={storagePercent} className="h-1.5" />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {storageUsed}/{storageTotal} GB
                        </span>
                    </div>

                    {/* Expiration alert */}
                    <Badge variant="outline" className="border-orange-500/50 text-orange-500 hidden sm:flex">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        12 expirations
                    </Badge>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-1" />
                            Filtres
                        </Button>
                        <Button variant="outline" size="sm">
                            <Award className="h-4 w-4 mr-1" />
                            Certificat
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600" size="sm">
                            <Upload className="h-4 w-4 mr-1" />
                            Archiver
                        </Button>
                    </div>
                </div>

                {/* Category Tabs */}
                <ArchiveCategoryTabs />
            </header>

            {/* Main Content - Full Width */}
            <main className="flex-1 overflow-auto p-6">
                <Outlet />
            </main>
        </div>
    );
}
