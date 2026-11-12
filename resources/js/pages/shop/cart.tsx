import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    MapPin,
    ShieldCheck,
    ShoppingBag,
    Store,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import ProductImage from '@/components/brand/product-visual';
import EmptyState from '@/components/shared/empty-state';
import QuantityStepper from '@/components/shared/quantity-stepper';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CartLine, CartSummary } from '@/types/shop';

export default function Cart({ cart }: { cart: CartSummary }) {
    const { auth } = usePage().props;
    const empty = cart.groups.length === 0;

    return (
        <>
            <Head title="Keranjang" />
            <div className="container-page py-8 lg:py-12">
                <div className="mb-8">
                    <p className="eyebrow mb-2 text-teal">Belanja</p>
                    <h1 className="font-heading text-3xl font-extrabold text-navy sm:text-4xl">
                        Keranjang
                    </h1>
                    {!empty && (
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {cart.items_count} barang dari {cart.groups.length}{' '}
                            UMKM. Pesanan dibuat terpisah untuk setiap UMKM.
                        </p>
                    )}
                </div>

                {empty ? (
                    <EmptyState
                        icon={ShoppingBag}
                        title="Keranjang Anda masih kosong"
                        description="Temukan amplang, dodol, sasirangan, dan karya lain dari UMKM Banua."
                        action={
                            <Button asChild>
                                <Link href="/produk">Mulai belanja</Link>
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
                        <div className="space-y-5">
                            {cart.has_issues && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-3 rounded-xl border border-brick/30 bg-brick-100/70 p-4 text-sm text-brick"
                                >
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                    Ada produk yang stoknya habis. Hapus produk
                                    tersebut untuk melanjutkan ke checkout.
                                </div>
                            )}
                            {cart.groups.map((group) => (
                                <section
                                    key={group.umkm.id}
                                    className="overflow-hidden rounded-2xl border border-border/80 bg-card"
                                    aria-label={`Produk dari ${group.umkm.name}`}
                                >
                                    <header className="flex items-center justify-between gap-3 border-b border-border/80 bg-cream-200/50 px-4 py-3 sm:px-5">
                                        <Link
                                            href={`/umkm/${group.umkm.slug}`}
                                            className="flex min-w-0 items-center gap-2 font-heading text-sm font-bold text-navy hover:text-teal"
                                        >
                                            <Store className="size-4 shrink-0 text-teal" />
                                            <span className="truncate">{group.umkm.name}</span>
                                        </Link>
                                        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="size-3.5" />
                                            {group.umkm.city}
                                        </span>
                                    </header>
                                    <ul className="divide-y divide-border/70">
                                        {group.items.map((item) => (
                                            <CartRow key={item.id} item={item} />
                                        ))}
                                    </ul>
                                    <footer className="flex justify-between gap-3 border-t border-border/70 px-4 py-3 text-sm sm:px-5">
                                        <span className="text-muted-foreground">
                                            Subtotal + ongkir {formatRupiah(group.shipping_fee)}
                                        </span>
                                        <span className="font-semibold text-navy">
                                            {formatRupiah(group.subtotal + group.shipping_fee)}
                                        </span>
                                    </footer>
                                </section>
                            ))}
                        </div>

                        <Summary cart={cart} loggedIn={!!auth.user} />
                    </div>
                )}
            </div>
        </>
    );
}

function CartRow({ item }: { item: CartLine }) {
    const [busy, setBusy] = useState(false);
    const p = item.product;

    const update = (quantity: number) => {
        router.patch(
            `/keranjang/${item.id}`,
            { quantity },
            {
                preserveScroll: true,
                onStart: () => setBusy(true),
                onFinish: () => setBusy(false),
            },
        );
    };

    const remove = () => {
        router.delete(`/keranjang/${item.id}`, {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <li
            className={cn(
                'flex gap-3.5 p-4 transition-opacity sm:gap-4 sm:p-5',
                busy && 'opacity-60',
                !item.available && 'bg-brick-100/30',
            )}
        >
            <Link
                href={`/produk/${p.slug}`}
                className="size-20 shrink-0 overflow-hidden rounded-xl bg-cream-200 sm:size-24"
            >
                <ProductImage
                    src={p.image_url}
                    name={p.name}
                    categorySlug={p.category_slug}
                    label={false}
                />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={`/produk/${p.slug}`}
                            className="line-clamp-2 font-heading text-[0.95rem] leading-snug font-bold text-navy hover:text-teal"
                        >
                            {p.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {p.category} · {formatRupiah(p.price)} / unit
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={remove}
                        disabled={busy}
                        aria-label={`Hapus ${p.name} dari keranjang`}
                        className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-brick-100 hover:text-brick"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
                {item.issue && (
                    <p className="mt-1.5 text-xs font-semibold text-brick">{item.issue}</p>
                )}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                    <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        max={Math.max(1, Math.min(p.stock, 99))}
                        disabled={busy || !item.available}
                        onChange={update}
                        label={`Jumlah ${p.name}`}
                    />
                    <p className="font-heading text-base font-extrabold text-navy">
                        {formatRupiah(item.line_total)}
                    </p>
                </div>
            </div>
        </li>
    );
}

function Summary({ cart, loggedIn }: { cart: CartSummary; loggedIn: boolean }) {
    const disabled = cart.has_issues || cart.items_count === 0;

    return (
        <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/80 bg-ivory p-5 sm:p-6">
                <h2 className="font-heading text-lg font-bold text-navy">Ringkasan belanja</h2>
                <dl className="mt-4 grid gap-2.5 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Subtotal ({cart.items_count} barang)</dt>
                        <dd className="font-semibold text-navy">{formatRupiah(cart.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Ongkos kirim ({cart.groups.length} UMKM)</dt>
                        <dd className="font-semibold text-navy">{formatRupiah(cart.shipping_fee)}</dd>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                        <dt className="font-semibold text-navy">Total</dt>
                        <dd className="font-heading text-2xl font-extrabold text-navy">
                            {formatRupiah(cart.total)}
                        </dd>
                    </div>
                </dl>
                <Button asChild={!disabled} size="lg" className="mt-5 hidden w-full lg:inline-flex" disabled={disabled}>
                    {disabled ? (
                        <span>Lanjut ke checkout</span>
                    ) : (
                        <Link href="/checkout">
                            Lanjut ke checkout
                            <ArrowRight />
                        </Link>
                    )}
                </Button>
                {!loggedIn && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        Anda akan diminta masuk sebelum checkout. Isi keranjang
                        tetap tersimpan.
                    </p>
                )}
                <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="mt-px size-4 shrink-0 text-teal" />
                    Harga, stok, dan total dihitung ulang di server saat
                    pesanan dibuat.
                </p>
            </div>

            {/* Bar checkout menempel di ponsel */}
            <div className="pb-safe fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 pt-2.5 backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-lg items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-heading text-lg font-extrabold text-navy">{formatRupiah(cart.total)}</p>
                    </div>
                    {disabled ? (
                        <Button disabled>Checkout</Button>
                    ) : (
                        <Button asChild>
                            <Link href="/checkout">
                                Checkout
                                <ArrowRight />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
            <div className="h-16 lg:hidden" aria-hidden="true" />
        </aside>
    );
}
