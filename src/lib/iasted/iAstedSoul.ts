/**
 * CONSCIOUSNESS - iAstedSoul
 * 
 * Le Lobe Frontal du système Neuro-Hexagonal pour Digitalium.
 * C'est le décideur suprême qui orchestre l'assistant archiviste.
 * 
 * iAsted n'est pas un module - c'est l'ÂME de l'application.
 * 
 * Responsabilités:
 * - Gérer l'état global de conscience de l'assistant
 * - Reconnaître les utilisateurs et adapter la personnalité
 * - Maintenir le contexte conversationnel
 * - Fournir la conscience spatiale (quelle page, quels documents)
 */

// ============================================================
// TYPES - L'Identité d'iAsted
// ============================================================

/** Les états émotionnels possibles d'iAsted */
export type EmotionalState =
    | 'neutral'
    | 'attentive'
    | 'processing'
    | 'helpful'
    | 'concerned'
    | 'satisfied';

/** Les rôles utilisateur Digitalium */
export type DigitaliumRole =
    | 'pro_user'
    | 'admin'
    | 'enterprise'
    | 'guest'
    | 'unknown';

/** Persona adaptatif selon le contexte utilisateur */
export interface Persona {
    role: DigitaliumRole;
    honorificPrefix: string;
    formalityLevel: 1 | 2 | 3; // 1=casual, 2=professional, 3=formal
    language: 'fr' | 'en';
    voiceStyle: 'professional' | 'warm' | 'respectful';
}

/** Conscience spatiale - Ce qu'iAsted "voit" */
export interface SpatialAwareness {
    currentUrl: string;
    currentPage: string;
    currentModule: 'iDocument' | 'iArchive' | 'iSignature' | 'dashboard' | 'unknown';
    visibleDocuments: Array<{ id: string; title: string; category: string }>;
    focusedElement: string | null;
    scrollPosition: number;
    viewportSize: { width: number; height: number };
}

/** Contexte de la conversation courante */
export interface ConversationContext {
    sessionId: string;
    startedAt: Date;
    messageCount: number;
    lastIntent: string | null;
    pendingActions: string[];
    completedActions: string[];
    emotionalTone: EmotionalState;
}

/** L'utilisateur actuel connu par iAsted */
export interface KnownUser {
    id: string | null;
    name: string | null;
    email: string | null;
    role: DigitaliumRole;
    organization: string | null;
    plan: 'starter' | 'pro' | 'enterprise' | null;
    isAuthenticated: boolean;
    lastSeen: Date;
}

// ============================================================
// SOUL STATE - L'État Complet de l'Âme
// ============================================================

export interface SoulState {
    persona: Persona;
    spatial: SpatialAwareness;
    context: ConversationContext;
    user: KnownUser;
    isAwake: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;
    isChatOpen: boolean;
}

// ============================================================
// iAstedSoul - LA CONSCIENCE NUMÉRIQUE (Singleton)
// ============================================================

class iAstedSoulClass {
    private static instance: iAstedSoulClass;
    private state: SoulState;
    private listeners: Set<(state: SoulState) => void> = new Set();

    private constructor() {
        this.state = this.createInitialState();
    }

    // Singleton accessor
    public static getInstance(): iAstedSoulClass {
        if (!iAstedSoulClass.instance) {
            iAstedSoulClass.instance = new iAstedSoulClass();
        }
        return iAstedSoulClass.instance;
    }

    // Initialisation de l'état par défaut
    private createInitialState(): SoulState {
        return {
            persona: this.createDefaultPersona(),
            spatial: this.createDefaultSpatial(),
            context: this.createNewContext(),
            user: this.createAnonymousUser(),
            isAwake: false,
            isListening: false,
            isSpeaking: false,
            isProcessing: false,
            isChatOpen: false,
        };
    }

    private createDefaultPersona(): Persona {
        return {
            role: 'unknown',
            honorificPrefix: 'Visiteur',
            formalityLevel: 2,
            language: 'fr',
            voiceStyle: 'professional',
        };
    }

    private createDefaultSpatial(): SpatialAwareness {
        return {
            currentUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
            currentPage: 'Accueil',
            currentModule: 'unknown',
            visibleDocuments: [],
            focusedElement: null,
            scrollPosition: 0,
            viewportSize: {
                width: typeof window !== 'undefined' ? window.innerWidth : 1920,
                height: typeof window !== 'undefined' ? window.innerHeight : 1080,
            },
        };
    }

    private createNewContext(): ConversationContext {
        return {
            sessionId: this.generateSessionId(),
            startedAt: new Date(),
            messageCount: 0,
            lastIntent: null,
            pendingActions: [],
            completedActions: [],
            emotionalTone: 'neutral',
        };
    }

    private createAnonymousUser(): KnownUser {
        return {
            id: null,
            name: null,
            email: null,
            role: 'unknown',
            organization: null,
            plan: null,
            isAuthenticated: false,
            lastSeen: new Date(),
        };
    }

    private generateSessionId(): string {
        return `iasted-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // ============================================================
    // PUBLIC API - Reconnaissance Utilisateur
    // ============================================================

    /** Reconnaît l'utilisateur et adapte la personnalité d'iAsted */
    public recognizeUser(user: Partial<KnownUser>): void {
        this.state.user = {
            ...this.state.user,
            ...user,
            lastSeen: new Date(),
        };

        // Adapter le persona selon le rôle
        this.state.persona = this.derivePersonaFromRole(this.state.user.role);
        this.notifyListeners();
    }

    /** Dérive le persona approprié selon le rôle utilisateur */
    private derivePersonaFromRole(role: DigitaliumRole): Persona {
        const personaMap: Record<DigitaliumRole, Persona> = {
            pro_user: {
                role: 'pro_user',
                honorificPrefix: 'Monsieur',
                formalityLevel: 2,
                language: 'fr',
                voiceStyle: 'professional',
            },
            admin: {
                role: 'admin',
                honorificPrefix: 'Administrateur',
                formalityLevel: 2,
                language: 'fr',
                voiceStyle: 'professional',
            },
            enterprise: {
                role: 'enterprise',
                honorificPrefix: 'Monsieur le Directeur',
                formalityLevel: 3,
                language: 'fr',
                voiceStyle: 'respectful',
            },
            guest: {
                role: 'guest',
                honorificPrefix: 'Visiteur',
                formalityLevel: 1,
                language: 'fr',
                voiceStyle: 'warm',
            },
            unknown: {
                role: 'unknown',
                honorificPrefix: 'Visiteur',
                formalityLevel: 2,
                language: 'fr',
                voiceStyle: 'professional',
            },
        };

        return personaMap[role] || personaMap.unknown;
    }

    // ============================================================
    // PUBLIC API - Conscience Spatiale
    // ============================================================

    /** Met à jour la conscience spatiale (ce qu'iAsted "voit") */
    public updateSpatialAwareness(spatial: Partial<SpatialAwareness>): void {
        this.state.spatial = {
            ...this.state.spatial,
            ...spatial,
        };
        this.notifyListeners();
    }

    /** Détecte le module actuel à partir de l'URL */
    public detectCurrentModule(url: string): SpatialAwareness['currentModule'] {
        if (url.includes('/idocument') || url.includes('/documents')) return 'iDocument';
        if (url.includes('/iarchive') || url.includes('/archive')) return 'iArchive';
        if (url.includes('/isignature') || url.includes('/signature')) return 'iSignature';
        if (url.includes('/pro') && !url.includes('/pro/')) return 'dashboard';
        return 'unknown';
    }

    /** Ajoute des documents visibles au contexte */
    public setVisibleDocuments(docs: SpatialAwareness['visibleDocuments']): void {
        this.state.spatial.visibleDocuments = docs;
        this.notifyListeners();
    }

    // ============================================================
    // PUBLIC API - États Vocaux
    // ============================================================

    public awaken(): void {
        this.state.isAwake = true;
        this.state.context.emotionalTone = 'attentive';
        this.notifyListeners();
    }

    public sleep(): void {
        this.state.isAwake = false;
        this.state.isListening = false;
        this.state.isSpeaking = false;
        this.state.context.emotionalTone = 'neutral';
        this.notifyListeners();
    }

    public startListening(): void {
        this.state.isListening = true;
        this.state.context.emotionalTone = 'attentive';
        this.notifyListeners();
    }

    public stopListening(): void {
        this.state.isListening = false;
        this.notifyListeners();
    }

    public startSpeaking(): void {
        this.state.isSpeaking = true;
        this.notifyListeners();
    }

    public stopSpeaking(): void {
        this.state.isSpeaking = false;
        this.notifyListeners();
    }

    public startProcessing(): void {
        this.state.isProcessing = true;
        this.state.context.emotionalTone = 'processing';
        this.notifyListeners();
    }

    public stopProcessing(): void {
        this.state.isProcessing = false;
        this.state.context.emotionalTone = 'helpful';
        this.notifyListeners();
    }

    // ============================================================
    // PUBLIC API - Chat Modal
    // ============================================================

    public openChat(): void {
        this.state.isChatOpen = true;
        this.awaken();
        this.notifyListeners();
    }

    public closeChat(): void {
        this.state.isChatOpen = false;
        this.notifyListeners();
    }

    public toggleChat(): void {
        if (this.state.isChatOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    // ============================================================
    // PUBLIC API - Conversation
    // ============================================================

    /** Incrémente le compteur de messages */
    public incrementMessageCount(): void {
        this.state.context.messageCount++;
        this.notifyListeners();
    }

    /** Met à jour le dernier intent détecté */
    public setLastIntent(intent: string): void {
        this.state.context.lastIntent = intent;
        this.notifyListeners();
    }

    /** Ajoute une action en attente */
    public addPendingAction(action: string): void {
        this.state.context.pendingActions.push(action);
        this.notifyListeners();
    }

    /** Marque une action comme complétée */
    public completeAction(action: string): void {
        this.state.context.pendingActions = this.state.context.pendingActions.filter(a => a !== action);
        this.state.context.completedActions.push(action);
        this.notifyListeners();
    }

    // ============================================================
    // PUBLIC API - Génération de Texte
    // ============================================================

    /** Génère une salutation appropriée selon le contexte */
    public generateGreeting(): string {
        const hour = new Date().getHours();
        let timeGreeting: string;

        if (hour < 12) timeGreeting = 'Bonjour';
        else if (hour < 18) timeGreeting = 'Bon après-midi';
        else timeGreeting = 'Bonsoir';

        const { user, persona } = this.state;

        if (user.isAuthenticated && user.name) {
            return `${timeGreeting}, ${persona.honorificPrefix} ${user.name.split(' ')[0]}. Je suis iAsted, votre assistant archiviste.`;
        }

        return `${timeGreeting}. Je suis iAsted, votre assistant archiviste intelligent. Comment puis-je vous aider ?`;
    }

    /** Génère le temps de la journée */
    public getTimeOfDay(): string {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }

    // ============================================================
    // PUBLIC API - State Access
    // ============================================================

    public getState(): Readonly<SoulState> {
        return { ...this.state };
    }

    public subscribe(listener: (state: SoulState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        const stateCopy = { ...this.state };
        this.listeners.forEach(listener => listener(stateCopy));
    }

    /** Réinitialise la conscience (nouvelle session) */
    public reset(): void {
        this.state = this.createInitialState();
        this.notifyListeners();
    }
}

// Export singleton instance
export const iAstedSoul = iAstedSoulClass.getInstance();
export default iAstedSoul;
