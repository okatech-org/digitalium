"use client";

import { Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
    Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorToolbarProps {
    editor: Editor | null;
}

interface ToolButtonProps {
    onClick: () => void;
    isActive?: boolean;
    icon: React.ElementType;
    label: string;
    disabled?: boolean;
}

function ToolButton({ onClick, isActive, icon: Icon, label, disabled }: ToolButtonProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClick}
                        disabled={disabled}
                        className={cn(
                            "h-8 w-8 p-0 transition-all",
                            isActive && "bg-primary/20 text-primary hover:bg-primary/30"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border/30 bg-card/30 backdrop-blur-sm flex-wrap">
            {/* History */}
            <ToolButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                icon={Undo}
                label="Annuler (Ctrl+Z)"
            />
            <ToolButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                icon={Redo}
                label="Rétablir (Ctrl+Y)"
            />

            <Separator orientation="vertical" className="h-5 mx-1.5" />

            {/* Headings */}
            <ToolButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                icon={Heading1}
                label="Titre 1"
            />
            <ToolButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                icon={Heading2}
                label="Titre 2"
            />
            <ToolButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
                icon={Heading3}
                label="Titre 3"
            />

            <Separator orientation="vertical" className="h-5 mx-1.5" />

            {/* Text Formatting */}
            <ToolButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                icon={Bold}
                label="Gras (Ctrl+B)"
            />
            <ToolButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                icon={Italic}
                label="Italique (Ctrl+I)"
            />
            <ToolButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                icon={Strikethrough}
                label="Barré"
            />
            <ToolButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
                icon={Code}
                label="Code"
            />

            <Separator orientation="vertical" className="h-5 mx-1.5" />

            {/* Lists */}
            <ToolButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                icon={List}
                label="Liste à puces"
            />
            <ToolButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                icon={ListOrdered}
                label="Liste numérotée"
            />

            <Separator orientation="vertical" className="h-5 mx-1.5" />

            {/* Blocks */}
            <ToolButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                icon={Quote}
                label="Citation"
            />
            <ToolButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                icon={Minus}
                label="Ligne horizontale"
            />
        </div>
    );
}
