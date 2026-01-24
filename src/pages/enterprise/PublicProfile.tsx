import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Globe, Building, Upload, ExternalLink, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PublicProfile() {
    const { toast } = useToast();
    const [profile, setProfile] = useState({
        name: 'TechCorp Africa',
        industry: 'Technology',
        website: 'https://techcorp.africa',
        description: 'Leading provider of digital solutions across the continent. We specialize in fintech, agri-tech, and e-governance systems.',
    });

    const handleSave = () => {
        toast({
            title: "Profil mis à jour",
            description: "Vos modifications ont été enregistrées avec succès.",
        });
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">Espace Public</h1>
                    <p className="text-sm text-muted-foreground">Apparence publique de l'entreprise</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Voir
                    </Button>
                    <Button size="sm" onClick={handleSave} className="gap-2 bg-gradient-to-r from-primary to-secondary">
                        <Save className="w-4 h-4" />
                        Enregistrer
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4 h-full min-h-0">
                {/* Form Section */}
                <Card className="glass-card flex flex-col min-h-0 overflow-hidden">
                    <CardHeader className="pb-3 shrink-0">
                        <CardTitle className="text-base">Édition du Profil</CardTitle>
                        <CardDescription className="text-xs">Modifiez les informations visibles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 overflow-y-auto pr-6 custom-scrollbar flex-1">
                        <div className="flex items-start gap-4 p-3 rounded-lg border bg-background/50">
                            <Avatar className="w-16 h-16 border-2 border-primary/20">
                                <AvatarImage src="/placeholder-logo.png" />
                                <AvatarFallback className="text-lg bg-primary/10 text-primary">TC</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs">Logo de l'entreprise</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-xs w-full sm:w-auto">
                                        <Upload className="w-3 h-3 mr-2" />
                                        Mettre à jour
                                    </Button>
                                    <p className="text-[10px] text-muted-foreground self-center hidden sm:block">Max 2MB. JPG/PNG.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Nom</Label>
                                <div className="relative">
                                    <Building className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        className="pl-8 h-9 text-sm"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Secteur</Label>
                                <Input
                                    className="h-9 text-sm"
                                    value={profile.industry}
                                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Site Web</Label>
                            <div className="relative">
                                <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="pl-8 h-9 text-sm"
                                    value={profile.website}
                                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 flex-1 flex flex-col min-h-[100px]">
                            <Label className="text-xs">Description</Label>
                            <Textarea
                                className="flex-1 min-h-[120px] text-sm resize-none"
                                value={profile.description}
                                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card className="glass-card bg-muted/20 flex flex-col min-h-0">
                    <CardHeader className="pb-3 shrink-0">
                        <CardTitle className="text-base">Aperçu en Direct</CardTitle>
                        <CardDescription className="text-xs">Rendu final sur la place de marché</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center p-4">
                        <div className="bg-background rounded-xl p-5 border shadow-sm w-full max-w-sm mx-auto transform transition-all hover:scale-[1.02] duration-300">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/10">
                                    TC
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base truncate">{profile.name}</h3>
                                    <p className="text-xs text-muted-foreground bg-secondary/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                        {profile.industry}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-foreground/80 mb-6 leading-relaxed line-clamp-4">
                                {profile.description}
                            </p>

                            <div className="pt-4 border-t flex items-center justify-between">
                                <a href="#" className="flex items-center text-xs text-blue-500 hover:underline">
                                    <Globe className="w-3 h-3 mr-1.5" />
                                    {profile.website.replace('https://', '')}
                                </a>
                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                    Contacter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
