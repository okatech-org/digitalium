/**
 * SpaceContext - Context to differentiate Pro vs SubAdmin (Backoffice) spaces
 * 
 * Pro space = Client workspace (generic companies)
 * SubAdmin space = Digitalium backoffice (internal documents, archives, signatures)
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type SpaceType = 'pro' | 'subadmin';

interface SpaceContextValue {
    spaceType: SpaceType;
    isBackoffice: boolean;
    organizationName: string;
    basePath: string;
}

const SpaceContext = createContext<SpaceContextValue | undefined>(undefined);

export function useSpace(): SpaceContextValue {
    const context = useContext(SpaceContext);
    if (!context) {
        throw new Error('useSpace must be used within a SpaceProvider');
    }
    return context;
}

// Hook that auto-detects space from URL (for components that need space context outside provider)
export function useSpaceFromUrl(): SpaceContextValue {
    const location = useLocation();
    const isSubAdmin = location.pathname.startsWith('/subadmin');

    return useMemo(() => ({
        spaceType: isSubAdmin ? 'subadmin' : 'pro',
        isBackoffice: isSubAdmin,
        organizationName: isSubAdmin ? 'Digitalium' : 'Mon Entreprise',
        basePath: isSubAdmin ? '/subadmin' : '/pro',
    }), [isSubAdmin]);
}

interface SpaceProviderProps {
    children: React.ReactNode;
    spaceType: SpaceType;
}

export function SpaceProvider({ children, spaceType }: SpaceProviderProps) {
    const value = useMemo<SpaceContextValue>(() => ({
        spaceType,
        isBackoffice: spaceType === 'subadmin',
        organizationName: spaceType === 'subadmin' ? 'Digitalium' : 'Mon Entreprise',
        basePath: spaceType === 'subadmin' ? '/subadmin' : '/pro',
    }), [spaceType]);

    return (
        <SpaceContext.Provider value={value}>
            {children}
        </SpaceContext.Provider>
    );
}

export default SpaceContext;
