/**
 * CONSCIOUSNESS - useIAsted Hook
 * 
 * Hook React principal pour intégrer iAsted dans l'application Digitalium.
 * C'est l'interface publique de la Conscience Numérique.
 * 
 * Usage:
 * ```tsx
 * const { 
 *   isAwake, 
 *   isListening,
 *   isSpeaking,
 *   toggleChat,
 *   persona,
 * } = useIAsted();
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { iAstedSoul, SoulState, KnownUser, SpatialAwareness } from '@/lib/iasted/iAstedSoul';

// ============================================================
// TYPES
// ============================================================

export interface UseIAstedOptions {
    autoAwaken?: boolean;
    initialUser?: Partial<KnownUser>;
    enableVoice?: boolean;
}

export interface UseIAstedReturn {
    // State
    soulState: SoulState;
    isAwake: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;
    isChatOpen: boolean;
    persona: SoulState['persona'];
    currentModule: SpatialAwareness['currentModule'];
    visibleDocuments: SpatialAwareness['visibleDocuments'];

    // Actions - Lifecycle
    awaken: () => void;
    sleep: () => void;

    // Actions - Voice
    startListening: () => void;
    stopListening: () => void;
    startSpeaking: () => void;
    stopSpeaking: () => void;

    // Actions - Chat
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;

    // Actions - User
    setUser: (user: Partial<KnownUser>) => void;
    clearUser: () => void;

    // Actions - Context
    setVisibleDocuments: (docs: SpatialAwareness['visibleDocuments']) => void;
    updatePage: (url: string, pageName: string) => void;

    // Utilities
    getGreeting: () => string;
    getTimeOfDay: () => string;
    getContextSummary: () => string;
    resetConversation: () => void;
}

// ============================================================
// HOOK
// ============================================================

export function useIAsted(options: UseIAstedOptions = {}): UseIAstedReturn {
    const { autoAwaken = false, initialUser, enableVoice = false } = options;
    const location = useLocation();

    // Local state synced with soul
    const [soulState, setSoulState] = useState<SoulState>(iAstedSoul.getState());

    // Subscribe to soul state changes
    useEffect(() => {
        const unsubscribe = iAstedSoul.subscribe((newState) => {
            setSoulState(newState);
        });
        return unsubscribe;
    }, []);

    // Initialize with user if provided
    useEffect(() => {
        if (initialUser) {
            iAstedSoul.recognizeUser(initialUser);
        }
    }, [initialUser]);

    // Auto-awaken if enabled
    useEffect(() => {
        if (autoAwaken && !soulState.isAwake) {
            iAstedSoul.awaken();
        }
    }, [autoAwaken, soulState.isAwake]);

    // Track page changes
    useEffect(() => {
        const module = iAstedSoul.detectCurrentModule(location.pathname);
        const pageName = getPageNameFromPath(location.pathname);

        iAstedSoul.updateSpatialAwareness({
            currentUrl: location.pathname,
            currentPage: pageName,
            currentModule: module,
        });
    }, [location.pathname]);

    // ============================================================
    // ACTIONS
    // ============================================================

    const awaken = useCallback(() => iAstedSoul.awaken(), []);
    const sleep = useCallback(() => iAstedSoul.sleep(), []);

    const startListening = useCallback(() => iAstedSoul.startListening(), []);
    const stopListening = useCallback(() => iAstedSoul.stopListening(), []);
    const startSpeaking = useCallback(() => iAstedSoul.startSpeaking(), []);
    const stopSpeaking = useCallback(() => iAstedSoul.stopSpeaking(), []);

    const openChat = useCallback(() => iAstedSoul.openChat(), []);
    const closeChat = useCallback(() => iAstedSoul.closeChat(), []);
    const toggleChat = useCallback(() => iAstedSoul.toggleChat(), []);

    const setUser = useCallback((user: Partial<KnownUser>) => {
        iAstedSoul.recognizeUser(user);
    }, []);

    const clearUser = useCallback(() => {
        iAstedSoul.recognizeUser({
            id: null,
            name: null,
            email: null,
            role: 'unknown',
            organization: null,
            plan: null,
            isAuthenticated: false,
        });
    }, []);

    const setVisibleDocuments = useCallback((docs: SpatialAwareness['visibleDocuments']) => {
        iAstedSoul.setVisibleDocuments(docs);
    }, []);

    const updatePage = useCallback((url: string, pageName: string) => {
        const module = iAstedSoul.detectCurrentModule(url);
        iAstedSoul.updateSpatialAwareness({
            currentUrl: url,
            currentPage: pageName,
            currentModule: module,
        });
    }, []);

    // ============================================================
    // UTILITIES
    // ============================================================

    const getGreeting = useCallback(() => iAstedSoul.generateGreeting(), []);
    const getTimeOfDay = useCallback(() => iAstedSoul.getTimeOfDay(), []);

    const getContextSummary = useCallback(() => {
        const { spatial, user, context } = soulState;
        const parts: string[] = [];

        if (user.isAuthenticated) {
            parts.push(`Utilisateur: ${user.name || 'Anonyme'} (${user.role})`);
        }

        parts.push(`Page: ${spatial.currentPage}`);
        parts.push(`Module: ${spatial.currentModule}`);

        if (spatial.visibleDocuments.length > 0) {
            parts.push(`Documents visibles: ${spatial.visibleDocuments.length}`);
        }

        parts.push(`Messages: ${context.messageCount}`);

        return parts.join(' | ');
    }, [soulState]);

    const resetConversation = useCallback(() => {
        iAstedSoul.reset();
    }, []);

    // ============================================================
    // RETURN
    // ============================================================

    return useMemo(() => ({
        // State
        soulState,
        isAwake: soulState.isAwake,
        isListening: soulState.isListening,
        isSpeaking: soulState.isSpeaking,
        isProcessing: soulState.isProcessing,
        isChatOpen: soulState.isChatOpen,
        persona: soulState.persona,
        currentModule: soulState.spatial.currentModule,
        visibleDocuments: soulState.spatial.visibleDocuments,

        // Actions
        awaken,
        sleep,
        startListening,
        stopListening,
        startSpeaking,
        stopSpeaking,
        openChat,
        closeChat,
        toggleChat,
        setUser,
        clearUser,
        setVisibleDocuments,
        updatePage,

        // Utilities
        getGreeting,
        getTimeOfDay,
        getContextSummary,
        resetConversation,
    }), [
        soulState,
        awaken, sleep,
        startListening, stopListening, startSpeaking, stopSpeaking,
        openChat, closeChat, toggleChat,
        setUser, clearUser, setVisibleDocuments, updatePage,
        getGreeting, getTimeOfDay, getContextSummary, resetConversation,
    ]);
}

// ============================================================
// HELPERS
// ============================================================

function getPageNameFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);

    const pageNames: Record<string, string> = {
        'pro': 'Tableau de bord Pro',
        'idocument': 'iDocument',
        'iarchive': 'iArchive',
        'isignature': 'iSignature',
        'admin': 'Administration',
        'billing': 'Facturation',
        'profile': 'Profil',
        'settings': 'Paramètres',
    };

    if (segments.length === 0) return 'Accueil';

    const lastSegment = segments[segments.length - 1];
    return pageNames[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}

// ============================================================
// CONTEXT PROVIDER (pour usage global optionnel)
// ============================================================

import React, { createContext, useContext, ReactNode } from 'react';

const IAstedContext = createContext<UseIAstedReturn | null>(null);

interface IAstedProviderProps {
    children: ReactNode;
    options?: UseIAstedOptions;
}

export function IAstedProvider({
    children,
    options = { autoAwaken: true }
}: IAstedProviderProps) {
    const iasted = useIAsted(options);

    return (
        <IAstedContext.Provider value={iasted}>
            {children}
        </IAstedContext.Provider>
    );
}

export function useIAstedContext(): UseIAstedReturn {
    const context = useContext(IAstedContext);
    if (!context) {
        throw new Error('useIAstedContext must be used within an IAstedProvider');
    }
    return context;
}

// ============================================================
// EXPORT
// ============================================================

export default useIAsted;
