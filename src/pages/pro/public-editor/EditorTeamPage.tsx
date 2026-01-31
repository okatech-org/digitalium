/**
 * EditorTeamPage - Team section configuration
 */

import React from 'react';
import {
    Users,
    Plus,
    Trash2,
    GripVertical,
    Sparkles,
    Linkedin,
    Mail,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';
import ImageUploader from '@/components/public-page/ImageUploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function EditorTeamPage() {
    const { config, updateSection, toggleSection } = usePublicPageEditorStore();

    if (!config) return <div className="p-6">Chargement...</div>;

    const { team, theme } = config;

    const updateTeam = (updates: Partial<typeof team>) => {
        updateSection('team', updates);
    };

    const addMember = () => {
        updateTeam({
            members: [
                ...team.members,
                {
                    id: crypto.randomUUID(),
                    name: '',
                    role: '',
                    photo: null,
                },
            ],
        });
    };

    const removeMember = (id: string) => {
        updateTeam({ members: team.members.filter((m) => m.id !== id) });
    };

    const updateMember = (id: string, field: string, value: any) => {
        updateTeam({
            members: team.members.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
        });
    };

    return (
        <div className="flex gap-6 h-full">
            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Équipe
                        </h1>
                        <p className="text-muted-foreground">
                            Présentez votre équipe dirigeante
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Label>Activer</Label>
                        <Switch
                            checked={team.enabled}
                            onCheckedChange={(checked) => toggleSection('team', checked)}
                        />
                    </div>
                </div>

                {!team.enabled ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Section désactivée.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Config */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Titre</Label>
                                        <Input
                                            value={team.title}
                                            onChange={(e) => updateTeam({ title: e.target.value })}
                                            placeholder="Notre Équipe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sous-titre</Label>
                                        <Input
                                            value={team.subtitle}
                                            onChange={(e) => updateTeam({ subtitle: e.target.value })}
                                            placeholder="Les personnes derrière notre succès"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Disposition</Label>
                                    <div className="flex gap-2">
                                        {(['grid', 'carousel', 'featured'] as const).map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => updateTeam({ layout: l })}
                                                className={cn(
                                                    'flex-1 py-2 px-3 rounded-lg border transition-all text-sm capitalize',
                                                    team.layout === l
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                )}
                                            >
                                                {l === 'featured' ? 'Mise en avant' : l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <p className="font-medium">Afficher uniquement les dirigeants</p>
                                        <p className="text-sm text-muted-foreground">
                                            Filtrer les membres par rôle de direction
                                        </p>
                                    </div>
                                    <Switch
                                        checked={team.showLeadership}
                                        onCheckedChange={(checked) => updateTeam({ showLeadership: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Members */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Membres de l'Équipe</CardTitle>
                                <CardDescription>
                                    {team.members.length} membre(s) ajouté(s)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {team.members.map((member, index) => (
                                    <div key={member.id} className="p-4 rounded-xl border space-y-4">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                            <span className="text-sm text-muted-foreground">
                                                Membre {index + 1}
                                            </span>
                                            <div className="flex-1" />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMember(member.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid md:grid-cols-[120px_1fr] gap-4">
                                            <ImageUploader
                                                value={member.photo}
                                                onChange={(photo) => updateMember(member.id, 'photo', photo)}
                                                aspectRatio="square"
                                                maxHeight="120px"
                                            />

                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <Label>Nom complet</Label>
                                                    <Input
                                                        value={member.name}
                                                        onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                                        placeholder="Jean Dupont"
                                                    />
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label>Poste</Label>
                                                        <Input
                                                            value={member.role}
                                                            onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                                                            placeholder="Directeur Général"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Département</Label>
                                                        <Input
                                                            value={member.department || ''}
                                                            onChange={(e) => updateMember(member.id, 'department', e.target.value)}
                                                            placeholder="Direction"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Bio (optionnel)</Label>
                                                    <Textarea
                                                        value={member.bio || ''}
                                                        onChange={(e) => updateMember(member.id, 'bio', e.target.value)}
                                                        placeholder="Courte biographie..."
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button variant="outline" onClick={addMember} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" /> Ajouter un membre
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Preview */}
            <div className="w-[400px] border-l bg-muted/30 overflow-auto">
                <div className="sticky top-0 p-4 bg-background border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Aperçu
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>
                            {team.title || 'Notre Équipe'}
                        </h2>
                        {team.subtitle && (
                            <p className="text-sm text-muted-foreground">{team.subtitle}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {team.members.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center col-span-2">
                                Aucun membre ajouté
                            </p>
                        ) : (
                            team.members.map((m) => (
                                <div
                                    key={m.id}
                                    className="p-4 rounded-xl text-center"
                                    style={{ backgroundColor: theme.colors.card }}
                                >
                                    <Avatar className="w-16 h-16 mx-auto mb-3">
                                        <AvatarImage src={m.photo?.url} />
                                        <AvatarFallback style={{ backgroundColor: theme.colors.primary + '20' }}>
                                            {m.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-semibold text-sm" style={{ color: theme.colors.cardForeground }}>
                                        {m.name || 'Nom'}
                                    </h3>
                                    <p className="text-xs" style={{ color: theme.colors.primary }}>
                                        {m.role || 'Poste'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
