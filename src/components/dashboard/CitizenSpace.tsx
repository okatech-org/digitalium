import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, User, CreditCard, Settings, ChevronRight, Bell, History } from 'lucide-react';

export const CitizenSpace = () => {
    const menuItems = [
        {
            title: 'Mes Documents',
            description: 'Gérez vos fichiers personnels',
            icon: FileText,
            href: '/documents',
            color: 'from-cyan-500 to-blue-500',
        },
        {
            title: 'Mon Profil',
            description: 'Vos informations personnelles',
            icon: User,
            href: '/profile',
            color: 'from-blue-500 to-indigo-500',
        },
        {
            title: 'Mes Factures',
            description: 'Abonnements et paiements',
            icon: CreditCard,
            href: '/billing',
            color: 'from-indigo-500 to-violet-500',
        },
        {
            title: 'Historique',
            description: 'Vos dernières activités',
            icon: History,
            href: '/history',
            color: 'from-violet-500 to-purple-500',
        },
        {
            title: 'Notifications',
            description: 'Messages et alertes',
            icon: Bell,
            href: '/notifications',
            color: 'from-purple-500 to-fuchsia-500',
        },
        {
            title: 'Paramètres',
            description: 'Options du compte',
            icon: Settings,
            href: '/settings',
            color: 'from-fuchsia-500 to-pink-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
