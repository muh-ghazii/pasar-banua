import { Link, usePage } from '@inertiajs/react';
import { BookOpenText, Compass, Home, ShoppingBag, UserRound } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

/** Navigasi bawah untuk smartphone (area jempol). Disembunyikan di layar lebar. */
export default function MobileTabbar() {
    const { auth, cartCount } = usePage().props;
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const items = [
        { href: '/', label: 'Beranda', icon: Home, active: isCurrentUrl('/') },
        { href: '/produk', label: 'Jelajah', icon: Compass, active: isCurrentOrParentUrl('/produk') || isCurrentOrParentUrl('/kategori') },
        { href: '/cerita-banua', label: 'Cerita', icon: BookOpenText, active: isCurrentOrParentUrl('/cerita-banua') },
        { href: '/keranjang', label: 'Keranjang', icon: ShoppingBag, active: isCurrentOrParentUrl('/keranjang') || isCurrentOrParentUrl('/checkout'), badge: cartCount },
        {
            href: auth.user ? '/akun/pesanan' : '/login',
            label: auth.user ? 'Akun' : 'Masuk',
            icon: UserRound,
            active: isCurrentOrParentUrl('/akun') || isCurrentOrParentUrl('/settings') || isCurrentUrl('/login'),
        },
    ];

    return (
        <nav
            aria-label="Navigasi bawah"
            className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
        >
            <ul className="mx-auto grid max-w-lg grid-cols-5">
                {items.map((item) => (
                    <li key={item.label}>
                        <Link
                            href={item.href}
                            aria-current={item.active ? 'page' : undefined}
                            className={cn(
                                'relative flex h-14 flex-col items-center justify-center gap-0.5 text-[0.68rem] font-semibold transition-colors',
                                item.active ? 'text-teal' : 'text-muted-foreground',
                            )}
                        >
                            <span className="relative">
                                <item.icon className="size-[22px]" strokeWidth={item.active ? 2.1 : 1.75} />
                                {!!item.badge && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-2.5 flex min-w-4 items-center justify-center rounded-full bg-teal px-1 text-[0.6rem] leading-4 font-bold text-ivory">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </span>
                            {item.label}
                            {item.active && (
                                <span className="absolute top-0 h-0.5 w-8 rounded-b bg-teal" />
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
