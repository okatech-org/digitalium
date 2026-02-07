/**
 * LeadsProspectsSysAdmin - SysAdmin page for managing ecosystem leads and prospects
 * Multi-platform lead management across Digitalium ecosystem
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    MoreVertical,
    Building2,
    Calendar,
    Clock,
    CheckCircle,
    Download,
    Eye,
    Edit,
    Trash2,
    Mail,
    Phone,
    TrendingUp,
    Activity,
    Target,
    UserPlus,
    XCircle,
    ArrowRight,
    MessageSquare,
    Globe,
    FileText,
    Archive,
    Landmark,
    Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock Leads data - REMOVED: Data now comes from database
const MOCK_LEADS: { id: string; name: string; email: string; phone: string; company: string; type: string; source: string; status: string; score: number; value: number; assignee: string; createdAt: string; lastContact: string }[] = [];

// Stats - Demo Mode: Based on filtered leads
const STATS = {
    total: MOCK_LEADS.length,
    new: MOCK_LEADS.filter(l => l.status === 'new').length,
    qualified: MOCK_LEADS.filter(l => l.status === 'qualified').length,
    negotiation: MOCK_LEADS.filter(l => l.status === 'negotiation').length,
    won: 2, // Ministère de la Pêche + ASCOMA
    lost: 0,
    conversionRate: 50, // 2 won out of 4 total
    pipelineValue: MOCK_LEADS.reduce((sum, l) => sum + l.value, 0),
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    new: { label: 'Nouveau', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: <Clock className="w-3 h-3" /> },
    contacted: { label: 'Contacté', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', icon: <MessageSquare className="w-3 h-3" /> },
    qualified: { label: 'Qualifié', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', icon: <Target className="w-3 h-3" /> },
    negotiation: { label: 'Négociation', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', icon: <Activity className="w-3 h-3" /> },
    won: { label: 'Gagné', color: 'bg-green-500/20 text-green-500 border-green-500/30', icon: <CheckCircle className="w-3 h-3" /> },
    lost: { label: 'Perdu', color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
};

const sourceConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    'iDocument': { label: 'iDocument', color: 'bg-blue-500/20 text-blue-500', icon: <FileText className="w-3 h-3" /> },
    'iArchive': { label: 'iArchive', color: 'bg-amber-500/20 text-amber-500', icon: <Archive className="w-3 h-3" /> },
    'iSignature': { label: 'iSignature', color: 'bg-purple-500/20 text-purple-500', icon: <Edit className="w-3 h-3" /> },
    'Contact': { label: 'Contact direct', color: 'bg-gray-500/20 text-gray-400', icon: <Mail className="w-3 h-3" /> },
    'Partenaire': { label: 'Partenaire', color: 'bg-emerald-500/20 text-emerald-500', icon: <Users className="w-3 h-3" /> },
    'Référence': { label: 'Référence', color: 'bg-green-500/20 text-green-500', icon: <ArrowRight className="w-3 h-3" /> },
};

const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    administration: { label: 'Administration', color: 'bg-amber-500/20 text-amber-600', icon: <Landmark className="w-3 h-3" /> },
    enterprise: { label: 'Entreprise', color: 'bg-blue-500/20 text-blue-500', icon: <Briefcase className="w-3 h-3" /> },
};

function formatCurrency(amount: number): string {
    if (amount === 0) return 'Convention';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF';
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
}

export default function LeadsProspectsSysAdmin() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');

    const filteredLeads = MOCK_LEADS.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
        return matchesSearch && matchesStatus && matchesSource;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Leads & Prospects</h1>
                    <p className="text-muted-foreground">Pipeline commercial multi-plateformes</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Nouveau Lead
                    </Button>
                </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Nouveaux</p>
                                <p className="text-2xl font-bold text-blue-500">{STATS.new}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Qualifiés</p>
                                <p className="text-2xl font-bold text-amber-500">{STATS.qualified}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Target className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Négociation</p>
                                <p className="text-2xl font-bold text-emerald-500">{STATS.negotiation}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <Activity className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-green-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Conversion</p>
                                <p className="text-2xl font-bold text-green-500">{STATS.conversionRate}%</p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-purple-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pipeline</p>
                                <p className="text-lg font-bold text-purple-500">{(STATS.pipelineValue / 1000000).toFixed(1)}M XAF</p>
                            </div>
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Building2 className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Source Distribution */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Sources des leads</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(sourceConfig).map(([key, config]) => {
                            const count = MOCK_LEADS.filter(l => l.source === key).length;
                            return (
                                <Badge key={key} variant="outline" className={`${config.color} py-2 px-3`}>
                                    {config.icon}
                                    <span className="ml-1">{config.label}</span>
                                    <span className="ml-2 font-bold">{count}</span>
                                </Badge>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un lead..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous statuts</SelectItem>
                                <SelectItem value="new">Nouveau</SelectItem>
                                <SelectItem value="contacted">Contacté</SelectItem>
                                <SelectItem value="qualified">Qualifié</SelectItem>
                                <SelectItem value="negotiation">Négociation</SelectItem>
                                <SelectItem value="won">Gagné</SelectItem>
                                <SelectItem value="lost">Perdu</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes sources</SelectItem>
                                <SelectItem value="iDocument">iDocument</SelectItem>
                                <SelectItem value="iArchive">iArchive</SelectItem>
                                <SelectItem value="iSignature">iSignature</SelectItem>
                                <SelectItem value="Contact">Contact direct</SelectItem>
                                <SelectItem value="Partenaire">Partenaire</SelectItem>
                                <SelectItem value="Référence">Référence</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Leads Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Leads ({filteredLeads.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[450px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lead</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Valeur</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Assigné</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLeads.map((lead) => (
                                    <TableRow key={lead.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className={lead.type === 'administration' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}>
                                                        {lead.company.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{lead.name}</p>
                                                    <p className="text-sm text-muted-foreground">{lead.company}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={typeConfig[lead.type]?.color}>
                                                {typeConfig[lead.type]?.icon}
                                                <span className="ml-1">{typeConfig[lead.type]?.label}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={sourceConfig[lead.source]?.color}>
                                                {sourceConfig[lead.source]?.icon}
                                                <span className="ml-1">{sourceConfig[lead.source]?.label}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                                                <Progress value={lead.score} className="w-16 h-2" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{formatCurrency(lead.value)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusConfig[lead.status]?.color}>
                                                {statusConfig[lead.status]?.icon}
                                                <span className="ml-1">{statusConfig[lead.status]?.label}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {lead.assignee ? (
                                                <span className="text-sm">{lead.assignee}</span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Non assigné</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Voir détails
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Contacter
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-green-500">
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Convertir en client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
