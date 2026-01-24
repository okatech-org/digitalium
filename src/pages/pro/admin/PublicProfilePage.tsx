/**
 * PublicProfilePage - Espace Public
 * Public company profile and sharing settings
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Globe,
    Building2,
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    Link as LinkIcon,
    Copy,
    Check,
    Edit,
    Eye,
    Image,
    QrCode,
    Share2,
    Facebook,
    Linkedin,
    Twitter,
    Instagram,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface CompanyProfile {
    name: string;
    slug: string;
    logo?: string;
    coverImage?: string;
    description: string;
    industry: string;
    size: string;
    founded: string;
    website?: string;
    email?: string;
    phone?: string;
    address: {
        street: string;
        city: string;
        country: string;
    };
    social: {
        linkedin?: string;
        facebook?: string;
        twitter?: string;
        instagram?: string;
    };
    isPublic: boolean;
    showContact: boolean;
    showDocuments: boolean;
}

const MOCK_PROFILE: CompanyProfile = {
    name: 'Entreprise Demo SARL',
    slug: 'entreprise-demo',
    description: 'Entreprise innovante spécialisée dans les solutions numériques pour l\'Afrique. Nous accompagnons les PME dans leur transformation digitale.',
    industry: 'Technologies',
    size: '10-50 employés',
    founded: '2018',
    website: 'https://entreprise-demo.ga',
    email: 'contact@entreprise-demo.ga',
    phone: '+241 01 23 45 67',
    address: {
        street: '123 Boulevard Triomphal',
        city: 'Libreville',
        country: 'Gabon',
    },
    social: {
        linkedin: 'https://linkedin.com/company/entreprise-demo',
        facebook: 'https://facebook.com/entreprisedemo',
    },
    isPublic: true,
    showContact: true,
    showDocuments: false,
};

export default function PublicProfilePage() {
    const [profile, setProfile] = useState(MOCK_PROFILE);
    const [activeTab, setActiveTab] = useState('edit');
    const [isCopied, setIsCopied] = useState(false);

    const publicUrl = `https://digitalium.ga/p/${profile.slug}`;

    const copyLink = async () => {
        await navigator.clipboard.writeText(publicUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const updateProfile = (updates: Partial<CompanyProfile>) => {
        setProfile({ ...profile, ...updates });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Espace Public</h1>
                    <p className="text-muted-foreground">
                        Configurez votre page entreprise publique
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir la page
                            <ExternalLink className="h-3 w-3 ml-2" />
                        </a>
                    </Button>
                    <Button>
                        <Check className="h-4 w-4 mr-2" />
                        Enregistrer
                    </Button>
                </div>
            </div>

            {/* Public URL */}
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">URL publique</p>
                            <p className="text-sm text-muted-foreground">{publicUrl}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copyLink}>
                                {isCopied ? (
                                    <Check className="h-4 w-4 mr-2 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                )}
                                Copier
                            </Button>
                            <Button variant="outline" size="icon">
                                <QrCode className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Visibility Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Visibilité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Page publique activée</p>
                            <p className="text-sm text-muted-foreground">
                                Votre page entreprise est visible sur internet
                            </p>
                        </div>
                        <Switch
                            checked={profile.isPublic}
                            onCheckedChange={(v) => updateProfile({ isPublic: v })}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Afficher les coordonnées</p>
                            <p className="text-sm text-muted-foreground">
                                Email, téléphone et adresse visibles
                            </p>
                        </div>
                        <Switch
                            checked={profile.showContact}
                            onCheckedChange={(v) => updateProfile({ showContact: v })}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Documents publics</p>
                            <p className="text-sm text-muted-foreground">
                                Partager certains documents sur la page publique
                            </p>
                        </div>
                        <Switch
                            checked={profile.showDocuments}
                            onCheckedChange={(v) => updateProfile({ showDocuments: v })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="edit">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                        <Eye className="h-4 w-4 mr-2" />
                        Aperçu
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-6 mt-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Informations générales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={profile.logo} />
                                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                            {profile.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline" size="sm">
                                        <Image className="h-4 w-4 mr-2" />
                                        Logo
                                    </Button>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nom de l'entreprise</Label>
                                            <Input
                                                value={profile.name}
                                                onChange={(e) => updateProfile({ name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>URL personnalisée</Label>
                                            <div className="flex">
                                                <span className="px-3 py-2 bg-muted rounded-l-md text-sm text-muted-foreground border border-r-0">
                                                    digitalium.ga/p/
                                                </span>
                                                <Input
                                                    className="rounded-l-none"
                                                    value={profile.slug}
                                                    onChange={(e) => updateProfile({ slug: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={profile.description}
                                            onChange={(e) => updateProfile({ description: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Secteur</Label>
                                            <Input
                                                value={profile.industry}
                                                onChange={(e) => updateProfile({ industry: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Taille</Label>
                                            <Input
                                                value={profile.size}
                                                onChange={(e) => updateProfile({ size: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Fondée en</Label>
                                            <Input
                                                value={profile.founded}
                                                onChange={(e) => updateProfile({ founded: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Coordonnées
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => updateProfile({ email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Téléphone</Label>
                                    <Input
                                        value={profile.phone}
                                        onChange={(e) => updateProfile({ phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Site web</Label>
                                    <Input
                                        value={profile.website}
                                        onChange={(e) => updateProfile({ website: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Adresse</Label>
                                    <Input
                                        value={`${profile.address.street}, ${profile.address.city}`}
                                        onChange={(e) => updateProfile({
                                            address: { ...profile.address, street: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Share2 className="h-4 w-4" />
                                Réseaux sociaux
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Linkedin className="h-4 w-4 text-blue-600" />
                                        LinkedIn
                                    </Label>
                                    <Input
                                        placeholder="https://linkedin.com/company/..."
                                        value={profile.social.linkedin || ''}
                                        onChange={(e) => updateProfile({
                                            social: { ...profile.social, linkedin: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Facebook className="h-4 w-4 text-blue-500" />
                                        Facebook
                                    </Label>
                                    <Input
                                        placeholder="https://facebook.com/..."
                                        value={profile.social.facebook || ''}
                                        onChange={(e) => updateProfile({
                                            social: { ...profile.social, facebook: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Twitter className="h-4 w-4" />
                                        X (Twitter)
                                    </Label>
                                    <Input
                                        placeholder="https://x.com/..."
                                        value={profile.social.twitter || ''}
                                        onChange={(e) => updateProfile({
                                            social: { ...profile.social, twitter: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Instagram className="h-4 w-4 text-pink-500" />
                                        Instagram
                                    </Label>
                                    <Input
                                        placeholder="https://instagram.com/..."
                                        value={profile.social.instagram || ''}
                                        onChange={(e) => updateProfile({
                                            social: { ...profile.social, instagram: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preview" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {/* Preview Header */}
                            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
                                <div className="absolute -bottom-10 left-6">
                                    <Avatar className="h-20 w-20 border-4 border-background">
                                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                            {profile.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>

                            <div className="pt-14 p-6">
                                <h2 className="text-xl font-bold">{profile.name}</h2>
                                <p className="text-muted-foreground">{profile.industry}</p>
                                <p className="mt-4 text-sm">{profile.description}</p>

                                <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {profile.address.city}, {profile.address.country}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Building2 className="h-4 w-4" />
                                        {profile.size}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Globe className="h-4 w-4" />
                                        Fondée en {profile.founded}
                                    </span>
                                </div>

                                {profile.showContact && (
                                    <div className="flex gap-4 mt-6">
                                        <Button variant="outline" size="sm">
                                            <Mail className="h-4 w-4 mr-2" />
                                            {profile.email}
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Phone className="h-4 w-4 mr-2" />
                                            {profile.phone}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
