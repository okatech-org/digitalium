"use client";

/**
 * useCollaboration Hook
 *
 * Real-time collaborative document editing using Firestore + Yjs.
 * Migrated from Supabase Realtime to Firestore onSnapshot listeners.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { db } from "@/config/firebase";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    onSnapshot,
    query,
    where,
    Timestamp,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { useToast } from "@/components/ui/use-toast";

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

// Firestore collection references
const COLLAB_DOCS_COLLECTION = 'collaborative_documents';
const PRESENCE_COLLECTION = 'document_presence';
const EDIT_HISTORY_COLLECTION = 'document_edit_history';

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
    // Load Document from Firestore
    // =========================================
    const loadDocument = useCallback(async () => {
        try {
            const docRef = doc(db, COLLAB_DOCS_COLLECTION, documentId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.error('[useCollaboration] Document not found:', documentId);
                return null;
            }

            const data = { id: docSnap.id, ...docSnap.data() } as CollaborativeDocument;
            setDocument(data);
            return data;
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
    // Sync to Firestore (debounced)
    // =========================================
    const syncToFirestore = useCallback(async () => {
        const ydoc = ydocRef.current;
        if (!ydoc || isSyncing || !user) return;

        setIsSyncing(true);

        try {
            const update = Y.encodeStateAsUpdate(ydoc);
            const base64Content = btoa(String.fromCharCode(...update));

            const docRef = doc(db, COLLAB_DOCS_COLLECTION, documentId);
            await updateDoc(docRef, {
                content: base64Content,
                last_edited_by: user.uid,
                last_edited_at: new Date().toISOString(),
                version: (document?.version || 0) + 1,
                status: 'editing',
            });

            // Log edit action
            await addDoc(collection(db, EDIT_HISTORY_COLLECTION), {
                document_id: documentId,
                user_id: user.uid,
                action: 'edited',
                created_at: serverTimestamp(),
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
            syncTimeoutRef.current = setTimeout(syncToFirestore, 1000);
        };

        ydoc.on('update', handleUpdate);

        return () => {
            ydoc.off('update', handleUpdate);
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [syncToFirestore]);

    // =========================================
    // Presence Management (Firestore)
    // =========================================
    const updatePresence = useCallback(async (cursorPosition?: { from: number; to: number }) => {
        if (!user) return;

        try {
            const presenceId = `${documentId}_${user.uid}`;
            const presenceRef = doc(db, PRESENCE_COLLECTION, presenceId);
            await setDoc(presenceRef, {
                document_id: documentId,
                user_id: user.uid,
                user_name: currentUser.name,
                user_color: currentUser.color,
                cursor_position: cursorPosition || null,
                last_seen: new Date().toISOString(),
            }, { merge: true });
        } catch (error) {
            console.error('[useCollaboration] Erreur mise à jour présence:', error);
        }
    }, [documentId, user, currentUser]);

    const removePresence = useCallback(async () => {
        if (!user) return;

        try {
            const presenceId = `${documentId}_${user.uid}`;
            const presenceRef = doc(db, PRESENCE_COLLECTION, presenceId);
            await deleteDoc(presenceRef);
        } catch (error) {
            console.error('[useCollaboration] Erreur suppression présence:', error);
        }
    }, [documentId, user]);

    // Presence heartbeat & realtime subscription via Firestore onSnapshot
    useEffect(() => {
        // Initial presence
        updatePresence();

        // Heartbeat every 30s
        presenceIntervalRef.current = setInterval(() => {
            updatePresence();
        }, 30000);

        // Realtime subscription for presence changes via Firestore onSnapshot
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const presenceQuery = query(
            collection(db, PRESENCE_COLLECTION),
            where('document_id', '==', documentId),
            where('last_seen', '>', fiveMinutesAgo)
        );

        const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
            const presenceList: Presence[] = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
            } as Presence));
            setPresences(presenceList);
        }, (error) => {
            console.error('[useCollaboration] Erreur snapshot présence:', error);
        });

        return () => {
            if (presenceIntervalRef.current) {
                clearInterval(presenceIntervalRef.current);
            }
            removePresence();
            unsubscribePresence();
        };
    }, [documentId, updatePresence, removePresence]);

    // =========================================
    // Document Realtime Updates (Firestore onSnapshot)
    // =========================================
    useEffect(() => {
        const docRef = doc(db, COLLAB_DOCS_COLLECTION, documentId);

        const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
            if (!docSnap.exists()) return;

            const updatedDoc = { id: docSnap.id, ...docSnap.data() } as CollaborativeDocument;

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
        }, (error) => {
            console.error('[useCollaboration] Erreur snapshot document:', error);
        });

        return () => {
            unsubscribeDoc();
        };
    }, [documentId, user?.uid]);

    // =========================================
    // Archive Document
    // =========================================
    const archiveDocument = useCallback(async () => {
        if (!user) return;

        try {
            const docRef = doc(db, COLLAB_DOCS_COLLECTION, documentId);
            await updateDoc(docRef, { status: 'archived' });

            // Log archive action
            await addDoc(collection(db, EDIT_HISTORY_COLLECTION), {
                document_id: documentId,
                user_id: user.uid,
                action: 'archived',
                snapshot: document?.content,
                created_at: serverTimestamp(),
            });

            toast({
                title: 'Document archivé',
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
            const newDocRef = doc(collection(db, COLLAB_DOCS_COLLECTION));
            const newDocData = {
                title,
                owner_id: user.uid,
                team_id: teamId || null,
                status: 'draft',
                collaborators: [],
                content: '',
                version: 0,
                last_edited_at: new Date().toISOString(),
                last_edited_by: user.uid,
                created_at: serverTimestamp(),
            };

            await setDoc(newDocRef, newDocData);

            // Log creation
            await addDoc(collection(db, EDIT_HISTORY_COLLECTION), {
                document_id: newDocRef.id,
                user_id: user.uid,
                action: 'created',
                created_at: serverTimestamp(),
            });

            return { id: newDocRef.id, ...newDocData } as unknown as CollaborativeDocument;
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
            const docRef = doc(db, COLLAB_DOCS_COLLECTION, documentId);
            await updateDoc(docRef, { collaborators: newCollaborators });
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
