/**
 * IntegrityBadge - Visual indicator for document integrity status
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Hash,
    Clock,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type IntegrityStatus =
    | 'verified'      // Hash matches, document intact
    | 'unverified'    // Not yet verified
    | 'compromised'   // Hash mismatch detected
    | 'checking';     // Verification in progress

interface IntegrityBadgeProps {
    status: IntegrityStatus;
    hashSHA256?: string;
    lastVerifiedAt?: number;
    onVerify?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

const statusConfig: Record<IntegrityStatus, {
    icon: typeof Shield;
    label: string;
    color: string;
    bgColor: string;
    description: string;
}> = {
    verified: {
        icon: ShieldCheck,
        label: 'Intégrité vérifiée',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        description: 'Le document n\'a pas été modifié depuis son archivage.',
    },
    unverified: {
        icon: Shield,
        label: 'Non vérifié',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        description: 'L\'intégrité du document n\'a pas encore été vérifiée.',
    },
    compromised: {
        icon: ShieldX,
        label: 'Intégrité compromise',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        description: 'Le document a été modifié. Alerte de sécurité !',
    },
    checking: {
        icon: ShieldAlert,
        label: 'Vérification...',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        description: 'Vérification de l\'intégrité en cours.',
    },
};

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function IntegrityBadge({
    status,
    hashSHA256,
    lastVerifiedAt,
    onVerify,
    size = 'md',
    showDetails = false,
}: IntegrityBadgeProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'h-3.5 w-3.5',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    const badgeSizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    if (showDetails) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                    'rounded-lg border p-4',
                    config.bgColor,
                    status === 'compromised' && 'border-red-500/50'
                )}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg', config.bgColor)}>
                            {status === 'checking' ? (
                                <Loader2 className={cn(sizeClasses.lg, config.color, 'animate-spin')} />
                            ) : (
                                <Icon className={cn(sizeClasses.lg, config.color)} />
                            )}
                        </div>

                        <div>
                            <h4 className={cn('font-medium', config.color)}>
                                {config.label}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                {config.description}
                            </p>
                        </div>
                    </div>

                    {onVerify && status !== 'checking' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onVerify}
                        >
                            Re-vérifier
                        </Button>
                    )}
                </div>

                {/* Hash display */}
                {hashSHA256 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Hash className="h-3.5 w-3.5" />
                            <span className="font-medium">Empreinte SHA-256</span>
                        </div>
                        <code className="block text-xs font-mono bg-background/50 rounded px-3 py-2 break-all">
                            {hashSHA256}
                        </code>
                    </div>
                )}

                {/* Last verified */}
                {lastVerifiedAt && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Dernière vérification : {formatDate(lastVerifiedAt)}</span>
                    </div>
                )}
            </motion.div>
        );
    }

    // Compact badge version
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="secondary"
                    className={cn(
                        'cursor-help transition-colors',
                        config.bgColor,
                        config.color,
                        badgeSizes[size]
                    )}
                >
                    {status === 'checking' ? (
                        <Loader2 className={cn(sizeClasses[size], 'mr-1.5 animate-spin')} />
                    ) : (
                        <Icon className={cn(sizeClasses[size], 'mr-1.5')} />
                    )}
                    {config.label}
                </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                    <p className="text-sm">{config.description}</p>
                    {hashSHA256 && (
                        <div className="text-xs">
                            <span className="font-medium">SHA-256 : </span>
                            <code className="font-mono">
                                {hashSHA256.substring(0, 16)}...
                            </code>
                        </div>
                    )}
                    {lastVerifiedAt && (
                        <div className="text-xs text-muted-foreground">
                            Vérifié le {formatDate(lastVerifiedAt)}
                        </div>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

/**
 * HashVerifier - Component to verify document integrity on demand
 */
export function HashVerifier({
    originalHash,
    currentHash,
    onVerify,
    isVerifying = false,
}: {
    originalHash: string;
    currentHash?: string;
    onVerify: () => void;
    isVerifying?: boolean;
}) {
    const matches = currentHash === originalHash;
    const status: IntegrityStatus = isVerifying
        ? 'checking'
        : currentHash
            ? (matches ? 'verified' : 'compromised')
            : 'unverified';

    return (
        <div className="space-y-4">
            <IntegrityBadge
                status={status}
                hashSHA256={originalHash}
                showDetails
                onVerify={onVerify}
            />

            {currentHash && !matches && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
                >
                    <h4 className="font-medium text-red-500 flex items-center gap-2">
                        <ShieldX className="h-4 w-4" />
                        Différence détectée
                    </h4>
                    <div className="mt-3 space-y-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Hash original : </span>
                            <code className="font-mono text-xs">{originalHash.substring(0, 24)}...</code>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Hash actuel : </span>
                            <code className="font-mono text-xs text-red-500">
                                {currentHash.substring(0, 24)}...
                            </code>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
