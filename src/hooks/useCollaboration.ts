"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { useToast } from "@/components/ui/use-toast";

// Create untyped Supabase client for new tables
// TODO: After running migration, regenerate types and switch to typed client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabaseUntyped = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Collaborator {
    userId: string;
    role: 'editor' | 'viewer' | 'commenter';
    addedAt: number;
}

interface CollaborativeDocument {
    id: string;
    title: string;
    content: string;
    owner_id: string;
    status: 'draft' | 'editing' | 'review' | 'archived';
    collaborators: Collaborator[];
    version: number;
    last_edited_at: string;
    last_edited_by: string | null;
}

interface Presence {
    id: string;
    user_id: string;
    user_name: string;
    user_color: string;
    cursor_position: { from: number; to: number } | null;
    last_seen: string;
}

interface UseCollaborationOptions {
    documentId: string;
    onSync?: () => void;
}

// Utility to generate unique color from user ID
const generateUserColor = (userId: string): string => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F39C12", "#9B59B6"];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export function useCollaboration({ documentId, onSync }: UseCollaborationOptions) {
    const { user } = useAuth();
    const { toast } = useToast();

    // State
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [document, setDocument] = useState<CollaborativeDocument | null>(null);
    const [presences, setPresences] = useState<Presence[]>([]);

    // Refs
    const ydocRef = useRef<Y.Doc | null>(null);
    const persistenceRef = useRef<IndexeddbPersistence | null>(null);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Current user info
    const currentUser = useMemo(() => ({
        id: user?.uid || 'anonymous',
        name: user?.displayName || user?.email || 'Anonyme',
        color: generateUserColor(user?.uid || 'anonymous'),
    }), [user]);

    // =========================================
    // Load Document from Supabase
    // =========================================
    const loadDocument = useCallback(async () => {
        try {
            const { data, error } = await supabaseUntyped
                .from('collaborative_documents')
                .select('*')
                .eq('id', documentId)
                .single();

            if (error) throw error;
            setDocument(data as CollaborativeDocument);
            return data as CollaborativeDocument;
        } catch (error) {
            console.error('[useCollaboration] Erreur chargement document:', error);
            return null;
        }
    }, [documentId]);

    // =========================================
    // Initialize Yjs Document
    // =========================================
    useEffect(() => {
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        // Local persistence with IndexedDB
        const persistence = new IndexeddbPersistence(`digitalium-collab-${documentId}`, ydoc);
        persistenceRef.current = persistence;

        persistence.on('synced', () => {
            setIsConnected(true);
            onSync?.();
        });

        // Load document and apply content
        loadDocument().then((doc) => {
            if (doc?.content) {
                try {
                    const uint8Array = Uint8Array.from(atob(doc.content), (c) => c.charCodeAt(0));
                    Y.applyUpdate(ydoc, uint8Array);
                } catch (e) {
                    console.error('[useCollaboration] Erreur décodage contenu Yjs:', e);
                }
            }
        });

        return () => {
            persistence.destroy();
            ydoc.destroy();
        };
    }, [documentId, loadDocument, onSync]);

    // =========================================
    // Sync to Supabase (debounced)
    // =========================================
    const syncToSupabase = useCallback(async () => {
        const ydoc = ydocRef.current;
        if (!ydoc || isSyncing || !user) return;

        setIsSyncing(true);

        try {
            const update = Y.encodeStateAsUpdate(ydoc);
            const base64Content = btoa(String.fromCharCode(...update));

            const { error } = await supabaseUntyped
                .from('collaborative_documents')
                .update({
                    content: base64Content,
                    last_edited_by: user.uid,
                    last_edited_at: new Date().toISOString(),
                    version: (document?.version || 0) + 1,
                    status: 'editing',
                })
                .eq('id', documentId);

            if (error) throw error;

            // Log edit action
            await supabaseUntyped.from('document_edit_history').insert({
                document_id: documentId,
                user_id: user.uid,
                action: 'edited',
            });
        } catch (error) {
            console.error('[useCollaboration] Erreur sync:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur de synchronisation',
                description: 'Impossible de sauvegarder les modifications.',
            });
        } finally {
            setIsSyncing(false);
        }
    }, [documentId, document?.version, user, isSyncing, toast]);

    // Debounced sync on Yjs updates
    useEffect(() => {
        const ydoc = ydocRef.current;
        if (!ydoc) return;

        const handleUpdate = () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            syncTimeoutRef.current = setTimeout(syncToSupabase, 1000);
        };

        ydoc.on('update', handleUpdate);

        return () => {
            ydoc.off('update', handleUpdate);
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [syncToSupabase]);

    // =========================================
    // Presence Management
    // =========================================
    const updatePresence = useCallback(async (cursorPosition?: { from: number; to: number }) => {
        if (!user) return;

        try {
            await supabaseUntyped
                .from('document_presence')
                .upsert({
                    document_id: documentId,
                    user_id: user.uid,
                    user_name: currentUser.name,
                    user_color: currentUser.color,
                    cursor_position: cursorPosition || null,
                    last_seen: new Date().toISOString(),
                }, {
                    onConflict: 'document_id,user_id',
                });
        } catch (error) {
            console.error('[useCollaboration] Erreur mise à jour présence:', error);
        }
    }, [documentId, user, currentUser]);

    const removePresence = useCallback(async () => {
        if (!user) return;

        try {
            await supabaseUntyped
                .from('document_presence')
                .delete()
                .eq('document_id', documentId)
                .eq('user_id', user.uid);
        } catch (error) {
            console.error('[useCollaboration] Erreur suppression présence:', error);
        }
    }, [documentId, user]);

    // Load presences
    const loadPresences = useCallback(async () => {
        try {
            const { data, error } = await supabaseUntyped
                .from('document_presence')
                .select('*')
                .eq('document_id', documentId)
                .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

            if (error) throw error;
            setPresences((data as Presence[]) || []);
        } catch (error) {
            console.error('[useCollaboration] Erreur chargement présences:', error);
        }
    }, [documentId]);

    // Presence heartbeat & realtime subscription
    useEffect(() => {
        // Initial presence
        updatePresence();
        loadPresences();

        // Heartbeat every 30s
        presenceIntervalRef.current = setInterval(() => {
            updatePresence();
            loadPresences();
        }, 30000);

        // Realtime subscription for presence changes
        const channel = supabaseUntyped
            .channel(`presence:${documentId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'document_presence',
                    filter: `document_id=eq.${documentId}`,
                },
                () => {
                    loadPresences();
                }
            )
            .subscribe();

        return () => {
            if (presenceIntervalRef.current) {
                clearInterval(presenceIntervalRef.current);
            }
            removePresence();
            supabaseUntyped.removeChannel(channel);
        };
    }, [documentId, updatePresence, loadPresences, removePresence]);

    // =========================================
    // Document Realtime Updates
    // =========================================
    useEffect(() => {
        const channel = supabaseUntyped
            .channel(`doc:${documentId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'collaborative_documents',
                    filter: `id=eq.${documentId}`,
                },
                (payload) => {
                    const updatedDoc = payload.new as CollaborativeDocument;

                    // Only apply if update came from another user
                    if (updatedDoc.last_edited_by !== user?.uid) {
                        setDocument(updatedDoc);

                        // Apply Yjs update if content changed
                        if (updatedDoc.content && ydocRef.current) {
                            try {
                                const uint8Array = Uint8Array.from(atob(updatedDoc.content), (c) => c.charCodeAt(0));
                                Y.applyUpdate(ydocRef.current, uint8Array);
                            } catch (e) {
                                console.error('[useCollaboration] Erreur application update distant:', e);
                            }
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabaseUntyped.removeChannel(channel);
        };
    }, [documentId, user?.uid]);

    // =========================================
    // Archive Document
    // =========================================
    const archiveDocument = useCallback(async () => {
        if (!user) return;

        try {
            const { error } = await supabaseUntyped
                .from('collaborative_documents')
                .update({ status: 'archived' })
                .eq('id', documentId);

            if (error) throw error;

            // Log archive action
            await supabaseUntyped.from('document_edit_history').insert({
                document_id: documentId,
                user_id: user.uid,
                action: 'archived',
                snapshot: document?.content,
            });

            toast({
                title: '📦 Document archivé',
                description: 'Le document a été transféré vers iArchive.',
            });

            // Reload document
            loadDocument();
        } catch (error) {
            console.error('[useCollaboration] Erreur archivage:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: "Impossible d'archiver le document.",
            });
        }
    }, [documentId, document?.content, user, toast, loadDocument]);

    // =========================================
    // Create New Document
    // =========================================
    const createDocument = useCallback(async (title: string, teamId?: string) => {
        if (!user) return null;

        try {
            const { data, error } = await supabaseUntyped
                .from('collaborative_documents')
                .insert({
                    title,
                    owner_id: user.uid,
                    team_id: teamId,
                    status: 'draft',
                    collaborators: [],
                })
                .select()
                .single();

            if (error) throw error;

            // Log creation
            await supabaseUntyped.from('document_edit_history').insert({
                document_id: data.id,
                user_id: user.uid,
                action: 'created',
            });

            return data as CollaborativeDocument;
        } catch (error) {
            console.error('[useCollaboration] Erreur création document:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de créer le document.',
            });
            return null;
        }
    }, [user, toast]);

    // =========================================
    // Add Collaborator
    // =========================================
    const addCollaborator = useCallback(async (userId: string, role: 'editor' | 'viewer' | 'commenter') => {
        if (!document) return;

        const newCollaborators = [
            ...document.collaborators.filter((c) => c.userId !== userId),
            { userId, role, addedAt: Date.now() },
        ];

        try {
            const { error } = await supabaseUntyped
                .from('collaborative_documents')
                .update({ collaborators: newCollaborators })
                .eq('id', documentId);

            if (error) throw error;
            loadDocument();
        } catch (error) {
            console.error('[useCollaboration] Erreur ajout collaborateur:', error);
        }
    }, [documentId, document, loadDocument]);

    // =========================================
    // Update Cursor Position
    // =========================================
    const updateCursorPosition = useCallback((from: number, to: number) => {
        updatePresence({ from, to });
    }, [updatePresence]);

    return {
        // Yjs document
        ydoc: ydocRef.current,

        // Document data
        document,
        presences: presences.filter((p) => p.user_id !== user?.uid), // Exclude current user

        // Connection state
        isConnected,
        isSyncing,

        // Current user
        currentUser,

        // Actions
        updateCursorPosition,
        archiveDocument,
        createDocument,
        addCollaborator,
        loadDocument,
    };
}
