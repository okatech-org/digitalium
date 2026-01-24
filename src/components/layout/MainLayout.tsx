import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUserSpace } from '@/hooks/useUserSpace';

export default function MainLayout() {
    const currentSpace = useUserSpace();

    return (
        <DashboardLayout menuItems={currentSpace.menuItems} userTypeBadge={currentSpace.badge}>
            <Outlet />
        </DashboardLayout>
    );
}
