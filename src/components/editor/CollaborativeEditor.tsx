"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { useCollaboration } from "@/hooks/useCollaboration";
import { EditorToolbar } from "./EditorToolbar";
import { CollaboratorsList } from "./CollaboratorsList";
import { PresenceIndicator } from "./PresenceIndicator";
import { motion } from "framer-motion";
import { Cloud, CloudOff, Archive, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CollaborativeEditorProps {
    documentId: string;
    onArchive?: () => void;
}

export function CollaborativeEditor({ documentId, onArchive }: CollaborativeEditorProps) {
    const navigate = useNavigate();
    const [isReady, setIsReady] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const {
        ydoc,
        document,
        presences,
        isConnected,
        isSyncing,
        currentUser,
        updateCursorPosition,
        archiveDocument,
    } = useCollaboration({
        documentId,
        onSync: () => setIsReady(true),
    });

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false, // Disabled - managed by Yjs
            }),
            ...(ydoc ? [
                Collaboration.configure({
                    document: ydoc,
                }),
                CollaborationCursor.configure({
                    provider: null,
                    user: {
                        name: currentUser.name,
                        color: currentUser.color,
                    },
                }),
            ] : []),
        ],
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none focus:outline-none min-h-[500px] p-6 text-foreground",
            },
        },
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection;
            updateCursorPosition(from, to);
        },
    }, [ydoc, currentUser]);

    const handleArchive = async () => {
        setIsArchiving(true);
        try {
            await archiveDocument();
            onArchive?.();
        } finally {
            setIsArchiving(false);
        }
    };

    if (!isReady) {
        return (
            <div className="flex items-center justify-center h-96 bg-background/50 rounded-xl">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
                <span className="ml-3 text-muted-foreground">Chargement du document...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border border-border/30 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            {document?.title || "Sans titre"}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <PresenceIndicator isConnected={isConnected} isSyncing={isSyncing} />
                            <span className="text-xs text-muted-foreground">
                                Version {document?.version || 1}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Active Collaborators */}
                    <CollaboratorsList presences={presences} />

                    {/* Archive Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleArchive}
                        disabled={document?.status === "archived" || isArchiving}
                        className="gap-2"
                    >
                        {isArchiving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Archive className="h-4 w-4" />
                        )}
                        {document?.status === "archived" ? "Archivé" : "Archiver"}
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <EditorToolbar editor={editor} />

            {/* Editor Content */}
            <div className="flex-1 overflow-auto bg-background/50">
                <div className="max-w-4xl mx-auto py-6">
                    <div className="bg-card rounded-lg shadow-sm border border-border/20 min-h-[600px]">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-card/30 text-xs text-muted-foreground">
                <span>
                    {document?.status === "archived" ? "📦 Archivé" : "📝 En édition"}
                </span>
                <span>
                    Dernière modification:{" "}
                    {document?.last_edited_at
                        ? new Date(document.last_edited_at).toLocaleString("fr-FR")
                        : "-"}
                </span>
            </div>
        </div>
    );
}
