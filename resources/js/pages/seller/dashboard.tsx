import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    ClipboardList,
    Clock,
    GraduationCap,
    Package,
    PackagePlus,
    Wallet,
} from 'lucide-react';
import ProductImage from '@/components/brand/product-visual';
import { BarChart } from '@/components/dashboard/mini-chart';
import PageHeader from '@/components/dashboard/page-header';
import StatCard from '@/components/dashboard/stat-card';
import { DemoBadge, OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatCompactRupiah, formatRupiah, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SellerDashboardData } from '@/types/seller';

function Panel({
    title,
    action,
    children,
    className,
}: {
    title: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('rounded-2xl border border-border/80 bg-card p-5 shadow-soft', className)}>
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-heading text-base font-bold text-navy">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

function StatusNotice({ umkm }: { umkm: SellerDashboardData['umkm'] }) {
    if (umkm.status === 'approved') {
        return null;
    }

    const content = {
        pending: {
            icon: Clock,
            tone: 'border-gold/30 bg-gold-100/70',
            iconTone: 'text-gold-700',
            title: 'UMKM Anda sedang diverifikasi admin',
            text: 'Anda sudah bisa menambahkan produk dan melengkapi profil. Produk baru tampil di katalog setelah UMKM terverifikasi dan produk disetujui.',
            cta: { href: '/seller/profil', label: 'Lengkapi profil' },
        },
        rejected: {
            icon: AlertTriangle,
            tone: 'border-brick/25 bg-brick-100/70',
            iconTone: 'text-brick',
            title: 'Pendaftaran UMKM ditolak',
            text: umkm.rejection_reason
                ? `Catatan admin: ${umkm.rejection_reason} Perbaiki profil untuk mengajukan verifikasi ulang.`
                : 'Perbaiki profil UMKM Anda untuk mengajukan verifikasi ulang.',
            cta: { href: '/seller/profil', label: 'Perbaiki profil' },
        },
        suspended: {
            icon: AlertTriangle,
            tone: 'border-border bg-cream-200',
            iconTone: 'text-navy',
            title: 'UMKM sedang dinonaktifkan',
            text: 'Produk Anda tidak tampil di katalog. Pesanan yang sudah masuk tetap dapat diproses. Hubungi admin Pasar Banua untuk informasi lebih lanjut.',
            cta: { href: '/seller/pesanan', label: 'Lihat pesanan' },
        },
    }[umkm.status];

    return (
        <div className={cn('mb-6 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center', content.tone)}>
            <content.icon className={cn('size-6 shrink-0', content.iconTone)} strokeWidth={1.75} />
            <div className="flex-1">
                <p className="font-heading font-bold text-navy">{content.title}</p>
                <p className="mt-1 text-sm text-pretty text-navy/80">{content.text}</p>
            </div>
            <Button asChild variant="navy" className="shrink-0">
                <Link href={content.cta.href}>{content.cta.label}</Link>
            </Button>
        </div>
    );
}

export default function SellerDashboard({
    umkm,
    stats,
    orderStatus,
    trend,
    latestOrders,
    lowStock,
    topProducts,
    training,
}: SellerDashboardData) {
    const { app, auth } = usePage().props;
    const showDemo = app.demo && umkm.is_demo;
    const trendTotal = trend.reduce((sum, t) => sum + t.value, 0);
    const trainingPercent = training.total ? Math.round((training.completed / training.total) * 100) : 0;
    const firstName = auth.user?.name.split(' ')[0];

    return (
        <>
            <Head title="Ringkasan" />
            <PageHeader
                eyebrow={umkm.name}
                title={firstName ? `Halo, ${firstName}` : 'Ringkasan'}
                description="Pantau penjualan, pesanan yang perlu diproses, dan stok produk Anda hari ini."
                actions={
                    <>
                        {showDemo && <DemoBadge />}
                        <Button asChild>
                            <Link href="/seller/produk/tambah">
                                <PackagePlus />
                                Tambah produk
                            </Link>
                        </Button>
                    </>
                }
            />

            <StatusNotice umkm={umkm} />

            {stats.awaiting_confirmation > 0 && (
                <Link
                    href="/seller/pesanan?status=pending"
                    className="mb-6 flex items-center gap-3 rounded-2xl bg-navy px-5 py-4 text-cream shadow-soft transition-colors hover:bg-navy-800"
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold font-heading font-extrabold text-navy">
                        {stats.awaiting_confirmation}
                    </span>
                    <span className="flex-1 text-sm">
                        <span className="font-semibold">Pesanan baru menunggu konfirmasi.</span>{' '}
                        <span className="text-cream/75">Konfirmasi cepat membuat pembeli lebih percaya.</span>
                    </span>
                    <ArrowRight className="size-5 shrink-0 text-gold" />
                </Link>
            )}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                <StatCard
                    label="Produk aktif"
                    value={stats.active_products}
                    hint={
                        stats.pending_products > 0
                            ? `${stats.pending_products} menunggu kurasi`
                            : `${stats.total_products} produk terdaftar`
                    }
                    icon={Package}
                    tone="teal"
                />
                <StatCard
                    label="Total pesanan"
                    value={stats.total_orders}
                    hint={`${stats.completed_orders} selesai`}
                    icon={ClipboardList}
                    tone="navy"
                />
                <StatCard
                    label="Perlu diproses"
                    value={stats.to_process}
                    hint="Menunggu konfirmasi + diproses"
                    icon={Clock}
                    tone="gold"
                />
                <StatCard
                    label="Pendapatan selesai"
                    value={<span className="text-[1.35rem] sm:text-[1.6rem]">{formatRupiah(stats.revenue_completed)}</span>}
                    hint={`${formatRupiah(stats.revenue_in_progress)} masih berjalan`}
                    icon={Wallet}
                    tone="brick"
                />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Panel
                    className="lg:col-span-2"
                    title={
                        <span className="flex items-center gap-2">
                            Penjualan 12 minggu terakhir
                            {showDemo && <DemoBadge className="px-1.5 py-0 text-[0.6rem]" />}
                        </span>
                    }
                    action={<span className="text-sm font-semibold text-navy">{formatRupiah(trendTotal)}</span>}
                >
                    {trendTotal > 0 ? (
                        <BarChart data={trend} format={formatCompactRupiah} height={200} labelEvery={2} />
                    ) : (
                        <p className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-input text-center text-sm text-muted-foreground">
                            Belum ada penjualan dalam 12 minggu terakhir.
                        </p>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                        Subtotal produk dari pesanan yang tidak dibatalkan, dikelompokkan per minggu (Senin).
                    </p>
                </Panel>

                <Panel title="Status pesanan">
                    <ul className="grid gap-2.5">
                        {orderStatus.map((s) => (
                            <li key={s.value}>
                                <Link
                                    href={`/seller/pesanan?status=${s.value}`}
                                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-accent"
                                >
                                    <OrderStatusBadge status={s.value} />
                                    <span className="font-heading font-bold text-navy">{s.count}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Panel
                    className="lg:col-span-2"
                    title="Pesanan terbaru"
                    action={
                        <Link href="/seller/pesanan" className="text-sm font-semibold text-teal hover:underline">
                            Lihat semua
                        </Link>
                    }
                >
                    {latestOrders.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">Belum ada pesanan masuk.</p>
                    ) : (
                        <ul className="divide-y divide-border/70">
                            {latestOrders.map((o) => (
                                <li key={o.id}>
                                    <Link
                                        href={`/seller/pesanan/${o.number}`}
                                        className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-accent/60"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-navy">{o.number}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {o.recipient_name} · {timeAgo(o.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <span className="text-sm font-semibold text-navy">{formatRupiah(o.total)}</span>
                                            <OrderStatusBadge status={o.status} />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <div className="grid content-start gap-6">
                    <Panel
                        title="Stok menipis"
                        action={
                            <Link href="/seller/stok?filter=menipis" className="text-sm font-semibold text-teal hover:underline">
                                Kelola
                            </Link>
                        }
                    >
                        {lowStock.length === 0 ? (
                            <p className="flex items-center gap-2 text-sm text-teal-700">
                                <BadgeCheck className="size-4" />
                                Semua stok produk aktif aman.
                            </p>
                        ) : (
                            <ul className="grid gap-3">
                                {lowStock.map((p) => (
                                    <li key={p.id} className="flex items-center gap-3">
                                        <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                                            <ProductImage src={p.image_url} name={p.name} label={false} />
                                        </div>
                                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{p.name}</p>
                                        <span className={cn('text-sm font-bold', p.stock === 0 ? 'text-brick' : 'text-gold-700')}>
                                            {p.stock === 0 ? 'Habis' : `Sisa ${p.stock}`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>

                    <Panel title="Pelatihan UMKM">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal">
                                <GraduationCap className="size-5" strokeWidth={1.75} />
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-navy">
                                    {training.completed} dari {training.total} materi selesai
                                </p>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-200">
                                    <div className="h-full rounded-full bg-teal" style={{ width: `${trainingPercent}%` }} />
                                </div>
                            </div>
                        </div>
                        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                            <Link href="/seller/pelatihan">
                                {training.completed < training.total ? 'Lanjutkan belajar' : 'Buka materi'}
                            </Link>
                        </Button>
                    </Panel>
                </div>
            </div>

            {topProducts.length > 0 && (
                <Panel title="Produk terlaris" className="mt-6">
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {topProducts.map((p, i) => (
                            <li key={p.id}>
                                <Link href={`/seller/produk/${p.slug}/ubah`} className="group flex items-center gap-3 lg:flex-col lg:items-stretch">
                                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream-200 lg:aspect-square lg:size-auto">
                                        <ProductImage src={p.image_url} name={p.name} label={false} />
                                        <span className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-navy text-[0.7rem] font-bold text-cream">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="line-clamp-2 text-sm font-semibold text-navy group-hover:text-teal">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {p.sold_count} terjual · {formatRupiah(p.price)}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            )}
        </>
    );
}
