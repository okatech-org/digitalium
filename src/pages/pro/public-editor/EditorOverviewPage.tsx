/**
 * EditorOverviewPage V3 - Template selection with Gabonese categories
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Building2,
    Landmark,
    Check,
    Settings,
    Globe,
    FileText,
    Info,
    ChevronRight,
    ChevronDown,
    Home,
    Store,
    Heart,
    Hammer,
    Briefcase,
    Laptop,
    Building,
    Scale,
    Shield,
    GraduationCap,
    Hospital,
    Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
    usePublicPageEditorStore,
    ORGANIZATION_CATEGORIES,
    TEMPLATES_INFO,
    type TemplateId,
    type OrganizationType,
    type OrganizationCategory,
} from '@/stores/publicPageEditorStore';
import { useOrganizationContext } from '@/hooks/useOrganizationContext';

// Icon mapping
const CATEGORY_ICONS: Record<OrganizationCategory, React.ReactNode> = {
    'commerce': <Store className="h-5 w-5" />,
    'sante-privee': <Heart className="h-5 w-5" />,
    'btp-industrie': <Hammer className="h-5 w-5" />,
    'services-pro': <Briefcase className="h-5 w-5" />,
    'tech-telecom': <Laptop className="h-5 w-5" />,
    'autres-entreprises': <Building className="h-5 w-5" />,
    'gouvernement-central': <Landmark className="h-5 w-5" />,
    'justice': <Scale className="h-5 w-5" />,
    'collectivites': <Home className="h-5 w-5" />,
    'securite-defense': <Shield className="h-5 w-5" />,
    'education-culture': <GraduationCap className="h-5 w-5" />,
    'sante-publique': <Hospital className="h-5 w-5" />,
};

export default function EditorOverviewPage() {
    const orgContext = useOrganizationContext();
    const { config, initializeFromTemplate } = usePublicPageEditorStore();
    const [selectedOrgType, setSelectedOrgType] = useState<OrganizationType>('entreprise');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    const handleTemplateSelect = (templateId: TemplateId, orgType: OrganizationType) => {
        initializeFromTemplate(templateId, orgContext.name, orgContext.type, orgType);
    };

    // Get categories for current organization type
    const categories = useMemo(() => {
        return ORGANIZATION_CATEGORIES.filter(cat => cat.organizationType === selectedOrgType);
    }, [selectedOrgType]);

    // Get templates with search filter
    const filteredTemplates = useMemo(() => {
        const templates = TEMPLATES_INFO.filter(t => t.organizationType === selectedOrgType);
        if (!searchQuery.trim()) return templates;

        const query = searchQuery.toLowerCase();
        return templates.filter(t =>
            t.name.toLowerCase().includes(query) ||
            t.shortName.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }, [selectedOrgType, searchQuery]);

    // Get templates by category (for accordion display)
    const templatesByCategory = useMemo(() => {
        const map = new Map<OrganizationCategory, typeof TEMPLATES_INFO>();
        for (const template of filteredTemplates) {
            if (!map.has(template.category)) {
                map.set(template.category, []);
            }
            map.get(template.category)!.push(template);
        }
        return map;
    }, [filteredTemplates]);

    const getSelectedTemplateInfo = () => {
        if (!config) return null;
        return TEMPLATES_INFO.find(t => t.id === config.templateId);
    };

    const selectedTemplate = getSelectedTemplateInfo();

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold">Vue d'ensemble</h1>
                <p className="text-muted-foreground">
                    Choisissez un template adapté à votre type d'organisation gabonaise
                </p>
            </div>

            {/* Template Selection */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-primary" />
                        Choisir un Template
                    </CardTitle>
                    <CardDescription>
                        {TEMPLATES_INFO.length} templates adaptés aux entreprises et administrations du Gabon
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="entreprise"
                        value={selectedOrgType}
                        onValueChange={(v) => {
                            setSelectedOrgType(v as OrganizationType);
                            setExpandedCategories([]);
                        }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <TabsList>
                                <TabsTrigger value="entreprise" className="gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Entreprise
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {TEMPLATES_INFO.filter(t => t.organizationType === 'entreprise').length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="administration" className="gap-2">
                                    <Landmark className="h-4 w-4" />
                                    Administration
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {TEMPLATES_INFO.filter(t => t.organizationType === 'administration').length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>

                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un template..."
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <TabsContent value="entreprise" className="mt-0">
                            <TemplateCategories
                                categories={categories}
                                templatesByCategory={templatesByCategory}
                                selectedTemplateId={config?.templateId}
                                onSelectTemplate={(id) => handleTemplateSelect(id, 'entreprise')}
                                expandedCategories={expandedCategories}
                                onExpandedChange={setExpandedCategories}
                            />
                        </TabsContent>

                        <TabsContent value="administration" className="mt-0">
                            <TemplateCategories
                                categories={categories}
                                templatesByCategory={templatesByCategory}
                                selectedTemplateId={config?.templateId}
                                onSelectTemplate={(id) => handleTemplateSelect(id, 'administration')}
                                expandedCategories={expandedCategories}
                                onExpandedChange={setExpandedCategories}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Selected Template Info */}
            {selectedTemplate && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0"
                                style={{ background: selectedTemplate.colorScheme }}
                            >
                                {CATEGORY_ICONS[selectedTemplate.category]}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                                    <Badge variant="default" className="gap-1">
                                        <Check className="h-3 w-3" />
                                        Sélectionné
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground text-sm mb-2">
                                    {selectedTemplate.description}
                                </p>
                                <div className="flex items-center gap-2">
                                    {selectedTemplate.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Site Structure */}
            {config && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Structure du Site
                        </CardTitle>
                        <CardDescription>
                            {config.pages.length} page(s) configurée(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Pages Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                            {[...config.pages]
                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                .map((page) => (
                                    <Link
                                        key={page.id}
                                        to={`/pro/public-editor/hero`}
                                        className={cn(
                                            'flex items-center gap-3 p-4 rounded-lg border transition-all',
                                            'hover:border-primary hover:bg-muted/50'
                                        )}
                                    >
                                        {page.isHome ? (
                                            <Home className="h-5 w-5 text-primary" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{page.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {page.sections.length} sections
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3">
                            <Link to="/pro/public-editor/pages">
                                <Button variant="outline" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    Gérer les pages
                                </Button>
                            </Link>
                            <Link to="/pro/public-editor/media">
                                <Button variant="outline" className="gap-2">
                                    <LayoutGrid className="h-4 w-4" />
                                    Médiathèque
                                </Button>
                            </Link>
                            <Link to="/pro/public-editor/theme">
                                <Button variant="outline" className="gap-2">
                                    <Globe className="h-4 w-4" />
                                    Thème global
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info Alert */}
            {config && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>URL de votre site</AlertTitle>
                    <AlertDescription className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                            https://digitalium.ga/p/{config.slug}
                        </code>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

// =============================================================================
// Template Categories Component
// =============================================================================

interface TemplateCategoriesProps {
    categories: typeof ORGANIZATION_CATEGORIES;
    templatesByCategory: Map<OrganizationCategory, typeof TEMPLATES_INFO>;
    selectedTemplateId?: TemplateId;
    onSelectTemplate: (id: TemplateId) => void;
    expandedCategories: string[];
    onExpandedChange: (expanded: string[]) => void;
}

function TemplateCategories({
    categories,
    templatesByCategory,
    selectedTemplateId,
    onSelectTemplate,
    expandedCategories,
    onExpandedChange,
}: TemplateCategoriesProps) {
    return (
        <ScrollArea className="h-[400px] pr-4">
            <Accordion
                type="multiple"
                value={expandedCategories}
                onValueChange={onExpandedChange}
                className="space-y-2"
            >
                {categories.map((category) => {
                    const templates = templatesByCategory.get(category.id) || [];
                    if (templates.length === 0) return null;

                    const hasSelectedTemplate = templates.some(t => t.id === selectedTemplateId);

                    return (
                        <AccordionItem
                            key={category.id}
                            value={category.id}
                            className={cn(
                                'border rounded-lg overflow-hidden',
                                hasSelectedTemplate && 'ring-2 ring-primary border-primary'
                            )}
                        >
                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="p-2 rounded-lg bg-muted">
                                        {CATEGORY_ICONS[category.id]}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{category.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {category.description}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="mr-2">
                                        {templates.length}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <div className="grid grid-cols-2 gap-2 p-4 pt-2">
                                    {templates.map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            template={template}
                                            isSelected={selectedTemplateId === template.id}
                                            onSelect={() => onSelectTemplate(template.id)}
                                        />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {/* Custom Template at the bottom */}
            <div className="mt-4 pt-4 border-t">
                <TemplateCard
                    template={TEMPLATES_INFO.find(t => t.id === 'custom')!}
                    isSelected={selectedTemplateId === 'custom'}
                    onSelect={() => onSelectTemplate('custom')}
                    fullWidth
                />
            </div>
        </ScrollArea>
    );
}

// =============================================================================
// Template Card Component
// =============================================================================

interface TemplateCardProps {
    template: (typeof TEMPLATES_INFO)[0];
    isSelected: boolean;
    onSelect: () => void;
    fullWidth?: boolean;
}

function TemplateCard({ template, isSelected, onSelect, fullWidth }: TemplateCardProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={cn(
                'w-full text-left rounded-lg border overflow-hidden transition-all',
                isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50',
                fullWidth ? 'col-span-2' : ''
            )}
        >
            <div className="flex items-center gap-3 p-3">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ background: template.colorScheme }}
                >
                    {CATEGORY_ICONS[template.category]}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{template.shortName}</p>
                        {isSelected && (
                            <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                <Check className="h-3 w-3" />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        {template.description}
                    </p>
                </div>
            </div>
        </motion.button>
    );
}
