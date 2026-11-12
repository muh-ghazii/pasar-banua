import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, MapPin, MessageCircle, PackageCheck, Phone, Star, Store, XCircle } from 'lucide-react';
import { useState } from 'react';
import ProductImage from '@/components/brand/product-visual';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import OrderTimeline from '@/components/shared/order-timeline';
import { DemoBadge, OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type { OrderData } from '@/types/domain';

type Props = {
    order: OrderData;
    sellerContact: { phone: string | null } | null;
};

export default function OrderShow({ order, sellerContact }: Props) {
    const [confirm, setConfirm] = useState<'cancel' | 'received' | null>(null);
    const [processing, setProcessing] = useState(false);

    const act = (kind: 'cancel' | 'received') => {
        router.post(
            `/akun/pesanan/${order.number}/${kind === 'cancel' ? 'batal' : 'diterima'}`,
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setConfirm(null);
                },
            },
        );
    };

    const waNumber = sellerContact?.phone?.replace(/\D/g, '').replace(/^0/, '62');

    return (
        <>
            <Head title={`Pesanan ${order.number}`} />
            <div className="container-page py-8 lg:py-12">
                <Link href="/akun/pesanan" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
                    <ArrowLeft className="size-4" />
                    Semua pesanan
                </Link>

                <div className="mt-4 mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Dibuat {formatDateTime(order.created_at)}</p>
                        <h1 className="mt-1 font-heading text-2xl font-extrabold text-navy sm:text-3xl">{order.number}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {order.is_demo && <DemoBadge />}
                        <OrderStatusBadge status={order.status} />
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
                    <div className="space-y-6">
                        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card">
                            <header className="flex items-center justify-between gap-3 border-b border-border/70 bg-cream-200/40 px-5 py-3">
                                <Link href={`/umkm/${order.umkm?.slug}`} className="flex items-center gap-2 text-sm font-bold text-navy hover:text-teal">
                                    <Store className="size-4 text-teal" />
                                    {order.umkm?.name}
                                </Link>
                                <span className="text-xs text-muted-foreground">{order.umkm?.city}</span>
                            </header>
                            <ul className="divide-y divide-border/70">
                                {order.items.map((item) => (
                                    <li key={item.id} className="flex items-center gap-4 p-5">
                                        <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                                            <ProductImage src={item.image_url} name={item.product_name} label={false} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            {item.product_slug ? (
                                                <Link href={`/produk/${item.product_slug}`} className="line-clamp-2 font-heading text-[0.95rem] font-bold text-navy hover:text-teal">
                                                    {item.product_name}
                                                </Link>
                                            ) : (
                                                <p className="line-clamp-2 font-heading text-[0.95rem] font-bold text-navy">{item.product_name}</p>
                                            )}
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {item.quantity} × {formatRupiah(item.unit_price)}
                                            </p>
                                            {order.status === 'completed' && item.product_slug && (
                                                <Link
                                                    href={`/produk/${item.product_slug}#ulasan`}
                                                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
                                                >
                                                    <Star className="size-3.5" />
                                                    Beri ulasan
                                                </Link>
                                            )}
                                        </div>
                                        <p className="font-semibold text-navy">{formatRupiah(item.subtotal)}</p>
                                    </li>
                                ))}
                            </ul>
                            <dl className="grid gap-2 border-t border-border/70 px-5 py-4 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Subtotal</dt>
                                    <dd className="text-navy">{formatRupiah(order.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Ongkos kirim</dt>
                                    <dd className="text-navy">{formatRupiah(order.shipping_fee)}</dd>
                                </div>
                                <div className="flex items-baseline justify-between border-t border-border pt-2">
                                    <dt className="font-semibold text-navy">Total</dt>
                                    <dd className="font-heading text-xl font-extrabold text-navy">{formatRupiah(order.total)}</dd>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <dt className="text-muted-foreground">Pembayaran</dt>
                                    <dd className="text-navy">{order.payment_label}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="rounded-2xl border border-border/80 bg-card p-5">
                            <h2 className="flex items-center gap-2 font-heading text-base font-bold text-navy">
                                <MapPin className="size-4 text-teal" />
                                Alamat pengiriman
                            </h2>
                            <p className="mt-3 text-sm font-semibold text-navy">{order.recipient_name}</p>
                            <p className="text-sm text-muted-foreground">{order.phone}</p>
                            <p className="mt-1 text-sm text-pretty text-navy-700">
                                {order.address_line}
                                {order.city ? `, ${order.city}` : ''}
                                {order.postal_code ? ` ${order.postal_code}` : ''}
                            </p>
                            {order.notes && (
                                <p className="mt-3 rounded-lg bg-cream-200/60 px-3 py-2 text-xs text-navy-700">Catatan: {order.notes}</p>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                        <section className="rounded-2xl border border-border/80 bg-ivory p-5">
                            <h2 className="mb-5 font-heading text-base font-bold text-navy">Status pesanan</h2>
                            <OrderTimeline order={order} />
                        </section>

                        {(order.can?.cancel || order.can?.confirm_received || waNumber) && (
                            <section className="grid gap-2.5 rounded-2xl border border-border/80 bg-card p-5">
                                {order.can?.confirm_received && (
                                    <Button onClick={() => setConfirm('received')}>
                                        <PackageCheck />
                                        Pesanan sudah diterima
                                    </Button>
                                )}
                                {waNumber && (
                                    <Button asChild variant="outline">
                                        <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo, saya ingin bertanya tentang pesanan ${order.number}.`)}`} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle />
                                            Hubungi penjual
                                        </a>
                                    </Button>
                                )}
                                {order.can?.cancel && (
                                    <Button variant="ghost" className="text-brick hover:bg-brick-100 hover:text-brick" onClick={() => setConfirm('cancel')}>
                                        <XCircle />
                                        Batalkan pesanan
                                    </Button>
                                )}
                                {sellerContact?.phone && (
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Phone className="size-3.5" />
                                        {sellerContact.phone}
                                    </p>
                                )}
                            </section>
                        )}
                    </aside>
                </div>
            </div>

            <ConfirmDialog
                open={confirm === 'cancel'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title="Batalkan pesanan ini?"
                description="Pesanan yang belum dikonfirmasi penjual dapat dibatalkan. Stok produk akan dikembalikan."
                confirmLabel="Ya, batalkan"
                destructive
                processing={processing}
                onConfirm={() => act('cancel')}
            />
            <ConfirmDialog
                open={confirm === 'received'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title="Konfirmasi pesanan diterima?"
                description="Pesanan akan ditandai selesai dan Anda dapat memberi ulasan untuk produknya."
                confirmLabel="Ya, sudah diterima"
                processing={processing}
                onConfirm={() => act('received')}
            />
        </>
    );
}
