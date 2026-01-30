import { useAuth } from '@/contexts/FirebaseAuthContext';
import {
    FileText,
    Settings,
    Shield,
    User,
    CreditCard,
    History,
    Bell,
    Users,
    BarChart3,
    Briefcase,
    FileKey,
    ShieldCheck,
    Globe,
    Database,
    Terminal,
    Activity,
    ShieldAlert,
    Landmark,
    Siren,
    Building,
    FileBarChart,
    Server
} from 'lucide-react';
import ProDashboard from '@/pages/pro/ProDashboard';
import { CitizenSpace } from '@/components/dashboard/CitizenSpace';
// EnterpriseSpace removed as obsolete
import { InstitutionSpace } from '@/components/dashboard/InstitutionSpace';
import { SystemAdminSpace } from '@/components/dashboard/SystemAdminSpace';

export function useUserSpace() {
    const { user, isAdmin } = useAuth();
    const email = user?.email || '';

    if (email.includes('demo-sysadmin')) {
        return {
            type: 'sysadmin',
            title: 'Console Système',
            badge: { label: 'Admin Système', className: 'bg-slate-800 text-slate-200 border-slate-700' },
            component: <SystemAdminSpace />,
            menuItems: [
                { title: 'Vue d\'ensemble', icon: Server, href: '/admin' },
                { title: 'Infrastructure', icon: Server, href: '/admin/infrastructure' },
                { title: 'Monitoring', icon: Activity, href: '/admin/monitoring' },
                { title: 'Bases de Données', icon: Database, href: '/admin/databases' },
                { title: 'Logs Système', icon: Terminal, href: '/admin/logs' },
                { title: 'Sécurité', icon: ShieldAlert, href: '/admin/security' },
                { title: 'Utilisateurs IAM', icon: Users, href: '/admin/iam' },
            ],
        };
    }

    if (email.includes('demo-admin') || isAdmin) {
        return {
            type: 'institution',
            title: 'Espace Institutionnel',
            badge: { label: 'Administration', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
            component: <InstitutionSpace />,
            menuItems: [
                { title: 'Vue d\'ensemble', icon: Shield, href: '/dashboard' },
                { title: 'État Civil', icon: Users, href: '/civil-registry' },
                { title: 'Services Publics', icon: Landmark, href: '/services-config' },
                { title: 'Administration', icon: Shield, href: '/adminis' },
                { title: 'Rapports Publics', icon: FileBarChart, href: '/reports' },
                { title: 'Infrastructures', icon: Database, href: '/infrastructure' },
                { title: 'Alertes', icon: Siren, href: '/alerts' },
                { title: 'Partenaires', icon: Building, href: '/partners' },
            ],
        };
    }

    if (email.includes('demo-entreprise') || email.endsWith('@entreprise.ga')) {
        return {
            type: 'enterprise',
            title: 'Espace Professionnel',
            badge: { label: 'Entreprise', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
            component: <ProDashboard />,
            menuItems: [
                { title: 'Vue d\'ensemble', icon: BarChart3, href: '/dashboard' },
                { title: 'Gestion Équipe', icon: Users, href: '/team' },
                { title: 'Analytics', icon: BarChart3, href: '/analytics' },
                { title: 'Documents Pro', icon: Briefcase, href: '/idocument' },
                { title: 'Facturation Pro', icon: CreditCard, href: '/billing-pro' },
                { title: 'Accès API', icon: FileKey, href: '/api' },
                { title: 'Sécurité', icon: ShieldCheck, href: '/security' },
                { title: 'Espace Public', icon: Globe, href: '/public-profile' },
            ],
        };
    }

    // Default to Citizen
    return {
        type: 'citizen',
        title: 'Espace Citoyen',
        badge: { label: 'Personnel', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        component: <CitizenSpace />,
        menuItems: [
            { title: 'Vue d\'ensemble', icon: User, href: '/dashboard' },
            { title: 'Mes Documents', icon: FileText, href: '/idocument' },
            { title: 'Mon Profil', icon: User, href: '/profile' },
            { title: 'Mes Factures', icon: CreditCard, href: '/billing' },
            { title: 'Historique', icon: History, href: '/history' },
            { title: 'Notifications', icon: Bell, href: '/notifications' },
            { title: 'Paramètres', icon: Settings, href: '/settings' },
        ],
    };
}
