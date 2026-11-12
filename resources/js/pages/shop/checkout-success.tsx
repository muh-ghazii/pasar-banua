import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Store } from 'lucide-react';
import { OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format';
import type { OrderData } from '@/types/domain';

export default function CheckoutSuccess({ orders }: { orders: OrderData[] }) {
    const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);

    return (
        <>
            <Head title="Pesanan berhasil dibuat" />
            <div className="container-page max-w-3xl py-10 lg:py-16">
                <div className="text-center">
                    <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-teal-100 text-teal">
                        <CheckCircle2 className="size-8" strokeWidth={1.75} />
                    </span>
                    <h1 className="mt-5 font-heading text-3xl font-extrabold text-balance text-navy">
                        Terima kasih, pesanan Anda sudah kami terima
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm text-pretty text-muted-foreground">
                        {orders.length > 1
                            ? `Pesanan dipecah menjadi ${orders.length} bagian karena berasal dari UMKM yang berbeda. `
                            : ''}
                        Penjual akan mengonfirmasi pesanan. Pantau statusnya di
                        halaman Pesanan saya. Ini adalah transaksi demo: tidak
                        ada pembayaran yang ditagihkan.
                    </p>
                </div>

                <ul className="mt-10 grid gap-3">
                    {orders.map((o) => (
                        <li
                            key={o.id}
                            className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <p className="font-heading text-sm font-bold text-navy">{o.number}</p>
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Store className="size-4 text-teal" />
                                    {o.umkm?.name} · {o.items.length} produk
                                </p>
                            </div>
                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                                <OrderStatusBadge status={o.status} />
                                <span className="font-heading font-extrabold text-navy">{formatRupiah(o.total)}</span>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/akun/pesanan/${o.number}`}>Detail</Link>
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>

                <p className="mt-5 flex justify-between rounded-xl bg-ivory px-5 py-4 text-sm">
                    <span className="font-semibold text-navy">Total seluruh pesanan</span>
                    <span className="font-heading text-lg font-extrabold text-navy">{formatRupiah(grandTotal)}</span>
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild size="lg">
                        <Link href="/akun/pesanan">Lihat pesanan saya</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/produk">Lanjut belanja</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
