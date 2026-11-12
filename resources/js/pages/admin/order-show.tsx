import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, MapPin, Phone, Store, UserRound, XCircle } from 'lucide-react';
import { useState } from 'react';
import { ReasonDialog } from '@/components/admin/actions';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import OrderTimeline from '@/components/shared/order-timeline';
import { DemoBadge, OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type { OrderData } from '@/types/domain';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
            <h2 className="mb-3 font-heading text-base font-bold text-navy">{title}</h2>
            {children}
        </section>
    );
}

function Line({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2.5 text-sm text-navy">
            <Icon className="mt-0.5 size-4 shrink-0 text-teal" strokeWidth={1.75} />
            <span className="min-w-0 break-words">{children}</span>
        </li>
    );
}

export default function AdminOrderShow({
    order,
    buyerPhone,
    sellerContact,
    canCancel,
}: {
    order: OrderData;
    buyerPhone: string | null;
    sellerContact: { phone: string | null; id: number } | null;
    canCancel: boolean;
}) {
    const [cancelling, setCancelling] = useState(false);

    return (
        <>
            <Head title={`Pesanan ${order.number}`} />
            <Link href="/admin/pesanan" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
                <ArrowLeft className="size-4" />
                Manajemen Pesanan
            </Link>

            <PageHeader
                title={`Pesanan ${order.number}`}
                description={`Dibuat ${formatDateTime(order.created_at)} · ${order.payment_label}`}
                actions={
                    canCancel && (
                        <Button variant="outline" size="sm" className="text-brick" onClick={() => setCancelling(true)}>
                            <XCircle />
                            Batalkan pesanan
                        </Button>
                    )
                }
            />

            <div className="mb-6 flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
                {order.is_demo && <DemoBadge />}
                {order.is_demo && <span className="text-xs text-muted-foreground">Transaksi simulasi, tanpa pembayaran sungguhan.</span>}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="grid content-start gap-6">
                    <section className="rounded-2xl border border-border/80 bg-card shadow-soft">
                        <h2 className="border-b border-border/70 px-5 py-4 font-heading text-base font-bold text-navy">
                            Produk dipesan
                        </h2>
                        <ul className="divide-y divide-border/70">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-center gap-3 px-5 py-4">
                                    <span className="size-14 shrink-0 overflow-hidden rounded-xl">
                                        <ProductImage src={item.image_url} name={item.product_name} label={false} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        {item.product_id ? (
                                            <Link href={`/admin/produk/${item.product_id}`} className="block truncate text-sm font-semibold text-navy hover:text-teal">
                                                {item.product_name}
                                            </Link>
                                        ) : (
                                            <p className="truncate text-sm font-semibold text-navy">{item.product_name}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} × {formatRupiah(item.unit_price)}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-navy">{formatRupiah(item.subtotal)}</p>
                                </li>
                            ))}
                        </ul>
                        <dl className="grid gap-2 border-t border-border/70 px-5 py-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Subtotal</dt>
                                <dd className="text-navy">{formatRupiah(order.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Ongkos kirim (tarif flat demo)</dt>
                                <dd className="text-navy">{formatRupiah(order.shipping_fee)}</dd>
                            </div>
                            <div className="flex justify-between border-t border-border/70 pt-2 text-base">
                                <dt className="font-semibold text-navy">Total</dt>
                                <dd className="font-heading font-extrabold text-navy">{formatRupiah(order.total)}</dd>
                            </div>
                        </dl>
                    </section>

                    <Card title="Riwayat status">
                        <OrderTimeline order={order} />
                    </Card>
                </div>

                <aside className="grid content-start gap-6">
                    <Card title="Pembeli & pengiriman">
                        <ul className="grid gap-2.5">
                            <Line icon={UserRound}>
                                {order.buyer?.name ?? '-'}
                                <span className="block text-xs text-muted-foreground">Penerima: {order.recipient_name}</span>
                            </Line>
                            {order.buyer?.email && <Line icon={Mail}>{order.buyer.email}</Line>}
                            <Line icon={Phone}>
                                {order.phone}
                                {buyerPhone && buyerPhone !== order.phone && (
                                    <span className="block text-xs text-muted-foreground">Akun: {buyerPhone}</span>
                                )}
                            </Line>
                            <Line icon={MapPin}>
                                {order.address_line}
                                {order.city && `, ${order.city}`}
                                {order.postal_code && ` ${order.postal_code}`}
                            </Line>
                        </ul>
                        {order.notes && (
                            <p className="mt-3 rounded-lg bg-cream-200/60 px-3 py-2 text-sm text-navy">
                                <span className="font-semibold">Catatan: </span>
                                {order.notes}
                            </p>
                        )}
                    </Card>

                    {order.umkm && (
                        <Card title="UMKM penjual">
                            <ul className="grid gap-2.5">
                                <Line icon={Store}>
                                    {order.umkm.name}
                                    <span className="block text-xs text-muted-foreground">{order.umkm.city}</span>
                                </Line>
                                {sellerContact?.phone && <Line icon={Phone}>{sellerContact.phone}</Line>}
                            </ul>
                            {sellerContact && (
                                <Link href={`/admin/umkm/${sellerContact.id}`} className="mt-3 inline-block text-sm font-semibold text-teal hover:underline">
                                    Lihat data UMKM
                                </Link>
                            )}
                        </Card>
                    )}
                </aside>
            </div>

            <ReasonDialog
                open={cancelling}
                onOpenChange={setCancelling}
                url={`/admin/pesanan/${order.number}/batalkan`}
                title={`Batalkan pesanan ${order.number}?`}
                description="Stok produk dikembalikan dan pembeli menerima notifikasi pembatalan beserta alasannya."
                confirmLabel="Batalkan pesanan"
                suggestions={['Permintaan pembeli melalui layanan pelanggan', 'Penjual tidak merespons lebih dari 3 hari', 'Indikasi pesanan fiktif']}
            />
        </>
    );
}
