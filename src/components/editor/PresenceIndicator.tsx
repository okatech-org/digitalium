"use client";

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
    isConnected: boolean;
    isSyncing: boolean;
}

export function PresenceIndicator({ isConnected, isSyncing }: PresenceIndicatorProps) {
    if (!isConnected) {
        return (
            <div className="flex items-center gap-1.5 text-yellow-500">
                <CloudOff className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Hors ligne</span>
            </div>
        );
    }

    if (isSyncing) {
        return (
            <div className="flex items-center gap-1.5 text-blue-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs font-medium">Synchronisation...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 text-green-500">
            <Cloud className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Synchronisé</span>
        </div>
    );
}
