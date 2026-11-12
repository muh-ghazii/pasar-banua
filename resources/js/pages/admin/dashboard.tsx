import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    ClipboardList,
    Package,
    Store,
} from 'lucide-react';
import KpiTargets from '@/components/admin/kpi';
import ProductImage from '@/components/brand/product-visual';
import { LineChart } from '@/components/dashboard/mini-chart';
import PageHeader from '@/components/dashboard/page-header';
import ResponsiveTable from '@/components/dashboard/responsive-table';
import StatCard from '@/components/dashboard/stat-card';
import EmptyState from '@/components/shared/empty-state';
import { DemoBadge, OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
    formatCompactRupiah,
    formatDate,
    formatNumber,
    formatRupiah,
    timeAgo,
} from '@/lib/format';
import type { KpiData, MonthlyPoint, TotalsData } from '@/types/admin';
import type { OrderStatus } from '@/types/domain';

type PendingUmkm = {
    id: number;
    name: string;
    city: string;
    owner: string | null;
    products_count: number;
    created_at: string | null;
};

type PendingProduct = {
    id: number;
    name: string;
    price: number;
    umkm: string | null;
    category: string | null;
    category_slug: string | null;
    category_icon: string | null;
    image_url: string | null;
    created_at: string | null;
};

type LatestOrder = {
    number: string;
    status: OrderStatus;
    total: number;
    buyer: string | null;
    umkm: string | null;
    is_demo: boolean;
    created_at: string | null;
};

function QueueCard({
    title,
    href,
    count,
    children,
}: {
    title: string;
    href: string;
    count: number;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-soft">
            <header className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold text-navy">
                    {title}
                    {count > 0 && (
                        <span className="rounded-full bg-gold px-2 text-xs leading-5 font-bold text-navy">{count}</span>
                    )}
                </h2>
                <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline">
                    Lihat semua
                    <ArrowRight className="size-4" />
                </Link>
            </header>
            <div className="flex-1 p-2">{children}</div>
        </section>
    );
}

export default function AdminDashboard({
    kpis,
    totals,
    trend,
    pendingUmkm,
    pendingProducts,
    latestOrders,
}: {
    kpis: KpiData;
    totals: TotalsData;
    trend: MonthlyPoint[];
    pendingUmkm: PendingUmkm[];
    pendingProducts: PendingProduct[];
    latestOrders: LatestOrder[];
}) {
    const { auth, app } = usePage().props;
    const demo = app.demo || totals.has_demo;
    const firstName = auth.user?.name.split(' ')[0] ?? 'Admin';

    return (
        <>
            <Head title="Overview Admin" />
            <PageHeader
                eyebrow="Panel Admin"
                title={`Halo, ${firstName}`}
                description="Ringkasan kondisi marketplace dan pekerjaan yang menunggu tindakan Anda."
                actions={
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/analitik">Laporan lengkap</Link>
                    </Button>
                }
            />

            <div className="grid gap-6">
                <KpiTargets kpis={kpis} demo={demo} />

                <section aria-labelledby="angka-aktual">
                    <div className="mb-3 flex items-center gap-2">
                        <h2 id="angka-aktual" className="font-heading text-base font-bold text-navy">
                            Angka saat ini
                        </h2>
                        {demo && <DemoBadge />}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                        <StatCard
                            label="UMKM terverifikasi"
                            value={formatNumber(totals.umkm_active)}
                            hint={`${totals.umkm_pending} menunggu verifikasi`}
                            icon={Store}
                        />
                        <StatCard
                            label="Produk tayang"
                            value={formatNumber(totals.products_published)}
                            hint={`${totals.products_pending} menunggu kurasi`}
                            icon={Package}
                            tone="navy"
                        />
                        <StatCard
                            label="Transaksi"
                            value={formatNumber(totals.orders)}
                            hint="Tidak termasuk pesanan dibatalkan"
                            icon={ClipboardList}
                            tone="gold"
                        />
                        <StatCard
                            label="Nilai transaksi"
                            value={formatCompactRupiah(totals.gmv)}
                            hint={formatRupiah(totals.gmv)}
                            icon={Banknote}
                            tone="brick"
                        />
                    </div>
                </section>

                <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="font-heading text-base font-bold text-navy">Transaksi 6 bulan terakhir</h2>
                            <p className="text-sm text-muted-foreground">Jumlah pesanan per bulan, di luar yang dibatalkan.</p>
                        </div>
                        {demo && <DemoBadge />}
                    </div>
                    <LineChart
                        data={trend.map((t) => ({ label: t.label, value: t.orders }))}
                        format={(v) => `${formatNumber(v)} pesanan`}
                        height={170}
                    />
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <QueueCard title="Verifikasi UMKM" href="/admin/umkm?status=pending" count={totals.umkm_pending}>
                        {pendingUmkm.length === 0 ? (
                            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                                Tidak ada pendaftaran yang menunggu. Semua sudah ditinjau.
                            </p>
                        ) : (
                            <ul>
                                {pendingUmkm.map((u) => (
                                    <li key={u.id}>
                                        <Link
                                            href={`/admin/umkm/${u.id}`}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent/60"
                                        >
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                                                <Store className="size-[18px]" strokeWidth={1.75} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-semibold text-navy">{u.name}</span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {u.owner} · {u.city} · {u.products_count} produk
                                                </span>
                                            </span>
                                            <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(u.created_at)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </QueueCard>

                    <QueueCard title="Kurasi produk" href="/admin/produk?status=pending" count={totals.products_pending}>
                        {pendingProducts.length === 0 ? (
                            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                                Belum ada produk baru yang perlu dikurasi.
                            </p>
                        ) : (
                            <ul>
                                {pendingProducts.map((p) => (
                                    <li key={p.id}>
                                        <Link
                                            href={`/admin/produk/${p.id}`}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent/60"
                                        >
                                            <span className="size-10 shrink-0 overflow-hidden rounded-lg">
                                                <ProductImage
                                                    src={p.image_url}
                                                    name={p.name}
                                                    categorySlug={p.category_slug}
                                                    icon={p.category_icon}
                                                    label={false}
                                                />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-semibold text-navy">{p.name}</span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {p.umkm} · {p.category} · {formatRupiah(p.price)}
                                                </span>
                                            </span>
                                            <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </QueueCard>
                </div>

                <section>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="font-heading text-base font-bold text-navy">Pesanan terbaru</h2>
                        <Link href="/admin/pesanan" className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline">
                            Semua pesanan
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    {latestOrders.length === 0 ? (
                        <EmptyState icon={ClipboardList} title="Belum ada pesanan" description="Pesanan dari pembeli akan muncul di sini." />
                    ) : (
                        <ResponsiveTable
                            rows={latestOrders}
                            rowKey={(o) => o.number}
                            columns={[
                                {
                                    key: 'number',
                                    header: 'Pesanan',
                                    primary: true,
                                    cell: (o) => (
                                        <Link href={`/admin/pesanan/${o.number}`} className="font-semibold text-navy hover:text-teal">
                                            {o.number}
                                            <span className="block text-xs font-normal text-muted-foreground">
                                                {formatDate(o.created_at)}
                                            </span>
                                        </Link>
                                    ),
                                },
                                { key: 'buyer', header: 'Pembeli', cell: (o) => o.buyer ?? '-' },
                                { key: 'umkm', header: 'UMKM', cell: (o) => o.umkm ?? '-' },
                                { key: 'status', header: 'Status', cell: (o) => <OrderStatusBadge status={o.status} /> },
                                {
                                    key: 'total',
                                    header: 'Total',
                                    align: 'right',
                                    cell: (o) => <span className="font-semibold text-navy">{formatRupiah(o.total)}</span>,
                                },
                            ]}
                        />
                    )}
                </section>
            </div>
        </>
    );
}
