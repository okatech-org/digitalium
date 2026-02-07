/**
 * ArchivalStatusBadge - Visual indicator for archival lifecycle status
 * Shows the current archival phase with color coding and tooltip
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArchivalStatus } from '../types';
import { ARCHIVAL_STATUS_CONFIG } from '../constants';

interface ArchivalStatusBadgeProps {
    status: ArchivalStatus;
    showDescription?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ArchivalStatusBadge({
    status,
    showDescription = false,
    size = 'sm',
    className = '',
}: ArchivalStatusBadgeProps) {
    const config = ARCHIVAL_STATUS_CONFIG[status];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="outline"
                        className={`${config.color} ${sizeClasses[size]} border font-medium cursor-default select-none ${className}`}
                    >
                        <span className="mr-1">{config.icon}</span>
                        {config.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                    {showDescription && (
                        <div className="mt-2 text-xs">
                            <p className="font-medium text-muted-foreground">Actions autorisées :</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {config.allowedActions.map(action => (
                                    <span key={action} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                        {ACTION_LABELS[action] || action}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

const ACTION_LABELS: Record<string, string> = {
    edit: 'Modifier',
    delete: 'Supprimer',
    share: 'Partager',
    print: 'Imprimer',
    view: 'Consulter',
    download: 'Télécharger',
    certified_copy: 'Copie certifiée',
    verify_integrity: 'Vérifier intégrité',
    transfer: 'Transférer',
    destroy: 'Détruire',
    change_status: 'Changer statut',
    add_version: 'Ajouter version',
    annotate: 'Annoter',
};
