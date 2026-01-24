import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Users, FileBarChart, Siren, Building, Database, ChevronRight, Shield } from 'lucide-react';

export const InstitutionSpace = () => {
    const menuItems = [
        {
            title: 'État Civil',
            description: 'Actes et registres',
            icon: Users,
            href: '/civil-registry',
            color: 'from-orange-500 to-amber-500',
        },
        {
            title: 'Services Publics',
            description: 'Configuration des téléservices',
            icon: Landmark,
            href: '/services-config',
            color: 'from-amber-500 to-yellow-500',
        },
        {
            title: 'Administration',
            description: 'Console d\'administration globale',
            icon: Shield,
            href: '/admin',
            color: 'from-red-500 to-rose-500',
        },
        {
            title: 'Rapports Publics',
            description: 'Statistiques et transparence',
            icon: FileBarChart,
            href: '/reports',
            color: 'from-rose-500 to-pink-500',
        },
        {
            title: 'Infrastructures',
            description: 'État du réseau et serveurs',
            icon: Database,
            href: '/infrastructure',
            color: 'from-pink-500 to-fuchsia-500',
        },
        {
            title: 'Alertes',
            description: 'Diffusion d\'alertes nationales',
            icon: Siren,
            href: '/alerts',
            color: 'from-fuchsia-500 to-purple-500',
        },
        {
            title: 'Partenaires',
            description: 'Gestion des entités tierces',
            icon: Building,
            href: '/partners',
            color: 'from-purple-500 to-indigo-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Alert Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full p-6 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-2 flex items-center justify-between"
            >
                <div>
                    <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400">Vigilance Système</h3>
                    <p className="text-sm text-muted-foreground">Tous les services sont opérationnels. Aucune alerte en cours.</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
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
