import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmPostButton } from '@/components/admin/actions';
import { categoryIcon } from '@/components/brand/category-icon';
import PageHeader from '@/components/dashboard/page-header';
import EmptyState from '@/components/shared/empty-state';
import FormField from '@/components/shared/form-field';
import { ActiveBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { AdminCategory } from '@/types/admin';

const iconLabels: Record<string, string> = {
    utensils: 'Kuliner',
    hand: 'Kerajinan tangan',
    shirt: 'Kain & busana',
    house: 'Rumah tangga',
    package: 'Umum',
};

function CategoryDialog({
    category,
    icons,
    open,
    onOpenChange,
}: {
    category: AdminCategory | null;
    icons: string[];
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const form = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        icon: category?.icon ?? 'package',
        sort_order: category?.sort_order ?? 0,
        is_active: category?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };

        if (category) {
            form.put(`/admin/kategori/${category.id}`, options);
        } else {
            form.post('/admin/kategori', options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto">
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-lg font-bold text-navy">
                            {category ? 'Ubah kategori' : 'Kategori baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Kategori aktif tampil di navigasi, filter katalog, dan pilihan produk penjual.
                        </DialogDescription>
                    </DialogHeader>
                    <FormField label="Nama kategori" htmlFor="cat-name" error={form.errors.name} required>
                        <Input
                            id="cat-name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            maxLength={80}
                            required
                            aria-invalid={!!form.errors.name}
                        />
                    </FormField>
                    <FormField label="Deskripsi singkat" htmlFor="cat-desc" error={form.errors.description}>
                        <Textarea
                            id="cat-desc"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            maxLength={255}
                            rows={3}
                        />
                    </FormField>
                    <fieldset className="grid gap-1.5">
                        <legend className="mb-1.5 text-[0.8125rem] font-semibold text-navy">Ikon</legend>
                        <div className="grid grid-cols-5 gap-2">
                            {icons.map((name) => {
                                const Icon = categoryIcon(name);
                                const selected = form.data.icon === name;

                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        aria-pressed={selected}
                                        aria-label={iconLabels[name] ?? name}
                                        title={iconLabels[name] ?? name}
                                        onClick={() => form.setData('icon', name)}
                                        className={cn(
                                            'flex h-12 items-center justify-center rounded-lg border transition-colors',
                                            selected ? 'border-teal bg-teal-50 text-teal' : 'border-input bg-[#faf6f0] text-navy hover:bg-accent',
                                        )}
                                    >
                                        <Icon className="size-5" strokeWidth={1.75} />
                                    </button>
                                );
                            })}
                        </div>
                        {form.errors.icon && <p className="text-xs font-medium text-brick">{form.errors.icon}</p>}
                    </fieldset>
                    <div className="grid grid-cols-2 items-end gap-4">
                        <FormField label="Urutan tampil" htmlFor="cat-order" error={form.errors.sort_order}>
                            <Input
                                id="cat-order"
                                type="number"
                                min={0}
                                max={999}
                                value={form.data.sort_order}
                                onChange={(e) => form.setData('sort_order', Number(e.target.value))}
                            />
                        </FormField>
                        <label className="flex h-11 items-center gap-3 text-sm font-semibold text-navy">
                            <Switch checked={form.data.is_active} onCheckedChange={(v) => form.setData('is_active', v)} />
                            {form.data.is_active ? 'Aktif' : 'Nonaktif'}
                        </label>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            {category ? 'Simpan' : 'Tambah kategori'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminCategories({ categories, icons }: { categories: AdminCategory[]; icons: string[] }) {
    const [editing, setEditing] = useState<AdminCategory | null>(null);
    const [open, setOpen] = useState(false);

    const openDialog = (category: AdminCategory | null) => {
        setEditing(category);
        setOpen(true);
    };

    return (
        <>
            <Head title="Kategori" />
            <PageHeader
                eyebrow="Katalog"
                title="Kategori"
                description="Atur pengelompokan produk. Kategori yang masih dipakai produk tidak dapat dihapus, tetapi bisa dinonaktifkan."
                actions={
                    <Button onClick={() => openDialog(null)}>
                        <Plus />
                        Kategori baru
                    </Button>
                }
            />

            {categories.length === 0 ? (
                <EmptyState icon={Tags} title="Belum ada kategori" description="Tambahkan kategori pertama agar penjual dapat mengelompokkan produk." />
            ) : (
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {categories.map((c) => {
                        const Icon = categoryIcon(c.icon);

                        return (
                            <li key={c.id} className={cn('flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-soft', !c.is_active && 'opacity-75')}>
                                <div className="flex items-start gap-3">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal">
                                        <Icon className="size-5" strokeWidth={1.75} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-heading font-bold text-navy">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">/{c.slug} · urutan {c.sort_order}</p>
                                    </div>
                                    <ActiveBadge active={c.is_active} />
                                </div>
                                <p className="mt-3 line-clamp-2 flex-1 text-sm text-pretty text-navy/80">
                                    {c.description || 'Belum ada deskripsi.'}
                                </p>
                                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-semibold text-navy">{c.products_count}</span> produk ·{' '}
                                        {c.published_count} tayang
                                    </p>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${c.name}`} onClick={() => openDialog(c)}>
                                            <Pencil className="size-4" />
                                        </Button>
                                        <ConfirmPostButton
                                            url={`/admin/kategori/${c.id}`}
                                            method="delete"
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-brick"
                                            destructive
                                            title={`Hapus kategori "${c.name}"?`}
                                            description={
                                                c.products_count > 0
                                                    ? `Kategori ini masih dipakai ${c.products_count} produk sehingga tidak dapat dihapus. Nonaktifkan saja bila tidak ingin ditampilkan.`
                                                    : 'Kategori akan dihapus permanen.'
                                            }
                                            confirmLabel="Hapus"
                                        >
                                            <Trash2 className="size-4" />
                                            <span className="sr-only">Hapus {c.name}</span>
                                        </ConfirmPostButton>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {open && (
                <CategoryDialog
                    key={editing?.id ?? 'new'}
                    category={editing}
                    icons={icons}
                    open={open}
                    onOpenChange={setOpen}
                />
            )}
        </>
    );
}
