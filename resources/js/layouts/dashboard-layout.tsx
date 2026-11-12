import { Link, usePage } from '@inertiajs/react';
import { ExternalLink, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/brand/logo';
import { adminNav, sellerNav, type DashboardNavItem } from '@/components/dashboard/nav';
import AccountMenu from '@/components/shared/account-menu';
import NotificationBell from '@/components/shared/notification-bell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { UmkmStatus } from '@/types/domain';

const umkmTone: Record<UmkmStatus, 'gold' | 'teal' | 'brick' | 'neutral'> = {
    pending: 'gold',
    approved: 'teal',
    rejected: 'brick',
    suspended: 'neutral',
};

function NavList({ items, onNavigate }: { items: DashboardNavItem[]; onNavigate?: () => void }) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const { sidebarBadges } = usePage().props;

    return (
        <nav aria-label="Menu dashboard" className="flex flex-col gap-1">
            {items.map((item) => {
                const active = item.exact ? isCurrentUrl(item.href) : isCurrentOrParentUrl(item.href);
                const count = item.badge ? (sidebarBadges?.[item.badge] ?? 0) : 0;
                const content = (
                    <Link
                        href={item.href}
                        prefetch
                        aria-current={active ? 'page' : undefined}
                        onClick={onNavigate}
                        className={cn(
                            'group relative flex h-11 items-center gap-3 rounded-lg px-3 text-[0.9rem] font-semibold transition-colors',
                            active
                                ? 'bg-sidebar-accent text-ivory'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-ivory',
                        )}
                    >
                        {active && (
                            <span className="absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-r bg-gold" />
                        )}
                        <item.icon
                            className={cn('size-[18px] shrink-0', active ? 'text-gold' : 'text-sidebar-foreground/60 group-hover:text-gold')}
                            strokeWidth={1.75}
                        />
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        {count > 0 && (
                            <span className="flex min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[0.68rem] leading-5 font-bold text-navy">
                                {count}
                            </span>
                        )}
                    </Link>
                );

                return onNavigate ? <SheetClose asChild key={item.href}>{content}</SheetClose> : <div key={item.href}>{content}</div>;
            })}
        </nav>
    );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const isAdmin = user?.role === 'admin';
    const items = isAdmin ? adminNav : sellerNav;

    return (
        <div className="flex h-full flex-col">
            <div className="px-5 pt-6 pb-5">
                <Link href={isAdmin ? '/admin' : '/seller'} onClick={onNavigate}>
                    <Logo tone="light" />
                </Link>
                <p className="mt-4 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.14em] text-gold uppercase">
                    {isAdmin && <ShieldCheck className="size-3.5" />}
                    {isAdmin ? 'Panel Admin' : 'Dashboard UMKM'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4">
                <NavList items={items} onNavigate={onNavigate} />
            </div>

            <div className="border-t border-sidebar-border p-4">
                {!isAdmin && user?.umkm && (
                    <div className="mb-3 rounded-xl bg-sidebar-accent/70 p-3">
                        <p className="truncate text-sm font-bold text-ivory">{user.umkm.name}</p>
                        <Badge variant={umkmTone[user.umkm.status]} className="mt-1.5">
                            {user.umkm.status_label}
                        </Badge>
                    </div>
                )}
                <Link
                    href="/"
                    className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-ivory"
                >
                    <ExternalLink className="size-4" strokeWidth={1.75} />
                    Lihat toko
                </Link>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { app } = usePage().props;

    return (
        <div className="min-h-svh bg-background lg:pl-[17rem]">
            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] bg-sidebar text-sidebar-foreground lg:block">
                <SidebarBody />
            </aside>

            {/* Sidebar mobile */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="w-[18rem] max-w-[85vw] gap-0 border-0 bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden">
                    <SheetTitle className="sr-only">Menu dashboard</SheetTitle>
                    <SheetDescription className="sr-only">Navigasi dashboard</SheetDescription>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Tutup menu"
                        className="absolute top-4 right-3 text-cream hover:bg-cream/10"
                        onClick={() => setOpen(false)}
                    >
                        <X className="size-5" />
                    </Button>
                    <SidebarBody onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex min-h-svh flex-col">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="-ml-2 lg:hidden"
                        aria-label="Buka menu"
                        onClick={() => setOpen(true)}
                    >
                        <Menu className="size-5" />
                    </Button>
                    <Link href="/" className="lg:hidden">
                        <Logo compact />
                    </Link>
                    <div className="ml-auto flex items-center gap-1">
                        {app.demo && (
                            <Badge variant="gold" className="mr-1 hidden sm:inline-flex">
                                MODE DEMO
                            </Badge>
                        )}
                        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                            <Link href="/">
                                <ExternalLink />
                                Lihat toko
                            </Link>
                        </Button>
                        <NotificationBell />
                        <AccountMenu />
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full max-w-[1180px]">{children}</div>
                </main>
            </div>
        </div>
    );
}
