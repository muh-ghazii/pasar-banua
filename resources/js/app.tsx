import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AuthLayout from '@/layouts/auth-layout';
import DashboardLayout from '@/layouts/dashboard-layout';
import SettingsLayout from '@/layouts/settings/layout';
import StorefrontLayout from '@/layouts/storefront-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Pasar Banua';

void createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('seller/') || name.startsWith('admin/'):
                return DashboardLayout;
            case name.startsWith('settings/'):
                return [StorefrontLayout, SettingsLayout];
            default:
                return StorefrontLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={150}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#C5872A',
    },
});
