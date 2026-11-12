import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, MapPin, NotebookPen, Phone, ReceiptText, UserRound } from 'lucide-react';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import OrderStatusActions from '@/components/seller/order-status-actions';
import OrderTimeline from '@/components/shared/order-timeline';
import { DemoBadge, OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OrderData } from '@/types/domain';

function Card({ title, icon: Icon, children, className }: { title: string; icon: typeof MapPin; children: React.ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-2xl border border-border/80 bg-card p-5 shadow-soft', className)}>
            <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold text-navy">
                <Icon className="size-4 text-teal" strokeWidth={1.75} />
                {title}
            </h2>
            {children}
        </section>
    );
}

export default function SellerOrderShow({ order }: { order: OrderData }) {
    return (
        <>
            <Head title={`Pesanan ${order.number}`} />
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
                <Link href="/seller/pesanan">
                    <ArrowLeft />
                    Pesanan masuk
                </Link>
            </Button>
            <PageHeader
                eyebrow="Detail pesanan"
                title={order.number}
                description={`Dibuat ${formatDateTime(order.created_at)} · ${order.payment_label}`}
                actions={
                    <div className="flex items-center gap-2">
                        {order.is_demo && <DemoBadge />}
                        <OrderStatusBadge status={order.status} />
                    </div>
                }
            />

            {order.can?.update_status && (
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-teal/20 bg-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-pretty text-teal-700">
                        {order.status === 'pending'
                            ? 'Pesanan baru menunggu konfirmasi Anda. Periksa stok lalu terima pesanan.'
                            : order.status === 'processing'
                              ? 'Siapkan dan kemas pesanan, lalu tandai dikirim beserta catatan pengiriman.'
                              : 'Pesanan dalam pengiriman. Pembeli akan mengonfirmasi saat barang diterima.'}
                    </p>
                    <OrderStatusActions order={order} />
                </div>
            )}

            {order.status === 'cancelled' && order.cancel_reason && (
                <div className="mb-6 rounded-2xl border border-brick/20 bg-brick-100/60 p-4 text-sm">
                    <p className="font-semibold text-brick">Pesanan dibatalkan</p>
                    <p className="mt-0.5 text-navy/80">{order.cancel_reason}</p>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="grid content-start gap-6">
                    <Card title={`Produk (${order.items.length})`} icon={ReceiptText}>
                        <ul className="divide-y divide-border/70">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                                        <ProductImage src={item.image_url} name={item.product_name} label={false} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm font-semibold text-navy">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} × {formatRupiah(item.unit_price)}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-navy">{formatRupiah(item.subtotal)}</p>
                                </li>
                            ))}
                        </ul>
                        <dl className="mt-4 grid gap-2 border-t border-border/70 pt-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Subtotal produk</dt>
                                <dd className="font-semibold text-navy">{formatRupiah(order.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Ongkos kirim (tarif flat demo)</dt>
                                <dd className="font-semibold text-navy">{formatRupiah(order.shipping_fee)}</dd>
                            </div>
                            <div className="flex justify-between border-t border-border/70 pt-2 text-base">
                                <dt className="font-heading font-bold text-navy">Total dibayar pembeli</dt>
                                <dd className="font-heading font-extrabold text-navy">{formatRupiah(order.total)}</dd>
                            </div>
                        </dl>
                    </Card>

                    {order.notes && (
                        <Card title="Catatan pembeli" icon={NotebookPen}>
                            <p className="text-sm text-pretty whitespace-pre-line text-navy/85">{order.notes}</p>
                        </Card>
                    )}
                </div>

                <div className="grid content-start gap-6">
                    <Card title="Pengiriman" icon={MapPin}>
                        <div className="grid gap-3 text-sm">
                            <p className="flex items-center gap-2 font-semibold text-navy">
                                <UserRound className="size-4 text-muted-foreground" />
                                {order.recipient_name}
                            </p>
                            <a href={`tel:${order.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2 text-teal hover:underline">
                                <Phone className="size-4" />
                                {order.phone}
                            </a>
                            <p className="text-pretty text-navy/85">
                                {order.address_line}
                                {order.city && `, ${order.city}`}
                                {order.postal_code && ` ${order.postal_code}`}
                            </p>
                            {order.tracking_note && (
                                <p className="rounded-lg bg-cream-200/70 p-3 text-xs text-navy/85">
                                    <span className="font-semibold">Catatan pengiriman:</span> {order.tracking_note}
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card title="Riwayat status" icon={CalendarClock}>
                        <OrderTimeline order={order} />
                    </Card>

                    {order.buyer && (
                        <Card title="Akun pembeli" icon={UserRound}>
                            <p className="text-sm font-semibold text-navy">{order.buyer.name}</p>
                            <p className="text-xs break-all text-muted-foreground">{order.buyer.email}</p>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
