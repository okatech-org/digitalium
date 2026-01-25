/**
 * iSignature Module Layout
 * Wrapper for all iSignature pages with signature queue
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    PenTool,
    Inbox,
    Clock,
    CheckCircle2,
    FileText,
    Workflow,
    Award,
    Settings,
    Send,
    Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { id: 'sign', label: 'À signer', href: '/pro/isignature', icon: Inbox, badge: 5 },
    { id: 'pending', label: 'En attente', href: '/pro/isignature/pending', icon: Clock, badge: 12 },
    { id: 'signed', label: 'Signés', href: '/pro/isignature/signed', icon: CheckCircle2 },
    { id: 'workflows', label: 'Workflows', href: '/pro/isignature/workflows', icon: Workflow },
];

// Search context for child components
interface SignatureSearchContextType {
    searchQuery: string;
}

const SignatureSearchContext = createContext<SignatureSearchContextType>({ searchQuery: '' });

export function useSignatureSearch() {
    return useContext(SignatureSearchContext);
}

export default function ISignatureLayout() {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');

    // Debounce search query update to URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue) {
                setSearchParams(prev => {
                    prev.set('q', inputValue);
                    return prev;
                }, { replace: true });
            } else {
                setSearchParams(prev => {
                    prev.delete('q');
                    return prev;
                }, { replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue, setSearchParams]);

    const contextValue = useMemo(() => ({
        searchQuery: searchParams.get('q') || ''
    }), [searchParams]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <PenTool className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">iSignature</h1>
                                <p className="text-sm text-muted-foreground">Signature électronique</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button className="bg-purple-500 hover:bg-purple-600">
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer à signature
                            </Button>
                        </div>
                    </div>

                    {/* Sub-navigation */}
                    <div className="flex items-center justify-between">
                        <Tabs value={location.pathname} className="w-auto">
                            <TabsList className="bg-muted/50">
                                {NAV_ITEMS.map((item) => (
                                    <TabsTrigger
                                        key={item.href}
                                        value={item.href}
                                        asChild
                                        className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500"
                                    >
                                        <Link to={item.href} className="flex items-center gap-2">
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                            {item.badge && (
                                                <Badge variant="secondary" className="ml-1 bg-purple-500/20 text-purple-500">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9 w-64"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                aria-label="Rechercher des documents"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-6">
                <SignatureSearchContext.Provider value={contextValue}>
                    <Outlet />
                </SignatureSearchContext.Provider>
            </main>
        </div>
    );
}
