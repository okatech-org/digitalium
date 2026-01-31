/**
 * SpaceContext - Context to differentiate organization space types
 * 
 * Pro space = Enterprises (commerce, tech, services)
 * Adm space = Administrations (ministères, justice, collectivités)
 * Org space = Organisms (éducation, culture, santé publique)
 * SubAdmin space = Digitalium backoffice (internal documents)
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type SpaceType = 'pro' | 'adm' | 'org' | 'subadmin';

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
    const path = location.pathname;

    return useMemo(() => {
        if (path.startsWith('/subadmin')) {
            return {
                spaceType: 'subadmin' as SpaceType,
                isBackoffice: true,
                organizationName: 'Digitalium',
                basePath: '/subadmin',
            };
        }
        if (path.startsWith('/adm')) {
            return {
                spaceType: 'adm' as SpaceType,
                isBackoffice: false,
                organizationName: 'Mon Administration',
                basePath: '/adm',
            };
        }
        if (path.startsWith('/org')) {
            return {
                spaceType: 'org' as SpaceType,
                isBackoffice: false,
                organizationName: 'Mon Organisme',
                basePath: '/org',
            };
        }
        return {
            spaceType: 'pro' as SpaceType,
            isBackoffice: false,
            organizationName: 'Mon Entreprise',
            basePath: '/pro',
        };
    }, [path]);
}

interface SpaceProviderProps {
    children: React.ReactNode;
    spaceType: SpaceType;
}

export function SpaceProvider({ children, spaceType }: SpaceProviderProps) {
    const value = useMemo<SpaceContextValue>(() => {
        const configs: Record<SpaceType, Omit<SpaceContextValue, 'spaceType'>> = {
            pro: { isBackoffice: false, organizationName: 'Mon Entreprise', basePath: '/pro' },
            adm: { isBackoffice: false, organizationName: 'Mon Administration', basePath: '/adm' },
            org: { isBackoffice: false, organizationName: 'Mon Organisme', basePath: '/org' },
            subadmin: { isBackoffice: true, organizationName: 'Digitalium', basePath: '/subadmin' },
        };
        return { spaceType, ...configs[spaceType] };
    }, [spaceType]);

    return (
        <SpaceContext.Provider value={value}>
            {children}
        </SpaceContext.Provider>
    );
}

export default SpaceContext;
