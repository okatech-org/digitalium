import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface DashboardLayoutProps {
    children: ReactNode;
    menuItems: {
        title: string;
        icon: React.ElementType;
        href: string;
    }[];
    userTypeBadge?: {
        label: string;
        className: string;
    };
}

export function DashboardLayout({ children, menuItems, userTypeBadge }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
                <Sidebar menuItems={menuItems} userTypeBadge={userTypeBadge} />
            </div>

            {/* Mobile Header & Content Wrapper */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg px-4 py-3 flex items-center justify-between">
                    <span className="font-bold text-lg gradient-text">DIGITALIUM</span>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <Sidebar menuItems={menuItems} userTypeBadge={userTypeBadge} />
                        </SheetContent>
                    </Sheet>
                </header>

                {/* Main Content */}
                <main className="flex-1 container py-8 px-4 md:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
