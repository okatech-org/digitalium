import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Settings, 
  LogOut, 
  Shield, 
  User,
  Home,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Mes Documents',
      description: 'Gérez vos fichiers personnels',
      icon: FileText,
      href: '/documents',
      color: 'from-primary to-secondary',
    },
    {
      title: 'Mon Profil',
      description: 'Modifiez vos informations',
      icon: User,
      href: '/profile',
      color: 'from-accent to-orange-500',
    },
    {
      title: 'Paramètres',
      description: 'Configurez votre compte',
      icon: Settings,
      href: '/settings',
      color: 'from-secondary to-purple-600',
    },
  ];

  if (isAdmin) {
    menuItems.unshift({
      title: 'Administration',
      description: 'Tableau de bord admin',
      icon: Shield,
      href: '/admin',
      color: 'from-destructive to-red-700',
    });
  }

  return (
    <div className="min-h-screen cortex-grid">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl gradient-text">DIGITALIUM</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            {isAdmin && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-destructive/20 text-destructive border border-destructive/30">
                Admin
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, <span className="gradient-text">{user?.user_metadata?.display_name || 'Utilisateur'}</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Accédez à tous vos services DIGITALIUM
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link to={item.href}>
                  <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all group cursor-pointer h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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
        </motion.div>
      </main>
    </div>
  );
}
