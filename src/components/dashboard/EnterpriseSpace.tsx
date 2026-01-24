import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BarChart3, Globe, ShieldCheck, FileKey, Briefcase, ChevronRight, CreditCard } from 'lucide-react';

export const EnterpriseSpace = () => {
    const menuItems = [
        {
            title: 'Gestion Équipe',
            description: 'Collaborateurs et rôles',
            icon: Users,
            href: '/team',
            color: 'from-emerald-500 to-teal-500',
        },
        {
            title: 'Analytics',
            description: 'Statistiques d\'utilisation',
            icon: BarChart3,
            href: '/analytics',
            color: 'from-teal-500 to-cyan-500',
        },
        {
            title: 'Documents Pro',
            description: 'Archives et dossiers partagés',
            icon: Briefcase,
            href: '/enterprise-archive',
            color: 'from-cyan-500 to-sky-500',
        },
        {
            title: 'Facturation Pro',
            description: 'Factures et méthodes de paiement',
            icon: CreditCard,
            href: '/billing',
            color: 'from-sky-500 to-blue-500',
        },
        {
            title: 'Accès API',
            description: 'Clés et documentation',
            icon: FileKey,
            href: '/api',
            color: 'from-blue-500 to-indigo-500',
        },
        {
            title: 'Sécurité',
            description: 'Logs et conformité',
            icon: ShieldCheck,
            href: '/security',
            color: 'from-indigo-500 to-violet-500',
        },
        {
            title: 'Espace Public',
            description: 'Page profil entreprise',
            icon: Globe,
            href: '/public-profile',
            color: 'from-violet-500 to-purple-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2"
            >
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-muted-foreground">Documents Stockés</p>
                    <p className="text-2xl font-bold gradient-text">1,248</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground">Collaborateurs Actifs</p>
                    <p className="text-2xl font-bold gradient-text">12</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm text-muted-foreground">Utilisation API (mois)</p>
                    <p className="text-2xl font-bold gradient-text">45.2k</p>
                </div>
            </motion.div>

            {menuItems.map((item, index) => (
                <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <Link to={item.href}>
                        <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all group cursor-pointer h-full hover:shadow-lg hover:-translate-y-1">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <CardTitle className="flex items-center justify-between">
                                    {item.title}
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};
