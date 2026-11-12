import type {
    AppNotificationItem,
    NavCategory,
    SharedUser,
} from '@/types/domain';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: { user: SharedUser | null };
            cartCount: number;
            navCategories: NavCategory[];
            notifications: {
                unread: number;
                items: AppNotificationItem[];
            } | null;
            sidebarBadges: Record<string, number>;
            app: {
                demo: boolean;
                contact: { email: string; phone: string; address: string };
                social: { instagram: string; facebook: string; youtube: string };
                shippingFlat: number;
            };
            [key: string]: unknown;
        };
    }
}
