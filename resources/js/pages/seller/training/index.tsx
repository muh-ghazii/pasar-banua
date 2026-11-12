import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ChevronRight, Circle, Clock, GraduationCap } from 'lucide-react';
import PageHeader from '@/components/dashboard/page-header';
import EmptyState from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import type { TrainingItem } from '@/types/seller';

const topicLabel: Record<string, string> = {
    onboarding: 'Mulai',
    katalog: 'Katalog',
    pesanan: 'Pesanan',
    pemasaran: 'Pemasaran',
    keuangan: 'Keuangan',
};

export default function SellerTraining({
    materials,
    progress,
}: {
    materials: TrainingItem[];
    progress: { completed: number; total: number };
}) {
    const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
    const nextUp = materials.find((m) => !m.completed);

    return (
        <>
            <Head title="Panduan dan pelatihan" />
            <PageHeader
                eyebrow="Belajar"
                title="Panduan dan pelatihan"
                description="Materi singkat untuk mengelola katalog, foto, cerita, dan pesanan online. Baca berurutan dan tandai selesai."
            />

            <div className="mb-6 grid gap-5 rounded-2xl bg-navy p-5 text-cream shadow-soft sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                <div>
                    <p className="eyebrow text-gold">Kemajuan belajar</p>
                    <p className="mt-2 font-heading text-2xl font-extrabold">
                        {progress.completed} / {progress.total} materi selesai
                    </p>
                    <div
                        className="mt-4 h-2 overflow-hidden rounded-full bg-cream/15"
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Kemajuan pelatihan"
                    >
                        <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
                    </div>
                </div>
                {nextUp ? (
                    <Link
                        href={`/seller/pelatihan/${nextUp.slug}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-navy hover:bg-[#d5972f]"
                    >
                        {progress.completed === 0 ? 'Mulai belajar' : 'Lanjutkan'}
                        <ChevronRight className="size-4" />
                    </Link>
                ) : (
                    progress.total > 0 && (
                        <p className="flex items-center gap-2 text-sm font-semibold text-gold">
                            <CheckCircle2 className="size-5" />
                            Semua materi selesai
                        </p>
                    )
                )}
            </div>

            {materials.length === 0 ? (
                <EmptyState icon={GraduationCap} title="Materi belum tersedia" description="Admin sedang menyiapkan materi pelatihan. Silakan kembali lagi nanti." />
            ) : (
                <ol className="grid gap-3">
                    {materials.map((m, i) => (
                        <li key={m.id}>
                            <Link
                                href={`/seller/pelatihan/${m.slug}`}
                                className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-soft transition-colors hover:border-input sm:p-5"
                            >
                                <span
                                    className={cn(
                                        'flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold',
                                        m.completed ? 'bg-teal text-ivory' : 'bg-cream-200 text-navy',
                                    )}
                                >
                                    {m.completed ? <CheckCircle2 className="size-5" /> : i + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span className="font-semibold text-teal">{topicLabel[m.topic] ?? m.topic}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="size-3.5" />
                                            {m.duration_minutes} menit
                                        </span>
                                        {!m.completed && (
                                            <span className="inline-flex items-center gap-1">
                                                <Circle className="size-3" />
                                                Belum dibaca
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="mt-1 font-heading text-base font-bold text-navy group-hover:text-teal">{m.title}</h2>
                                    {m.summary && <p className="mt-0.5 line-clamp-2 text-sm text-pretty text-muted-foreground">{m.summary}</p>}
                                </div>
                                <ChevronRight className="size-5 shrink-0 text-muted-foreground group-hover:text-teal" />
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </>
    );
}
