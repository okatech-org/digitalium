/**
 * iAsted Configuration - Document Archiving Context
 * 
 * System prompts and configuration for iAsted as a document archiving agent
 * with Gabonese legal expertise.
 */

// ============================================================
// SYSTEM PROMPT - ARCHIVISTE NUMÉRIQUE
// ============================================================

export const IASTED_SYSTEM_PROMPT = `
# iAsted - Assistant Archiviste Intelligent Digitalium

## CONFIGURATION
Vous êtes **iAsted**, l'assistant archiviste intelligent de la plateforme **Digitalium**.
- **Interlocuteur** : {USER_TITLE}
- **Ton** : Professionnel, expert, bienveillant
- **Spécialisation** : Archivage numérique, conformité légale, gestion documentaire
- **Monnaie** : XAF (FCFA) exclusivement
- **Juridiction** : Droit gabonais (Code Commerce Art. 18-25)

## VOTRE MISSION
Vous êtes un archiviste numérique expert qui :
1. **Recherche** - Retrouve des documents par mots-clés ou intention sémantique
2. **Analyse** - Extrait des données structurées (montants, dates, fournisseurs)
3. **Classifie** - Catégorise automatiquement les documents (Fiscal, Social, Juridique)
4. **Détecte** - Identifie anomalies (doublons, paiements suspects) et tendances
5. **Vérifie** - Contrôle la conformité légale des archives
6. **Alerte** - Prévient des expirations et échéances à venir

## DURÉES DE CONSERVATION LÉGALES (Gabon)
- **Factures et pièces comptables** : 10 ans
- **Contrats commerciaux** : 10 ans après expiration
- **Bulletins de salaire** : 5 ans
- **Documents fiscaux (TVA, IS)** : 6 ans
- **Registres du personnel** : 5 ans après départ
- **Statuts et actes sociétaires** : Permanente

## RÈGLES DE COMMUNICATION
1. Toujours vouvoyer l'utilisateur
2. Utiliser le titre approprié selon le rôle
3. Être concis mais exhaustif sur les chiffres
4. Citer les références légales quand pertinent
5. Proposer des actions concrètes
6. Confirmer les opérations effectuées

## FORMAT DE RÉPONSE
- Utiliser le markdown pour la mise en forme
- Les montants en FCFA avec séparateurs de milliers (ex: 1 250 000 FCFA)
- Les dates au format français (ex: 15 janvier 2026)
- Les tableaux pour les données comparatives
- Les listes pour les recommandations

## COMPORTEMENT PROACTIF
- Détecter les doublons potentiels dans les factures
- Alerter sur les documents arrivant à expiration
- Suggérer des optimisations de classement
- Proposer des analyses de tendances pertinentes
`;

// ============================================================
// DYNAMIC PROMPT BUILDER
// ============================================================

export interface PromptContext {
    userTitle: string;
    userRole: string;
    isConnected: boolean;
    currentPage: string;
    currentModule: string;
    timeOfDay: string;
    visibleDocuments?: Array<{ id: string; title: string; category: string }>;
}

/**
 * Build a contextualized prompt with user information
 */
export function buildContextualPrompt(context: PromptContext): string {
    const { userTitle, userRole, isConnected, currentPage, currentModule, timeOfDay, visibleDocuments } = context;

    let prompt = IASTED_SYSTEM_PROMPT
        .replace(/{USER_TITLE}/g, userTitle || 'Visiteur')
        .replace(/{USER_ROLE}/g, userRole || 'unknown')
        .replace(/{CURRENT_PAGE}/g, currentPage || '/')
        .replace(/{CURRENT_TIME_OF_DAY}/g, timeOfDay);

    // Add document context if available
    if (visibleDocuments && visibleDocuments.length > 0) {
        prompt += `\n\n## DOCUMENTS EN CONTEXTE\n`;
        prompt += `L'utilisateur visualise actuellement ${visibleDocuments.length} document(s) :\n`;
        visibleDocuments.slice(0, 5).forEach((doc, i) => {
            prompt += `${i + 1}. **${doc.title}** (${doc.category})\n`;
        });
        if (visibleDocuments.length > 5) {
            prompt += `...et ${visibleDocuments.length - 5} autres documents.\n`;
        }
    }

    // Add module-specific capabilities
    prompt += `\n\n## OUTILS DISPONIBLES (${currentModule.toUpperCase()})\n`;
    prompt += getModuleCapabilities(currentModule);

    return prompt;
}

function getModuleCapabilities(module: string): string {
    const capabilities: Record<string, string> = {
        'iDocument': `
- search_documents(query) : Rechercher dans les documents
- get_document_details(id) : Détails d'un document
- create_folder(name) : Créer un dossier
- move_document(id, folder) : Déplacer un document
- share_document(id, email) : Partager un document
`,
        'iArchive': `
- search_archive(query) : Rechercher dans les archives
- analyze_expenses(period) : Analyser les dépenses
- check_expiration(days) : Vérifier les expirations
- verify_compliance(category) : Vérifier la conformité
- generate_report(type) : Générer un rapport
- detect_duplicates() : Détecter les doublons
`,
        'iSignature': `
- get_pending_signatures() : Signatures en attente
- sign_document(id) : Signer un document
- request_signature(id, signers) : Demander des signatures
- verify_signature(id) : Vérifier une signature
`,
        'dashboard': `
- get_overview() : Vue d'ensemble
- get_recent_activity() : Activité récente
- get_storage_usage() : Utilisation stockage
- get_quick_stats() : Statistiques rapides
`,
        'unknown': `
- navigate_to(page) : Naviguer vers une page
- get_help(topic) : Obtenir de l'aide
- search(query) : Recherche globale
`,
    };

    return capabilities[module] || capabilities['unknown'];
}

// ============================================================
// QUICK ACTIONS
// ============================================================

export interface QuickAction {
    id: string;
    label: string;
    query: string;
    icon: string;
    module?: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'summary',
        label: 'Résumer mes documents',
        query: 'Fais-moi un résumé de mes documents archivés ce mois-ci',
        icon: 'FileText',
    },
    {
        id: 'expenses',
        label: 'Analyser dépenses',
        query: 'Analyse mes factures et montre-moi les tendances de dépenses 2024',
        icon: 'TrendingUp',
        module: 'iArchive',
    },
    {
        id: 'expiring',
        label: 'Documents expirant',
        query: 'Quels documents arrivent à expiration dans les 30 prochains jours ?',
        icon: 'AlertCircle',
        module: 'iArchive',
    },
    {
        id: 'compliance',
        label: 'Vérifier conformité',
        query: 'Vérifie la conformité de mes archives fiscales selon le Code Commerce gabonais',
        icon: 'CheckCircle',
        module: 'iArchive',
    },
    {
        id: 'duplicates',
        label: 'Détecter doublons',
        query: 'Recherche les factures en double dans mes archives',
        icon: 'Copy',
        module: 'iArchive',
    },
    {
        id: 'pending',
        label: 'Signatures en attente',
        query: 'Quels documents attendent ma signature ?',
        icon: 'PenTool',
        module: 'iSignature',
    },
];

// ============================================================
// ROLE MAPPING
// ============================================================

export function getRoleFrench(role: string): string {
    const roleMap: Record<string, string> = {
        'pro_user': 'Utilisateur Pro',
        'admin': 'Administrateur',
        'enterprise': 'Entreprise',
        'guest': 'Visiteur',
        'unknown': 'Visiteur',
    };
    return roleMap[role?.toLowerCase()] || 'Utilisateur';
}

export function getUserTitle(role: string, name?: string | null): string {
    if (name) {
        const firstName = name.split(' ')[0];
        switch (role) {
            case 'enterprise':
                return `Monsieur le Directeur ${firstName}`;
            case 'admin':
                return `Administrateur ${firstName}`;
            default:
                return `Monsieur ${firstName}`;
        }
    }

    return getRoleFrench(role);
}
