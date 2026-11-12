import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Search, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/brand/logo';
import { categoryIcon } from '@/components/brand/category-icon';
import AccountMenu from '@/components/shared/account-menu';
import NotificationBell from '@/components/shared/notification-bell';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import SearchForm from './search-form';

export function CartButton({ className }: { className?: string }) {
    const { cartCount } = usePage().props;

    return (
        <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn('relative', className)}
        >
            <Link
                href="/keranjang"
                aria-label={`Keranjang${cartCount ? `, ${cartCount} barang` : ''}`}
            >
                <ShoppingBag className="size-5" strokeWidth={1.75} />
                {cartCount > 0 && (
                    <span className="absolute top-1 right-1 flex min-w-[1.1rem] items-center justify-center rounded-full bg-teal px-1 text-[0.62rem] leading-[1.1rem] font-bold text-ivory ring-2 ring-cream">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                )}
            </Link>
        </Button>
    );
}

export default function SiteHeader() {
    const { auth, navCategories, app } = usePage().props;
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const [searchOpen, setSearchOpen] = useState(false);

    const link = (active: boolean) =>
        cn(
            'relative inline-flex h-10 items-center rounded-lg px-3 text-[0.9rem] font-semibold transition-colors',
            active ? 'text-teal' : 'text-navy hover:bg-accent',
        );

    return (
        <>
            {app.demo && (
                <div className="bg-navy text-cream">
                    <p className="container-page py-1.5 text-center text-[0.72rem] leading-snug text-pretty sm:text-xs">
                        <span className="mr-2 rounded bg-gold px-1.5 py-0.5 text-[0.62rem] font-extrabold tracking-wide text-navy">
                            MODE DEMO
                        </span>
                        Produk, UMKM, dan transaksi bersifat simulasi. Pembayaran dan ekspedisi belum terintegrasi.
                    </p>
                </div>
            )}

            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
                <div className="container-page flex h-16 items-center gap-3 lg:h-[4.5rem] lg:gap-6">
                    <Link href="/" aria-label="Pasar Banua — Beranda" className="shrink-0">
                        <Logo />
                    </Link>

                    <nav aria-label="Navigasi utama" className="ml-2 hidden items-center gap-0.5 lg:flex">
                        <Link href="/" className={link(isCurrentUrl('/'))}>
                            Beranda
                        </Link>
                        <Link href="/produk" className={link(isCurrentOrParentUrl('/produk'))}>
                            Jelajahi Produk
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(link(isCurrentOrParentUrl('/kategori')), 'gap-1 outline-none')}
                                >
                                    Kategori
                                    <ChevronDown className="size-4 opacity-60" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                                {navCategories.map((c) => {
                                    const Icon = categoryIcon(c.icon);

                                    return (
                                        <DropdownMenuItem key={c.id} asChild>
                                            <Link href={`/produk?kategori=${c.slug}`} className="cursor-pointer py-2">
                                                <Icon className="text-teal" />
                                                {c.name}
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                })}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/kategori" className="cursor-pointer font-semibold text-teal">
                                        Lihat semua kategori
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href="/cerita-banua" className={link(isCurrentOrParentUrl('/cerita-banua'))}>
                            Cerita Banua
                        </Link>
                    </nav>

                    <SearchForm className="ml-auto hidden max-w-sm flex-1 lg:block xl:max-w-md" />

                    <div className="ml-auto flex items-center gap-1 lg:ml-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            aria-label={searchOpen ? 'Tutup pencarian' : 'Buka pencarian'}
                            aria-expanded={searchOpen}
                            onClick={() => setSearchOpen((v) => !v)}
                        >
                            {searchOpen ? <X className="size-5" /> : <Search className="size-5" strokeWidth={1.75} />}
                        </Button>
                        <CartButton className="hidden lg:inline-flex" />
                        {auth.user ? (
                            <>
                                <NotificationBell />
                                <AccountMenu />
                            </>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                                    <Link href="/login">Masuk</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/register">Daftar</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {searchOpen && (
                    <div className="border-t border-border/70 bg-background px-4 py-3 lg:hidden">
                        <SearchForm id="mobile-search" autoFocus onDone={() => setSearchOpen(false)} />
                    </div>
                )}
            </header>
        </>
    );
}
