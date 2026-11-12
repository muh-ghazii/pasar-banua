import { Link, useForm } from '@inertiajs/react';
import { AlertTriangle, BookOpenText, Info, Save } from 'lucide-react';
import ImageUploader from '@/components/dashboard/image-uploader';
import FormField from '@/components/shared/form-field';
import { ProductStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
    ProductFormLimits,
    SellerCategoryOption,
    SellerProductDetail,
} from '@/types/seller';

type FormData = {
    name: string;
    category_id: string;
    summary: string;
    description: string;
    price: string;
    stock: string;
    weight_gram: string;
    is_active: boolean;
    images: File[];
    removed_images: number[];
    story_title: string;
    story_body: string;
};

function Section({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6', className)}>
            <h2 className="font-heading text-base font-bold text-navy">{title}</h2>
            {description && <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>}
            <div className="mt-5 grid gap-5">{children}</div>
        </section>
    );
}

/**
 * Form tambah/ubah produk UMKM. Harga, stok, dan validasi akhir tetap
 * diperiksa di backend (ProductRequest).
 */
export default function ProductForm({
    product,
    categories,
    limits,
}: {
    product: SellerProductDetail | null;
    categories: SellerCategoryOption[];
    limits: ProductFormLimits;
}) {
    const isEdit = product !== null;

    const form = useForm<FormData>({
        name: product?.name ?? '',
        category_id: product ? String(product.category_id) : '',
        summary: product?.summary ?? '',
        description: product?.description ?? '',
        price: product ? String(product.price) : '',
        stock: product ? String(product.stock) : '',
        weight_gram: product?.weight_gram ? String(product.weight_gram) : '',
        is_active: product?.is_active ?? true,
        images: [],
        removed_images: [],
        story_title: product?.story_title ?? '',
        story_body: product?.story_body ?? '',
    });

    const { data, setData, errors, processing } = form;
    const errorBag = errors as Record<string, string | undefined>;
    const imageError =
        errorBag.images ??
        Object.entries(errorBag).find(([key]) => key.startsWith('images.'))?.[1];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            form.transform((d) => ({ ...d, _method: 'put' }));
            form.post(`/seller/produk/${product.slug}`, { forceFormData: true, preserveScroll: true });
        } else {
            form.post('/seller/produk', { forceFormData: true, preserveScroll: true });
        }
    };

    const price = parseInt(data.price, 10);
    const willRequeue = isEdit && product.status !== 'pending';

    return (
        <form onSubmit={submit} className="pb-24 lg:pb-0" noValidate>
            {isEdit && product.status === 'rejected' && product.rejection_reason && (
                <div role="alert" className="mb-6 flex gap-3 rounded-2xl border border-brick/25 bg-brick-100/60 p-4 text-sm">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-brick" strokeWidth={1.75} />
                    <div>
                        <p className="font-semibold text-brick">Produk ditolak oleh admin</p>
                        <p className="mt-0.5 text-navy/80">{product.rejection_reason}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Perbaiki sesuai catatan di atas lalu simpan. Produk akan masuk antrean kurasi kembali.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                <div className="grid gap-6">
                    <Section title="Informasi produk" description="Nama dan deskripsi yang jujur membantu pembeli dan mempercepat kurasi.">
                        <FormField label="Nama produk" htmlFor="name" error={errors.name} required>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Amplang Ikan Tenggiri 250 g"
                                maxLength={120}
                                aria-invalid={!!errors.name}
                            />
                        </FormField>
                        <FormField label="Kategori" htmlFor="category_id" error={errors.category_id} required>
                            <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                                <SelectTrigger id="category_id" className="w-full" aria-invalid={!!errors.category_id}>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField
                            label="Ringkasan singkat"
                            htmlFor="summary"
                            error={errors.summary}
                            hint={`Tampil di kartu produk. ${data.summary.length}/200 karakter.`}
                        >
                            <Input
                                id="summary"
                                value={data.summary}
                                onChange={(e) => setData('summary', e.target.value)}
                                placeholder="Satu kalimat yang menggambarkan produk"
                                maxLength={200}
                            />
                        </FormField>
                        <FormField
                            label="Deskripsi lengkap"
                            htmlFor="description"
                            error={errors.description}
                            hint="Sebutkan bahan, ukuran/isi, cara penyimpanan, dan masa simpan bila ada."
                            required
                        >
                            <Textarea
                                id="description"
                                rows={7}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                aria-invalid={!!errors.description}
                            />
                        </FormField>
                    </Section>

                    <Section
                        title="Foto produk"
                        description="Foto pertama menjadi foto utama. Gunakan foto asli produk Anda dengan cahaya alami."
                    >
                        <ImageUploader
                            files={data.images}
                            onFilesChange={(files) => setData('images', files)}
                            existing={product?.images ?? []}
                            removedIds={data.removed_images}
                            onRemovedChange={(ids) => setData('removed_images', ids)}
                            max={limits.max_images}
                            maxSizeMb={limits.max_image_mb}
                            error={imageError}
                        />
                    </Section>

                    <Section
                        title="Cerita produk"
                        description="Opsional. Ceritakan asal-usul, proses pembuatan, atau orang di balik produk ini."
                    >
                        <div className="flex gap-3 rounded-xl bg-gold-100/60 p-3.5 text-[0.8125rem] text-navy/85">
                            <Info className="mt-0.5 size-4 shrink-0 text-gold-700" />
                            <p className="text-pretty">
                                Tulis hanya hal yang Anda ketahui sendiri. Cerita dari UMKM ditampilkan dengan label
                                <span className="font-semibold"> konten belum diverifikasi</span> sampai ditinjau tim Pasar Banua.
                            </p>
                        </div>
                        <FormField label="Judul cerita" htmlFor="story_title" error={errors.story_title}>
                            <Input
                                id="story_title"
                                value={data.story_title}
                                onChange={(e) => setData('story_title', e.target.value)}
                                placeholder="Contoh: Resep keluarga sejak tiga generasi"
                                maxLength={160}
                            />
                        </FormField>
                        <FormField label="Isi cerita" htmlFor="story_body" error={errors.story_body}>
                            <Textarea
                                id="story_body"
                                rows={5}
                                value={data.story_body}
                                onChange={(e) => setData('story_body', e.target.value)}
                            />
                        </FormField>
                        {isEdit && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <BookOpenText className="size-3.5" />
                                Catatan proses, bahan, dan budaya dapat dilengkapi di menu{' '}
                                <Link href={`/seller/cerita/${product.slug}`} className="font-semibold text-teal hover:underline">
                                    Cerita Produk
                                </Link>
                                .
                            </p>
                        )}
                    </Section>
                </div>

                <div className="grid gap-6 lg:sticky lg:top-24">
                    <Section title="Harga dan stok">
                        <FormField
                            label="Harga"
                            htmlFor="price"
                            error={errors.price}
                            hint={Number.isFinite(price) && price > 0 ? `Tampil sebagai ${formatRupiah(price)}` : 'Dalam Rupiah, tanpa titik.'}
                            required
                        >
                            <div className="relative">
                                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                    Rp
                                </span>
                                <Input
                                    id="price"
                                    inputMode="numeric"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value.replace(/\D/g, ''))}
                                    className="pl-10"
                                    placeholder="25000"
                                    aria-invalid={!!errors.price}
                                />
                            </div>
                        </FormField>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Stok" htmlFor="stock" error={errors.stock} required>
                                <Input
                                    id="stock"
                                    inputMode="numeric"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', e.target.value.replace(/\D/g, ''))}
                                    placeholder="0"
                                    aria-invalid={!!errors.stock}
                                />
                            </FormField>
                            <FormField label="Berat (gram)" htmlFor="weight_gram" error={errors.weight_gram}>
                                <Input
                                    id="weight_gram"
                                    inputMode="numeric"
                                    value={data.weight_gram}
                                    onChange={(e) => setData('weight_gram', e.target.value.replace(/\D/g, ''))}
                                    placeholder="250"
                                />
                            </FormField>
                        </div>
                    </Section>

                    <Section title="Tampilan di katalog">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <label htmlFor="is_active" className="text-sm font-semibold text-navy">
                                    Tampilkan produk
                                </label>
                                <p className="mt-0.5 text-xs text-pretty text-muted-foreground">
                                    Nonaktifkan untuk menyembunyikan sementara tanpa menghapus.
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v)}
                            />
                        </div>
                        {isEdit && (
                            <div className="flex items-center justify-between border-t border-border/70 pt-4 text-sm">
                                <span className="text-muted-foreground">Status kurasi</span>
                                <ProductStatusBadge status={product.status} />
                            </div>
                        )}
                        <p className="rounded-xl bg-teal-50 px-3.5 py-3 text-xs text-pretty text-teal-700">
                            {isEdit
                                ? willRequeue
                                    ? 'Mengubah nama, ringkasan, deskripsi, harga, kategori, atau foto akan mengirim produk ke kurasi ulang. Perubahan stok dan berat langsung berlaku.'
                                    : 'Produk sedang menunggu kurasi admin.'
                                : 'Produk baru ditinjau admin sebelum tampil di katalog. Biasanya 1–2 hari kerja.'}
                        </p>
                    </Section>

                    <div className="hidden gap-2 lg:grid">
                        <Button type="submit" size="lg" disabled={processing}>
                            {processing ? <Spinner /> : <Save />}
                            {isEdit ? 'Simpan perubahan' : 'Simpan dan ajukan kurasi'}
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href="/seller/produk">Batal</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bar aksi mobile: selalu terjangkau jempol */}
            <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-xl gap-2">
                    <Button asChild variant="outline" className="h-11">
                        <Link href="/seller/produk">Batal</Link>
                    </Button>
                    <Button type="submit" className="h-11 flex-1" disabled={processing}>
                        {processing ? <Spinner /> : <Save />}
                        {isEdit ? 'Simpan perubahan' : 'Simpan produk'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
