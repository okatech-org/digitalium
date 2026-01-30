"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface Presence {
    id: string;
    user_id: string;
    user_name: string;
    user_color: string;
    last_seen: string;
}

interface CollaboratorsListProps {
    presences: Presence[];
}

export function CollaboratorsList({ presences }: CollaboratorsListProps) {
    const maxVisible = 4;
    const visiblePresences = presences.slice(0, maxVisible);
    const hiddenCount = Math.max(0, presences.length - maxVisible);

    if (presences.length === 0) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Vous êtes seul</span>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />

                <div className="flex -space-x-2">
                    <AnimatePresence mode="popLayout">
                        {visiblePresences.map((presence) => (
                            <Tooltip key={presence.id}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="relative"
                                    >
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-background shadow-sm cursor-default"
                                            style={{ backgroundColor: presence.user_color }}
                                        >
                                            {presence.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Online indicator */}
                                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                    <p className="font-medium">{presence.user_name}</p>
                                    <p className="text-muted-foreground">En ligne</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </AnimatePresence>

                    {hiddenCount > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background cursor-default">
                                    +{hiddenCount}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                <p>{hiddenCount} autre{hiddenCount > 1 ? 's' : ''} collaborateur{hiddenCount > 1 ? 's' : ''}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
