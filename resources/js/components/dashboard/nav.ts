import {
    BadgeCheck,
    BookOpen,
    Boxes,
    ChartColumn,
    ClipboardList,
    GraduationCap,
    LayoutDashboard,
    type LucideIcon,
    Package,
    Store,
    Tags,
    Users,
} from 'lucide-react';

export type DashboardNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    /** Kunci pada shared prop `sidebarBadges` */
    badge?: string;
    exact?: boolean;
};

export const sellerNav: DashboardNavItem[] = [
    { title: 'Ringkasan', href: '/seller', icon: LayoutDashboard, exact: true },
    { title: 'Kelola Produk', href: '/seller/produk', icon: Package },
    { title: 'Pesanan Masuk', href: '/seller/pesanan', icon: ClipboardList, badge: 'orders' },
    { title: 'Stok Produk', href: '/seller/stok', icon: Boxes },
    { title: 'Profil UMKM', href: '/seller/profil', icon: Store },
    { title: 'Cerita Produk', href: '/seller/cerita', icon: BookOpen },
    { title: 'Panduan dan Pelatihan', href: '/seller/pelatihan', icon: GraduationCap },
];

export const adminNav: DashboardNavItem[] = [
    { title: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    { title: 'Data UMKM', href: '/admin/umkm', icon: Store, badge: 'umkm' },
    { title: 'Kurasi Produk', href: '/admin/produk', icon: BadgeCheck, badge: 'products' },
    { title: 'Kategori', href: '/admin/kategori', icon: Tags },
    { title: 'Manajemen Pesanan', href: '/admin/pesanan', icon: ClipboardList },
    { title: 'Pengguna', href: '/admin/pengguna', icon: Users },
    { title: 'Pelatihan UMKM', href: '/admin/pelatihan', icon: GraduationCap },
    { title: 'Laporan dan Analitik', href: '/admin/analitik', icon: ChartColumn },
];
