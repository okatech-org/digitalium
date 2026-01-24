import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';

interface SidebarProps {
    className?: string;
    menuItems: {
        title: string;
        icon: React.ElementType;
        href: string;
        variant?: 'default' | 'ghost';
    }[];
    userTypeBadge?: {
        label: string;
        className: string;
    };
}

export function Sidebar({ className, menuItems, userTypeBadge }: SidebarProps) {
    const { pathname } = useLocation();
    const { signOut } = useAuth();

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Link to="/" className="flex items-center gap-2 mb-6 px-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Home className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl gradient-text">DIGITALIUM</span>
                    </Link>

                    {userTypeBadge && (
                        <div className="px-4 mb-6">
                            <span className={cn("px-2 py-1 text-xs font-medium rounded-full border", userTypeBadge.className)}>
                                {userTypeBadge.label}
                            </span>
                        </div>
                    )}

                    <div className="space-y-1">



                        <ScrollArea className="h-[calc(100vh-250px)]">
                            <div className="space-y-1">
                                {menuItems.map((item) => (
                                    <Button
                                        key={item.href}
                                        variant={pathname === item.href ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link to={item.href}>
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 px-4">
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                </Button>
            </div>
        </div>
    );
}
