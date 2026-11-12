import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { NativeSelect } from '@/components/admin/filters';
import PageHeader from '@/components/dashboard/page-header';
import FormField from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { TrainingMaterialRow } from '@/types/admin';

export default function AdminTrainingForm({
    material,
    topics,
    nextOrder,
}: {
    material: TrainingMaterialRow | null;
    topics: Record<string, string>;
    nextOrder: number;
}) {
    const form = useForm({
        title: material?.title ?? '',
        topic: material?.topic ?? Object.keys(topics)[0] ?? 'onboarding',
        summary: material?.summary ?? '',
        content: material?.content ?? '',
        duration_minutes: material?.duration_minutes ?? 5,
        sort_order: material?.sort_order ?? nextOrder,
        is_published: material?.is_published ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (material) {
            form.put(`/admin/pelatihan/${material.id}`);
        } else {
            form.post('/admin/pelatihan');
        }
    };

    return (
        <>
            <Head title={material ? 'Ubah materi' : 'Materi baru'} />
            <Link href="/admin/pelatihan" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
                <ArrowLeft className="size-4" />
                Pelatihan UMKM
            </Link>
            <PageHeader
                title={material ? 'Ubah materi pelatihan' : 'Materi pelatihan baru'}
                description="Tulis dengan bahasa sederhana dan langkah yang bisa langsung dipraktikkan oleh pelaku UMKM."
            />

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <section className="grid content-start gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
                    <FormField label="Judul" htmlFor="title" error={form.errors.title} required>
                        <Input
                            id="title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            maxLength={160}
                            required
                            aria-invalid={!!form.errors.title}
                        />
                    </FormField>
                    <FormField label="Ringkasan" htmlFor="summary" error={form.errors.summary} hint="Tampil di daftar materi, maksimal 240 karakter.">
                        <Textarea
                            id="summary"
                            value={form.data.summary}
                            onChange={(e) => form.setData('summary', e.target.value)}
                            maxLength={240}
                            rows={2}
                        />
                    </FormField>
                    <FormField
                        label="Isi materi"
                        htmlFor="content"
                        error={form.errors.content}
                        required
                        hint="Pisahkan paragraf dengan baris kosong. Awali baris dengan '- ' untuk membuat daftar poin."
                    >
                        <Textarea
                            id="content"
                            value={form.data.content}
                            onChange={(e) => form.setData('content', e.target.value)}
                            rows={16}
                            className="font-mono text-[0.85rem] leading-relaxed"
                            aria-invalid={!!form.errors.content}
                        />
                    </FormField>
                </section>

                <aside className="grid content-start gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
                    <FormField label="Topik" htmlFor="topic" error={form.errors.topic} required>
                        <NativeSelect id="topic" value={form.data.topic} onChange={(e) => form.setData('topic', e.target.value)} className="sm:w-full">
                            {Object.entries(topics).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Durasi (menit)" htmlFor="duration" error={form.errors.duration_minutes} required>
                            <Input
                                id="duration"
                                type="number"
                                min={1}
                                max={240}
                                value={form.data.duration_minutes}
                                onChange={(e) => form.setData('duration_minutes', Number(e.target.value))}
                            />
                        </FormField>
                        <FormField label="Urutan" htmlFor="order" error={form.errors.sort_order}>
                            <Input
                                id="order"
                                type="number"
                                min={0}
                                max={999}
                                value={form.data.sort_order}
                                onChange={(e) => form.setData('sort_order', Number(e.target.value))}
                            />
                        </FormField>
                    </div>
                    <label className="flex items-center justify-between gap-3 rounded-xl bg-cream-200/60 px-4 py-3">
                        <span>
                            <span className="block text-sm font-semibold text-navy">Terbitkan</span>
                            <span className="block text-xs text-muted-foreground">Draf tidak terlihat oleh penjual.</span>
                        </span>
                        <Switch checked={form.data.is_published} onCheckedChange={(v) => form.setData('is_published', v)} />
                    </label>
                    <div className="flex flex-col gap-2">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            {material ? 'Simpan perubahan' : 'Simpan materi'}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin/pelatihan">Batal</Link>
                        </Button>
                    </div>
                </aside>
            </form>
        </>
    );
}
