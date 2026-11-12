import { Head, Link } from '@inertiajs/react';
import { Clock, GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmPostButton, quickPost } from '@/components/admin/actions';
import PageHeader from '@/components/dashboard/page-header';
import StatCard from '@/components/dashboard/stat-card';
import EmptyState from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/lib/format';
import type { TrainingMaterialRow } from '@/types/admin';

export default function AdminTrainingIndex({
    materials,
    sellers,
}: {
    materials: TrainingMaterialRow[];
    sellers: number;
    topics: Record<string, string>;
}) {
    const published = materials.filter((m) => m.is_published);
    const avgRate = published.length
        ? Math.round(published.reduce((sum, m) => sum + (m.completion_rate ?? 0), 0) / published.length)
        : 0;
    const totalMinutes = published.reduce((sum, m) => sum + m.duration_minutes, 0);

    return (
        <>
            <Head title="Pelatihan UMKM" />
            <PageHeader
                eyebrow="Pendampingan"
                title="Pelatihan UMKM"
                description="Materi panduan yang tampil di dashboard penjual. Pantau berapa banyak pelaku UMKM yang sudah menyelesaikan setiap materi."
                actions={
                    <Button asChild>
                        <Link href="/admin/pelatihan/baru">
                            <Plus />
                            Materi baru
                        </Link>
                    </Button>
                }
            />

            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <StatCard label="Materi terbit" value={published.length} hint={`${materials.length - published.length} draf`} icon={GraduationCap} />
                <StatCard label="Rata-rata penyelesaian" value={`${avgRate}%`} hint={`Dari ${sellers} pelaku UMKM`} tone="gold" />
                <StatCard label="Total durasi" value={`${totalMinutes} mnt`} hint="Seluruh materi terbit" tone="navy" className="col-span-2 lg:col-span-1" />
            </div>

            {materials.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    title="Belum ada materi"
                    description="Buat materi pertama, misalnya cara memotret produk atau menulis deskripsi yang menarik."
                    action={
                        <Button asChild>
                            <Link href="/admin/pelatihan/baru">Buat materi</Link>
                        </Button>
                    }
                />
            ) : (
                <ol className="grid gap-3">
                    {materials.map((m, i) => (
                        <li key={m.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-cream-200 font-heading text-sm font-extrabold text-navy sm:flex">
                                    {i + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="teal">{m.topic_label}</Badge>
                                        {!m.is_published && <Badge variant="neutral">Draf</Badge>}
                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="size-3.5" />
                                            {m.duration_minutes} menit
                                        </span>
                                    </div>
                                    <p className="mt-1.5 font-heading font-bold text-navy">{m.title}</p>
                                    {m.summary && <p className="mt-0.5 line-clamp-2 text-sm text-pretty text-muted-foreground">{m.summary}</p>}
                                    <div className="mt-3 flex items-center gap-3">
                                        <div
                                            className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-cream-300/70"
                                            role="progressbar"
                                            aria-label="Penyelesaian"
                                            aria-valuenow={m.completion_rate ?? 0}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div className="h-full rounded-full bg-teal" style={{ width: `${m.completion_rate ?? 0}%` }} />
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {m.completed_count}/{sellers} selesai
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-3 sm:border-0 sm:pt-0">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-navy">
                                        <Switch
                                            checked={m.is_published}
                                            onCheckedChange={() => quickPost(`/admin/pelatihan/${m.id}/terbit`)}
                                            aria-label={m.is_published ? 'Jadikan draf' : 'Terbitkan'}
                                        />
                                        <span className="sm:hidden">{m.is_published ? 'Terbit' : 'Draf'}</span>
                                    </label>
                                    <div className="flex gap-1">
                                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Ubah ${m.title}`}>
                                            <Link href={`/admin/pelatihan/${m.id}/ubah`}>
                                                <Pencil className="size-4" />
                                            </Link>
                                        </Button>
                                        <ConfirmPostButton
                                            url={`/admin/pelatihan/${m.id}`}
                                            method="delete"
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-brick"
                                            destructive
                                            title={`Hapus materi "${m.title}"?`}
                                            description="Materi dan catatan progres penjual untuk materi ini akan dihapus permanen."
                                            confirmLabel="Hapus"
                                        >
                                            <Trash2 className="size-4" />
                                            <span className="sr-only">Hapus</span>
                                        </ConfirmPostButton>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-right text-[0.7rem] text-muted-foreground">Diperbarui {formatDate(m.updated_at)}</p>
                        </li>
                    ))}
                </ol>
            )}
        </>
    );
}
