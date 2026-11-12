import { Head, Link, usePage } from '@inertiajs/react';
import { Banknote, ClipboardList, Package, Star, Store } from 'lucide-react';
import KpiTargets from '@/components/admin/kpi';
import { BarChart, LineChart } from '@/components/dashboard/mini-chart';
import PageHeader from '@/components/dashboard/page-header';
import StatCard from '@/components/dashboard/stat-card';
import { DemoBadge } from '@/components/shared/status-badge';
import { formatCompactRupiah, formatNumber, formatRupiah } from '@/lib/format';
import type { KpiData, MonthlyPoint, TotalsData } from '@/types/admin';
import type { OrderStatus } from '@/types/domain';

type CategoryStat = { name: string; slug: string; quantity: number; revenue: number };
type UmkmStat = { id: number; name: string; slug: string; city: string; orders: number; revenue: number };
type StatusStat = { status: OrderStatus; label: string; count: number };
type RatingStat = { rating: number; count: number };

const statusColor: Record<OrderStatus, string> = {
    pending: 'var(--color-gold)',
    processing: 'var(--color-teal)',
    shipped: 'var(--color-navy-700)',
    completed: '#7aa5a3',
    cancelled: 'var(--color-brick)',
};

function Panel({ title, description, demo, children, className }: { title: string; description?: string; demo?: boolean; children: React.ReactNode; className?: string }) {
    return (
        <section className={`rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6 ${className ?? ''}`}>
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="font-heading text-base font-bold text-navy">{title}</h2>
                    {description && <p className="text-sm text-pretty text-muted-foreground">{description}</p>}
                </div>
                {demo && <DemoBadge />}
            </div>
            {children}
        </section>
    );
}

export default function AdminAnalytics({
    totals,
    kpis,
    trend,
    categories,
    topUmkm,
    statuses,
    ratings,
}: {
    totals: TotalsData;
    kpis: KpiData;
    trend: MonthlyPoint[];
    categories: CategoryStat[];
    topUmkm: UmkmStat[];
    statuses: StatusStat[];
    ratings: RatingStat[];
}) {
    const { app } = usePage().props;
    const demo = app.demo || totals.has_demo;
    const maxCat = Math.max(1, ...categories.map((c) => c.quantity));
    const totalStatus = statuses.reduce((s, x) => s + x.count, 0);
    const totalRatings = ratings.reduce((s, x) => s + x.count, 0);

    return (
        <>
            <Head title="Laporan dan Analitik" />
            <PageHeader
                eyebrow="Laporan"
                title="Laporan dan Analitik"
                description="Gambaran performa marketplace dari data transaksi, katalog, dan ulasan."
            />

            {demo && (
                <div role="note" className="mb-6 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold-100/60 px-4 py-3 text-sm text-navy">
                    <DemoBadge className="mt-0.5" />
                    <p className="text-pretty">
                        Sebagian besar angka di halaman ini berasal dari data simulasi hasil seeder, bukan transaksi sungguhan.
                        Gunakan untuk demonstrasi alur, bukan sebagai laporan kinerja.
                    </p>
                </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
                <StatCard label="UMKM aktif" value={formatNumber(totals.umkm_active)} icon={Store} />
                <StatCard label="Produk" value={formatNumber(totals.products)} hint={`${totals.products_published} tayang`} icon={Package} tone="navy" />
                <StatCard label="Total transaksi" value={formatNumber(totals.orders)} hint="Di luar pesanan dibatalkan" icon={ClipboardList} tone="gold" />
                <StatCard label="Nilai transaksi" value={formatCompactRupiah(totals.gmv)} hint={formatRupiah(totals.gmv)} icon={Banknote} tone="brick" />
                <StatCard
                    label="Rating rata-rata"
                    value={totals.rating ? totals.rating.toFixed(2).replace('.', ',') : '-'}
                    hint={`${formatNumber(totals.reviews)} ulasan`}
                    icon={Star}
                    tone="gold"
                    className="col-span-2 xl:col-span-1"
                />
            </div>

            <div className="grid gap-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <Panel title="Tren nilai transaksi" description="12 bulan terakhir, di luar pesanan dibatalkan." demo={demo}>
                        <LineChart data={trend.map((t) => ({ label: t.label, value: t.revenue }))} format={formatRupiah} height={190} />
                    </Panel>
                    <Panel title="Jumlah pesanan per bulan" description="Pesanan yang dibuat setiap bulan." demo={demo}>
                        <BarChart
                            data={trend.map((t) => ({ label: t.label, value: t.orders }))}
                            format={(v) => `${formatNumber(v)} pesanan`}
                            height={190}
                            labelEvery={2}
                        />
                    </Panel>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Panel title="Kategori populer" description="Berdasarkan jumlah unit terjual." demo={demo}>
                        {categories.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada penjualan.</p>
                        ) : (
                            <ul className="grid gap-3.5">
                                {categories.map((c) => (
                                    <li key={c.slug}>
                                        <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                                            <span className="font-semibold text-navy">{c.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatNumber(c.quantity)} unit · {formatCompactRupiah(c.revenue)}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-cream-300/60">
                                            <div className="h-full rounded-full bg-teal" style={{ width: `${(c.quantity / maxCat) * 100}%` }} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>

                    <Panel title="UMKM dengan transaksi tertinggi" demo={demo}>
                        {topUmkm.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada transaksi.</p>
                        ) : (
                            <ol className="divide-y divide-border/70">
                                {topUmkm.map((u, i) => (
                                    <li key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream-200 font-heading text-sm font-extrabold text-navy">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/admin/umkm/${u.id}`} className="block truncate text-sm font-semibold text-navy hover:text-teal">
                                                {u.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {u.city} · {formatNumber(u.orders)} pesanan
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-navy">{formatCompactRupiah(u.revenue)}</span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Panel>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Panel title="Distribusi status pesanan" description={`${formatNumber(totalStatus)} pesanan tercatat.`} demo={demo}>
                        <div className="flex h-3 overflow-hidden rounded-full bg-cream-300/60" aria-hidden="true">
                            {statuses.map((s) =>
                                s.count > 0 ? (
                                    <div key={s.status} style={{ width: `${(s.count / Math.max(1, totalStatus)) * 100}%`, background: statusColor[s.status] }} />
                                ) : null,
                            )}
                        </div>
                        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
                            {statuses.map((s) => (
                                <li key={s.status} className="flex items-center gap-2 text-sm">
                                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: statusColor[s.status] }} />
                                    <span className="min-w-0 truncate text-navy">{s.label}</span>
                                    <span className="ml-auto font-semibold text-navy">{s.count}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>

                    <Panel title="Sebaran rating ulasan" description={`${formatNumber(totalRatings)} ulasan dari pembeli.`} demo={demo}>
                        <ul className="grid gap-2">
                            {ratings.map((r) => (
                                <li key={r.rating} className="flex items-center gap-3 text-sm">
                                    <span className="flex w-8 shrink-0 items-center gap-1 font-semibold text-navy">
                                        {r.rating}
                                        <Star className="size-3.5 fill-gold text-gold" />
                                    </span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-300/60">
                                        <div className="h-full rounded-full bg-gold" style={{ width: `${(r.count / Math.max(1, totalRatings)) * 100}%` }} />
                                    </div>
                                    <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{r.count}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </div>

                <KpiTargets kpis={kpis} demo={demo} />
            </div>
        </>
    );
}
