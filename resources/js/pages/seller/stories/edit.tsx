import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import FormField from '@/components/shared/form-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { timeAgo } from '@/lib/format';
import type { CategoryLite, ProductStatus } from '@/types/domain';
import type { StoryDetail } from '@/types/seller';

type Props = {
    product: {
        id: number;
        name: string;
        slug: string;
        status: ProductStatus;
        image_url: string | null;
        category: CategoryLite | null;
    };
    story: StoryDetail | null;
};

export default function EditStory({ product, story }: Props) {
    const [confirm, setConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const form = useForm({
        title: story?.title ?? '',
        body: story?.body ?? '',
        process_note: story?.process_note ?? '',
        material_note: story?.material_note ?? '',
        cultural_note: story?.cultural_note ?? '',
    });
    const { data, setData, errors, processing } = form;

    return (
        <>
            <Head title={`Cerita ${product.name}`} />
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
                <Link href="/seller/cerita">
                    <ArrowLeft />
                    Cerita produk
                </Link>
            </Button>
            <PageHeader
                eyebrow={story ? 'Ubah cerita' : 'Tulis cerita'}
                title={product.name}
                description={story?.updated_at ? `Terakhir diperbarui ${timeAgo(story.updated_at)}` : 'Cerita membantu pembeli mengenal karya Anda lebih dekat.'}
                actions={story && <Badge variant={story.is_verified ? 'teal' : 'gold'}>{story.is_verified ? 'Terverifikasi' : 'Belum diverifikasi'}</Badge>}
            />

            <form
                className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.put(`/seller/cerita/${product.slug}`, { preserveScroll: true });
                }}
                noValidate
            >
                <section className="grid gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
                    <FormField label="Judul cerita" htmlFor="title" error={errors.title} required>
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} maxLength={160} placeholder="Contoh: Dari dapur kecil di tepi Sungai Martapura" aria-invalid={!!errors.title} />
                    </FormField>
                    <FormField label="Isi cerita" htmlFor="body" error={errors.body} hint={`Minimal 50 karakter. ${data.body.length}/5000`} required>
                        <Textarea id="body" rows={9} value={data.body} onChange={(e) => setData('body', e.target.value)} maxLength={5000} aria-invalid={!!errors.body} />
                    </FormField>
                    <FormField label="Proses pembuatan" htmlFor="process_note" error={errors.process_note} hint="Bagaimana produk dibuat, berapa lama, oleh siapa.">
                        <Textarea id="process_note" rows={3} value={data.process_note} onChange={(e) => setData('process_note', e.target.value)} maxLength={1500} />
                    </FormField>
                    <FormField label="Bahan" htmlFor="material_note" error={errors.material_note} hint="Bahan utama dan asalnya, bila diketahui.">
                        <Textarea id="material_note" rows={3} value={data.material_note} onChange={(e) => setData('material_note', e.target.value)} maxLength={1500} />
                    </FormField>
                    <FormField label="Nilai budaya" htmlFor="cultural_note" error={errors.cultural_note} hint="Opsional. Tuliskan hanya yang Anda ketahui dengan pasti.">
                        <Textarea id="cultural_note" rows={3} value={data.cultural_note} onChange={(e) => setData('cultural_note', e.target.value)} maxLength={1500} />
                    </FormField>
                    <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-5">
                        <Button type="submit" disabled={processing}>
                            {processing ? <Spinner /> : <Save />}
                            Simpan cerita
                        </Button>
                        {story && (
                            <Button type="button" variant="ghost" className="text-brick hover:bg-brick-100 hover:text-brick" onClick={() => setConfirm(true)}>
                                <Trash2 />
                                Hapus cerita
                            </Button>
                        )}
                    </div>
                </section>

                <aside className="grid gap-4 lg:sticky lg:top-24">
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
                        <div className="aspect-square bg-cream-200">
                            <ProductImage src={product.image_url} name={product.name} categorySlug={product.category?.slug} icon={product.category?.icon} />
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                            <p className="font-semibold text-navy">{product.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 rounded-2xl bg-gold-100/60 p-4 text-[0.8125rem] text-navy/85">
                        <Info className="mt-0.5 size-4 shrink-0 text-gold-700" />
                        <div className="grid gap-2 text-pretty">
                            <p>Setiap perubahan membuat cerita kembali berstatus <span className="font-semibold">belum diverifikasi</span>.</p>
                            <p>Tulis pengalaman nyata. Jangan mengarang sejarah, filosofi motif, atau klaim kesehatan.</p>
                        </div>
                    </div>
                </aside>
            </form>

            <ConfirmDialog
                open={confirm}
                onOpenChange={setConfirm}
                title="Hapus cerita produk?"
                description="Cerita akan dihapus dari halaman produk. Data produk lainnya tidak berubah."
                confirmLabel="Hapus cerita"
                destructive
                processing={deleting}
                onConfirm={() =>
                    router.delete(`/seller/cerita/${product.slug}`, {
                        onStart: () => setDeleting(true),
                        onFinish: () => {
                            setDeleting(false);
                            setConfirm(false);
                        },
                    })
                }
            />
        </>
    );
}
