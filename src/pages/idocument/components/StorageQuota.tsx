/**
 * StorageQuota Component
 * Visual display of storage usage with plan limit
 */

import React from 'react';
import { HardDrive, Folder, FileText, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StorageQuotaProps {
    usedBytes: number;
    totalBytes: number;
    documentCount: number;
    folderCount: number;
    className?: string;
    compact?: boolean;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-orange-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-green-500';
}

function getProgressColor(percentage: number): string {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
}

export function StorageQuota({
    usedBytes,
    totalBytes,
    documentCount,
    folderCount,
    className,
    compact = false,
}: StorageQuotaProps) {
    const percentage = totalBytes > 0 ? Math.min((usedBytes / totalBytes) * 100, 100) : 0;
    const isUnlimited = totalBytes < 0 || totalBytes === Infinity;

    if (compact) {
        return (
            <div className={cn('flex items-center gap-3', className)}>
                <HardDrive className={cn('w-4 h-4', getUsageColor(percentage))} />
                <div className="flex-1">
                    <Progress
                        value={isUnlimited ? 0 : percentage}
                        className="h-2"
                    />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatBytes(usedBytes)}
                    {!isUnlimited && ` / ${formatBytes(totalBytes)}`}
                </span>
            </div>
        );
    }

    return (
        <div className={cn('p-4 rounded-xl border bg-card', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={cn('p-2 rounded-lg',
                        percentage >= 90 ? 'bg-red-500/10' : 'bg-primary/10'
                    )}>
                        <HardDrive className={cn('w-5 h-5', getUsageColor(percentage))} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Stockage</h3>
                        <p className="text-xs text-muted-foreground">
                            {isUnlimited ? 'Illimité' : `${percentage.toFixed(1)}% utilisé`}
                        </p>
                    </div>
                </div>

                {percentage >= 90 && !isUnlimited && (
                    <span className="px-2 py-1 text-xs font-medium text-red-500 bg-red-500/10 rounded-full">
                        Presque plein
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
                <div className="relative">
                    <Progress
                        value={isUnlimited ? 0 : percentage}
                        className="h-3"
                    />
                    {!isUnlimited && (
                        <div
                            className={cn(
                                'absolute top-0 h-full rounded-full transition-all',
                                getProgressColor(percentage)
                            )}
                            style={{ width: `${percentage}%` }}
                        />
                    )}
                </div>
                <div className="flex justify-between text-sm">
                    <span className="font-medium">{formatBytes(usedBytes)}</span>
                    <span className="text-muted-foreground">
                        {isUnlimited ? '∞ Stockage illimité' : `sur ${formatBytes(totalBytes)}`}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    icon={FileText}
                    label="Documents"
                    value={documentCount}
                    color="text-blue-500"
                    bgColor="bg-blue-500/10"
                />
                <StatCard
                    icon={Folder}
                    label="Dossiers"
                    value={folderCount}
                    color="text-purple-500"
                    bgColor="bg-purple-500/10"
                />
            </div>

            {/* Warning */}
            {percentage >= 75 && !isUnlimited && (
                <div className={cn(
                    'mt-4 p-3 rounded-lg flex items-start gap-2',
                    percentage >= 90 ? 'bg-red-500/10' : 'bg-orange-500/10'
                )}>
                    <TrendingUp className={cn(
                        'w-4 h-4 mt-0.5',
                        percentage >= 90 ? 'text-red-500' : 'text-orange-500'
                    )} />
                    <div className="text-sm">
                        <p className={cn(
                            'font-medium',
                            percentage >= 90 ? 'text-red-500' : 'text-orange-500'
                        )}>
                            {percentage >= 90 ? 'Espace critique' : 'Espace limité'}
                        </p>
                        <p className="text-muted-foreground">
                            {percentage >= 90
                                ? 'Passez à un plan supérieur pour plus d\'espace.'
                                : 'Pensez à libérer de l\'espace ou à passer à un plan supérieur.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    color: string;
    bgColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
    return (
        <div className={cn('p-3 rounded-lg', bgColor)}>
            <div className="flex items-center gap-2">
                <Icon className={cn('w-4 h-4', color)} />
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <p className={cn('text-xl font-bold mt-1', color)}>
                {value.toLocaleString('fr-FR')}
            </p>
        </div>
    );
}
