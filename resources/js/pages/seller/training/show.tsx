import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import SimpleMarkdown from '@/components/seller/simple-markdown';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatDateTime } from '@/lib/format';
import type { TrainingDetail } from '@/types/seller';

type MaterialLink = { title: string; slug: string } | null;

export default function TrainingShow({
    material,
    position,
    previous,
    next,
}: {
    material: TrainingDetail;
    position: { index: number; total: number };
    previous: MaterialLink;
    next: MaterialLink;
}) {
    const form = useForm({});

    return (
        <>
            <Head title={material.title} />
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
                <Link href="/seller/pelatihan">
                    <ArrowLeft />
                    Semua materi
                </Link>
            </Button>

            <article className="mx-auto max-w-3xl">
                <header className="mb-6">
                    <p className="eyebrow text-teal">
                        Materi {position.index} dari {position.total}
                    </p>
                    <h1 className="mt-2 font-heading text-2xl font-extrabold text-balance text-navy sm:text-[2rem] sm:leading-tight">
                        {material.title}
                    </h1>
                    {material.summary && <p className="mt-2 text-pretty text-muted-foreground">{material.summary}</p>}
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        Sekitar {material.duration_minutes} menit membaca
                    </p>
                </header>

                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-8">
                    <SimpleMarkdown source={material.content} />
                </div>

                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                    {material.completed_at ? (
                        <p className="flex items-center gap-2 text-sm font-semibold text-teal">
                            <CheckCircle2 className="size-5" />
                            Selesai dipelajari {formatDateTime(material.completed_at)}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">Sudah membaca sampai akhir? Tandai materi ini selesai.</p>
                    )}
                    {!material.completed_at && (
                        <Button
                            onClick={() => form.post(`/seller/pelatihan/${material.slug}/selesai`, { preserveScroll: true })}
                            disabled={form.processing}
                        >
                            {form.processing ? <Spinner /> : <CheckCircle2 />}
                            Tandai selesai
                        </Button>
                    )}
                </div>

                <nav aria-label="Navigasi materi" className="mt-6 grid gap-3 sm:grid-cols-2">
                    {previous ? (
                        <Link href={`/seller/pelatihan/${previous.slug}`} className="group rounded-2xl border border-border/80 p-4 hover:bg-card">
                            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                                <ArrowLeft className="size-3.5" />
                                Sebelumnya
                            </span>
                            <span className="mt-1 block font-semibold text-navy group-hover:text-teal">{previous.title}</span>
                        </Link>
                    ) : (
                        <span />
                    )}
                    {next && (
                        <Link href={`/seller/pelatihan/${next.slug}`} className="group rounded-2xl border border-border/80 p-4 text-right hover:bg-card">
                            <span className="flex items-center justify-end gap-1 text-xs font-semibold text-muted-foreground">
                                Berikutnya
                                <ArrowRight className="size-3.5" />
                            </span>
                            <span className="mt-1 block font-semibold text-navy group-hover:text-teal">{next.title}</span>
                        </Link>
                    )}
                </nav>
            </article>
        </>
    );
}
