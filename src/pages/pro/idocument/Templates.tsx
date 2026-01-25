/**
 * Templates - Document templates library
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
    FileText,
    MoreVertical,
    Download,
    Copy,
    Star,
    Clock,
    Users,
    Layout,
    FileSpreadsheet,
    FileImage,
    Presentation,
    File,
    Plus,
    Search,
    Filter,
    Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Template categories
const TEMPLATE_CATEGORIES = [
    { id: 'all', label: 'Tous', count: 24 },
    { id: 'contract', label: 'Contrats', count: 8 },
    { id: 'report', label: 'Rapports', count: 5 },
    { id: 'invoice', label: 'Factures', count: 4 },
    { id: 'hr', label: 'RH', count: 4 },
    { id: 'presentation', label: 'Présentations', count: 3 },
];

// Mock templates
const MOCK_TEMPLATES = [
    {
        id: '1',
        title: 'Contrat de Travail CDI',
        category: 'contract',
        categoryLabel: 'Contrat',
        description: 'Modèle standard de contrat à durée indéterminée',
        icon: FileText,
        iconColor: 'text-blue-500 bg-blue-500/10',
        usageCount: 156,
        isFavorite: true,
        isNew: false,
        lastUsed: 'Il y a 2 jours',
    },
    {
        id: '2',
        title: 'Rapport Mensuel Activité',
        category: 'report',
        categoryLabel: 'Rapport',
        description: 'Template de rapport d\'activité mensuel avec KPIs',
        icon: FileSpreadsheet,
        iconColor: 'text-emerald-500 bg-emerald-500/10',
        usageCount: 89,
        isFavorite: true,
        isNew: false,
        lastUsed: 'Il y a 1 semaine',
    },
    {
        id: '3',
        title: 'Facture Pro Forma',
        category: 'invoice',
        categoryLabel: 'Facture',
        description: 'Facture professionnelle avec calcul automatique TVA',
        icon: File,
        iconColor: 'text-amber-500 bg-amber-500/10',
        usageCount: 234,
        isFavorite: false,
        isNew: false,
        lastUsed: 'Hier',
    },
    {
        id: '4',
        title: 'Attestation de Travail',
        category: 'hr',
        categoryLabel: 'RH',
        description: 'Attestation employeur standard',
        icon: FileText,
        iconColor: 'text-purple-500 bg-purple-500/10',
        usageCount: 45,
        isFavorite: false,
        isNew: false,
        lastUsed: 'Il y a 3 jours',
    },
    {
        id: '5',
        title: 'Pitch Deck Investisseurs',
        category: 'presentation',
        categoryLabel: 'Présentation',
        description: 'Présentation pour levée de fonds avec slides clés',
        icon: Presentation,
        iconColor: 'text-pink-500 bg-pink-500/10',
        usageCount: 12,
        isFavorite: true,
        isNew: true,
        lastUsed: null,
    },
    {
        id: '6',
        title: 'NDA - Accord de Confidentialité',
        category: 'contract',
        categoryLabel: 'Contrat',
        description: 'Non-Disclosure Agreement bilatéral',
        icon: FileText,
        iconColor: 'text-blue-500 bg-blue-500/10',
        usageCount: 67,
        isFavorite: false,
        isNew: false,
        lastUsed: 'Il y a 2 semaines',
    },
    {
        id: '7',
        title: 'Fiche de Paie',
        category: 'hr',
        categoryLabel: 'RH',
        description: 'Bulletin de salaire conforme législation gabonaise',
        icon: FileSpreadsheet,
        iconColor: 'text-purple-500 bg-purple-500/10',
        usageCount: 312,
        isFavorite: true,
        isNew: false,
        lastUsed: 'Aujourd\'hui',
    },
    {
        id: '8',
        title: 'Devis Commercial',
        category: 'invoice',
        categoryLabel: 'Facture',
        description: 'Devis professionnel avec conditions de vente',
        icon: File,
        iconColor: 'text-amber-500 bg-amber-500/10',
        usageCount: 178,
        isFavorite: false,
        isNew: false,
        lastUsed: 'Il y a 1 jour',
    },
];

interface OutletContext {
    viewMode: 'grid' | 'list';
}

export default function Templates() {
    const { viewMode } = useOutletContext<OutletContext>();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter templates
    const filteredTemplates = MOCK_TEMPLATES.filter(t => {
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Layout className="h-5 w-5 text-purple-500" />
                        Modèles de Documents
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {MOCK_TEMPLATES.length} modèles disponibles pour créer rapidement vos documents
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer un modèle
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un modèle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        {TEMPLATE_CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.label} ({cat.count})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTemplates.map((template, i) => {
                    const Icon = template.icon;
                    return (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group cursor-pointer hover:border-purple-500/50 transition-all h-full">
                                <CardContent className="p-4 flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={cn('p-2 rounded-lg', template.iconColor.split(' ')[1])}>
                                            <Icon className={cn('h-5 w-5', template.iconColor.split(' ')[0])} />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {template.isNew && (
                                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    Nouveau
                                                </Badge>
                                            )}
                                            {template.isFavorite && (
                                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="font-medium text-sm mb-1">{template.title}</h3>
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                                        {template.description}
                                    </p>

                                    {/* Category Badge */}
                                    <Badge variant="outline" className="text-xs mb-3 w-fit">
                                        {template.categoryLabel}
                                    </Badge>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {template.usageCount} utilisations
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 opacity-0 group-hover:opacity-100">
                                                    Utiliser
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Créer à partir de ce modèle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Télécharger le modèle
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Star className="h-4 w-4 mr-2" />
                                                    {template.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <Layout className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Aucun modèle trouvé</p>
                </div>
            )}
        </div>
    );
}
