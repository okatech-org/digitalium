/**
 * EditorContactPage - Contact section configuration
 */

import React from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Globe,
    Sparkles,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';

export default function EditorContactPage() {
    const { config, updateSection, toggleSection } = usePublicPageEditorStore();

    if (!config) return <div className="p-6">Chargement...</div>;

    const { contact, theme } = config;

    const updateContact = (updates: Partial<typeof contact>) => {
        updateSection('contact', updates);
    };

    const updateAddress = (field: string, value: string) => {
        updateContact({ address: { ...contact.address, [field]: value } });
    };

    const updateSocial = (platform: string, value: string) => {
        updateContact({ social: { ...contact.social, [platform]: value } });
    };

    return (
        <div className="flex gap-6 h-full">
            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Mail className="h-6 w-6 text-primary" />
                            Contact
                        </h1>
                        <p className="text-muted-foreground">
                            Informations de contact et formulaire
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Label>Activer</Label>
                        <Switch
                            checked={contact.enabled}
                            onCheckedChange={(checked) => toggleSection('contact', checked)}
                        />
                    </div>
                </div>

                {!contact.enabled ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Section désactivée.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Layout & Title */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Titre</Label>
                                        <Input
                                            value={contact.title}
                                            onChange={(e) => updateContact({ title: e.target.value })}
                                            placeholder="Contactez-nous"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sous-titre</Label>
                                        <Input
                                            value={contact.subtitle}
                                            onChange={(e) => updateContact({ subtitle: e.target.value })}
                                            placeholder="Nous sommes à votre écoute"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Disposition</Label>
                                    <div className="flex gap-2">
                                        {(['form-map', 'form-info', 'info-only', 'cards'] as const).map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => updateContact({ layout: l })}
                                                className={cn(
                                                    'flex-1 py-2 px-3 rounded-lg border transition-all text-sm',
                                                    contact.layout === l
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                )}
                                            >
                                                {l.replace('-', ' + ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <Label>Afficher le formulaire</Label>
                                        <Switch
                                            checked={contact.showForm}
                                            onCheckedChange={(checked) => updateContact({ showForm: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <Label>Afficher la carte</Label>
                                        <Switch
                                            checked={contact.showMap}
                                            onCheckedChange={(checked) => updateContact({ showMap: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Coordonnées
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Téléphone</Label>
                                        <Input
                                            value={contact.phone}
                                            onChange={(e) => updateContact({ phone: e.target.value })}
                                            placeholder="+241 01 XX XX XX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            value={contact.email}
                                            onChange={(e) => updateContact({ email: e.target.value })}
                                            placeholder="contact@example.com"
                                            type="email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Horaires</Label>
                                    <Input
                                        value={contact.hours || ''}
                                        onChange={(e) => updateContact({ hours: e.target.value })}
                                        placeholder="Lun-Ven: 8h-17h"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Adresse
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Rue</Label>
                                    <Input
                                        value={contact.address.street}
                                        onChange={(e) => updateAddress('street', e.target.value)}
                                        placeholder="123 Boulevard Triomphal"
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Ville</Label>
                                        <Input
                                            value={contact.address.city}
                                            onChange={(e) => updateAddress('city', e.target.value)}
                                            placeholder="Libreville"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Code postal</Label>
                                        <Input
                                            value={contact.address.postalCode || ''}
                                            onChange={(e) => updateAddress('postalCode', e.target.value)}
                                            placeholder="BP XXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pays</Label>
                                        <Input
                                            value={contact.address.country}
                                            onChange={(e) => updateAddress('country', e.target.value)}
                                            placeholder="Gabon"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Réseaux Sociaux
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                                    { key: 'facebook', icon: Facebook, label: 'Facebook' },
                                    { key: 'twitter', icon: Twitter, label: 'X (Twitter)' },
                                    { key: 'instagram', icon: Instagram, label: 'Instagram' },
                                    { key: 'youtube', icon: Youtube, label: 'YouTube' },
                                ].map(({ key, icon: Icon, label }) => (
                                    <div key={key} className="flex gap-3 items-center">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        <Input
                                            value={contact.social?.[key as keyof typeof contact.social] || ''}
                                            onChange={(e) => updateSocial(key, e.target.value)}
                                            placeholder={`URL ${label}`}
                                            className="flex-1"
                                        />
                                    </div>
                                ))}
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
                            {contact.title || 'Contact'}
                        </h2>
                        {contact.subtitle && (
                            <p className="text-sm text-muted-foreground">{contact.subtitle}</p>
                        )}
                    </div>

                    <div className="rounded-xl p-4" style={{ backgroundColor: theme.colors.card }}>
                        <div className="space-y-4">
                            {contact.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4" style={{ color: theme.colors.primary }} />
                                    <span className="text-sm">{contact.phone}</span>
                                </div>
                            )}
                            {contact.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4" style={{ color: theme.colors.primary }} />
                                    <span className="text-sm">{contact.email}</span>
                                </div>
                            )}
                            {contact.address.street && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 mt-0.5" style={{ color: theme.colors.primary }} />
                                    <div className="text-sm">
                                        <p>{contact.address.street}</p>
                                        <p>{contact.address.city}, {contact.address.country}</p>
                                    </div>
                                </div>
                            )}
                            {contact.hours && (
                                <div className="text-xs text-muted-foreground mt-2">
                                    🕐 {contact.hours}
                                </div>
                            )}
                        </div>
                    </div>

                    {contact.showForm && (
                        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: theme.colors.card }}>
                            <Input placeholder="Votre nom" className="bg-background/50" />
                            <Input placeholder="Votre email" className="bg-background/50" />
                            <Input placeholder="Message..." className="bg-background/50" />
                            <Button className="w-full" style={{ backgroundColor: theme.colors.primary }}>
                                Envoyer
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
