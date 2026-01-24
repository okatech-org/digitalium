/**
 * CompanyPublicPage - Public company profile page
 * Accessible at /p/:slug - Shows company info to public visitors
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Globe,
    Building2,
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    Calendar,
    Users,
    FileText,
    Download,
    Share2,
    Copy,
    Check,
    ArrowLeft,
    Linkedin,
    Facebook,
    Twitter,
    Instagram,
    Shield,
    Award,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface CompanyProfile {
    id: string;
    slug: string;
    name: string;
    logo?: string;
    coverImage?: string;
    description: string;
    longDescription?: string;
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
    certifications?: string[];
    publicDocuments?: Array<{
        id: string;
        name: string;
        type: string;
        size: string;
        uploadedAt: number;
    }>;
    stats?: {
        documentsArchived: number;
        yearsActive: number;
        teamSize: number;
    };
    isVerified?: boolean;
}

// Mock data - in production this would come from an API
const MOCK_COMPANY: CompanyProfile = {
    id: '1',
    slug: 'entreprise-demo',
    name: 'Entreprise Demo SARL',
    description: 'Entreprise innovante spécialisée dans les solutions numériques pour l\'Afrique.',
    longDescription: `Fondée en 2018, Entreprise Demo SARL est un leader dans le développement de solutions technologiques adaptées au marché africain.

Notre équipe de professionnels passionnés travaille chaque jour pour offrir des outils numériques performants et accessibles à toutes les entreprises du continent.

Nous sommes fiers de notre engagement envers l'excellence et l'innovation, tout en restant profondément ancrés dans les valeurs africaines de solidarité et de partage.`,
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
        twitter: 'https://twitter.com/entreprisedemo',
    },
    certifications: ['ISO 27001', 'RGPD Compliant', 'OHADA'],
    publicDocuments: [
        { id: '1', name: 'Présentation Entreprise 2025', type: 'PDF', size: '2.4 MB', uploadedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 },
        { id: '2', name: 'Catalogue de Services', type: 'PDF', size: '1.8 MB', uploadedAt: Date.now() - 60 * 24 * 60 * 60 * 1000 },
    ],
    stats: {
        documentsArchived: 1247,
        yearsActive: 7,
        teamSize: 24,
    },
    isVerified: true,
};

export default function CompanyPublicPage() {
    const { slug } = useParams<{ slug: string }>();
    const [company, setCompany] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Simulate API fetch
        const fetchCompany = async () => {
            setLoading(true);
            try {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 500));

                if (slug === 'entreprise-demo' || slug === 'demo') {
                    setCompany(MOCK_COMPANY);
                } else {
                    setError('Entreprise non trouvée');
                }
            } catch (err) {
                setError('Erreur lors du chargement');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [slug]);

    const shareUrl = window.location.href;

    const copyLink = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="max-w-md text-center p-8">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-xl font-bold mb-2">Entreprise non trouvée</h1>
                    <p className="text-muted-foreground mb-6">
                        Cette page n'existe pas ou n'est plus disponible.
                    </p>
                    <Button asChild>
                        <Link to="/">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour à l'accueil
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm">DIGITALIUM</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={copyLink}>
                            {copied ? (
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4 mr-2" />
                            )}
                            Partager
                        </Button>
                    </div>
                </div>
            </header>

            {/* Cover Image */}
            <div className="relative pt-14">
                <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-purple-500/20 to-transparent">
                    {company.coverImage && (
                        <img
                            src={company.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Company Avatar */}
                <div className="max-w-6xl mx-auto px-4">
                    <div className="relative -mt-16 md:-mt-20">
                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
                            <AvatarImage src={company.logo} />
                            <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-purple-600 text-white">
                                {company.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Company Name & Badges */}
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-bold">{company.name}</h1>
                                {company.isVerified && (
                                    <Badge className="bg-blue-500/10 text-blue-500">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Vérifié
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1">{company.industry}</p>
                        </div>

                        {/* Quick Stats */}
                        {company.stats && (
                            <div className="grid grid-cols-3 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-center p-4 rounded-lg bg-muted/50"
                                >
                                    <p className="text-2xl font-bold text-primary">
                                        {company.stats.yearsActive}+
                                    </p>
                                    <p className="text-xs text-muted-foreground">Années d'activité</p>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center p-4 rounded-lg bg-muted/50"
                                >
                                    <p className="text-2xl font-bold text-primary">
                                        {company.stats.teamSize}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Employés</p>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center p-4 rounded-lg bg-muted/50"
                                >
                                    <p className="text-2xl font-bold text-primary">
                                        {company.stats.documentsArchived.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Documents archivés</p>
                                </motion.div>
                            </div>
                        )}

                        {/* Tabs */}
                        <Tabs defaultValue="about" className="w-full">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="about">À propos</TabsTrigger>
                                {company.publicDocuments && company.publicDocuments.length > 0 && (
                                    <TabsTrigger value="documents">Documents</TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="about" className="mt-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-4">Présentation</h3>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            {(company.longDescription || company.description).split('\n\n').map((para, i) => (
                                                <p key={i} className="mb-4 text-muted-foreground">
                                                    {para}
                                                </p>
                                            ))}
                                        </div>

                                        {/* Certifications */}
                                        {company.certifications && company.certifications.length > 0 && (
                                            <>
                                                <Separator className="my-6" />
                                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                                    <Award className="h-4 w-4" />
                                                    Certifications
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {company.certifications.map((cert, i) => (
                                                        <Badge key={i} variant="outline">
                                                            {cert}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="documents" className="mt-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-4">Documents publics</h3>
                                        <div className="space-y-3">
                                            {company.publicDocuments?.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{doc.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {doc.type} • {doc.size}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Contact Info */}
                    <div className="space-y-4">
                        {/* Contact Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                    >
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{company.website.replace('https://', '')}</span>
                                        <ExternalLink className="h-3 w-3 ml-auto" />
                                    </a>
                                )}
                                {company.email && (
                                    <a
                                        href={`mailto:${company.email}`}
                                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                    >
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{company.email}</span>
                                    </a>
                                )}
                                {company.phone && (
                                    <a
                                        href={`tel:${company.phone}`}
                                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                    >
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{company.phone}</span>
                                    </a>
                                )}
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span>
                                        {company.address.street}<br />
                                        {company.address.city}, {company.address.country}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Détails</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>{company.industry}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{company.size}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Fondée en {company.founded}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Links */}
                        {(company.social.linkedin || company.social.facebook || company.social.twitter || company.social.instagram) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Réseaux sociaux</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        {company.social.linkedin && (
                                            <Button variant="outline" size="icon" asChild>
                                                <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer">
                                                    <Linkedin className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {company.social.facebook && (
                                            <Button variant="outline" size="icon" asChild>
                                                <a href={company.social.facebook} target="_blank" rel="noopener noreferrer">
                                                    <Facebook className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {company.social.twitter && (
                                            <Button variant="outline" size="icon" asChild>
                                                <a href={company.social.twitter} target="_blank" rel="noopener noreferrer">
                                                    <Twitter className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {company.social.instagram && (
                                            <Button variant="outline" size="icon" asChild>
                                                <a href={company.social.instagram} target="_blank" rel="noopener noreferrer">
                                                    <Instagram className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Powered by */}
                        <div className="text-center py-4">
                            <p className="text-xs text-muted-foreground">
                                Propulsé par{' '}
                                <Link to="/" className="text-primary hover:underline">
                                    DIGITALIUM
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
