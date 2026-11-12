import { DemoBadge } from '@/components/shared/status-badge';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { KpiData } from '@/types/admin';

function Meter({ ratio, reached }: { ratio: number; reached: boolean }) {
    const pct = Math.max(0, Math.min(1, ratio)) * 100;

    return (
        <div
            className="relative h-2 w-full overflow-hidden rounded-full bg-cream-300/70"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
        >
            <div
                className={cn('h-full rounded-full transition-[width]', reached ? 'bg-teal' : 'bg-gold')}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function Row({
    title,
    target,
    actual,
    note,
    ratio,
    reached,
}: {
    title: string;
    target: string;
    actual: string;
    note: string;
    ratio: number;
    reached: boolean;
}) {
    return (
        <li className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center sm:gap-8">
            <div className="min-w-0">
                <p className="font-heading text-[0.95rem] font-bold text-navy">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Target: <span className="font-semibold text-navy">{target}</span>
                </p>
            </div>
            <div className="grid gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="font-heading text-lg font-extrabold text-navy">{actual}</span>
                    <span
                        className={cn(
                            'text-[0.7rem] font-bold tracking-wide uppercase',
                            reached ? 'text-teal' : 'text-gold-700',
                        )}
                    >
                        {reached ? 'Tercapai' : 'Belum tercapai'}
                    </span>
                </div>
                <Meter ratio={ratio} reached={reached} />
                <p className="text-xs text-muted-foreground">{note}</p>
            </div>
        </li>
    );
}

/**
 * Target proyek (dokumen charter) dibandingkan dengan capaian dari database.
 * Target dan capaian dipisah jelas; capaian ditandai DEMO bila datanya simulasi.
 */
export default function KpiTargets({ kpis, demo }: { kpis: KpiData; demo: boolean }) {
    const g = kpis.transaction_growth;
    const s = kpis.satisfaction;
    const u = kpis.active_umkm;
    const t = kpis.training;

    return (
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="eyebrow text-teal">Target proyek</p>
                    <h2 className="mt-1 font-heading text-lg font-extrabold text-navy">
                        Capaian terhadap target Pasar Banua
                    </h2>
                    <p className="mt-1 max-w-xl text-sm text-pretty text-muted-foreground">
                        Angka target berasal dari Project Charter. Kolom capaian dihitung langsung dari data
                        aplikasi saat ini.
                    </p>
                </div>
                {demo && (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DemoBadge /> Capaian memakai data simulasi
                    </span>
                )}
            </div>
            <ul className="divide-y divide-border/70">
                <Row
                    title="UMKM aktif terverifikasi"
                    target={`${u.target} UMKM`}
                    actual={`${formatNumber(u.actual)} UMKM`}
                    note={`${Math.max(0, u.target - u.actual)} UMKM lagi untuk mencapai target.`}
                    ratio={u.actual / u.target}
                    reached={u.actual >= u.target}
                />
                <Row
                    title="Peningkatan transaksi online"
                    target={`+${g.target}% dalam ${g.months} bulan`}
                    actual={g.actual === null ? 'Belum terukur' : `${g.actual > 0 ? '+' : ''}${g.actual.toString().replace('.', ',')}%`}
                    note={
                        g.actual === null
                            ? `Belum ada transaksi pada ${g.months} bulan pembanding sebelumnya.`
                            : `${formatNumber(g.current)} transaksi dalam ${g.months} bulan terakhir, dibanding ${formatNumber(g.previous)} pada periode sebelumnya.`
                    }
                    ratio={g.actual === null ? 0 : g.actual / g.target}
                    reached={g.actual !== null && g.actual >= g.target}
                />
                <Row
                    title="Kepuasan pengguna"
                    target={`minimal ${s.target.toString().replace('.', ',')} / 5`}
                    actual={s.actual === null ? 'Belum ada ulasan' : `${s.actual.toFixed(2).replace('.', ',')} / 5`}
                    note={`Rata-rata dari ${formatNumber(s.reviews)} ulasan produk.`}
                    ratio={s.actual === null ? 0 : s.actual / 5}
                    reached={s.actual !== null && s.actual >= s.target}
                />
                <Row
                    title="Penyelesaian pelatihan UMKM"
                    target={`${t.target}% materi selesai`}
                    actual={t.actual === null ? 'Belum terukur' : `${t.actual.toString().replace('.', ',')}%`}
                    note="Persentase materi terbit yang telah ditandai selesai oleh pelaku UMKM."
                    ratio={t.actual === null ? 0 : t.actual / t.target}
                    reached={t.actual !== null && t.actual >= t.target}
                />
            </ul>
        </section>
    );
}
