
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Folder, Timer, Layers } from "lucide-react";

interface StatsOverviewProps {
    stats: {
        totalClasseurs: number;
        totalDossiers: number;
        totalFichiers: number;
        totalAttachments: number;
        byType: Record<string, number>;
        brouillons: number;
        trashCount: number;
    };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const cards = [
        {
            title: "Fichiers",
            value: stats.totalFichiers,
            subtitle: `${stats.totalAttachments} pièces jointes`,
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Dossiers",
            value: stats.totalDossiers,
            subtitle: `dans ${stats.totalClasseurs} classeurs`,
            icon: Folder,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Brouillons",
            value: stats.brouillons,
            subtitle: "En attente",
            icon: Timer,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            title: "Types",
            value: Object.keys(stats.byType).filter(k => stats.byType[k] > 0).length,
            subtitle: "Catégories",
            icon: Layers,
            color: "text-violet-500",
            bg: "bg-violet-500/10"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((stat, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-card border border-border/40 rounded-xl p-4 md:p-5 flex items-center justify-between group cursor-default shadow-sm hover:shadow-md transition-all"
                >
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                        <h3 className="text-3xl md:text-4xl font-bold text-foreground tabular-nums group-hover:text-primary transition-colors">
                            {stat.value}
                        </h3>
                        <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    </div>

                    <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                        <stat.icon className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
