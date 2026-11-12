import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ExistingImage = { id: number; url: string | null; alt?: string | null };

/**
 * Pemilih gambar dengan pratinjau. Mengelola daftar File baru dan gambar
 * lama yang akan dihapus; validasi akhir tetap dilakukan di backend.
 */
export default function ImageUploader({
    files,
    onFilesChange,
    existing = [],
    removedIds = [],
    onRemovedChange,
    max = 6,
    maxSizeMb = 3,
    multiple = true,
    error,
    label = 'Tambah foto',
    className,
    shape = 'square',
}: {
    files: File[];
    onFilesChange: (files: File[]) => void;
    existing?: ExistingImage[];
    removedIds?: number[];
    onRemovedChange?: (ids: number[]) => void;
    max?: number;
    maxSizeMb?: number;
    multiple?: boolean;
    error?: string;
    label?: string;
    className?: string;
    shape?: 'square' | 'wide';
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const keptExisting = existing.filter((e) => !removedIds.includes(e.id));
    const total = keptExisting.length + files.length;

    const previews = useMemo(
        () => files.map((file) => URL.createObjectURL(file)),
        [files],
    );

    useEffect(
        () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
        [previews],
    );

    function handleSelect(list: FileList | null) {
        if (!list) {
            return;
        }

        const accepted = Array.from(list).filter(
            (f) =>
                ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) &&
                f.size <= maxSizeMb * 1024 * 1024,
        );
        const next = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
        onFilesChange(next.slice(0, Math.max(0, multiple ? max - keptExisting.length : 1)));

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    const tile = cn(
        'group relative overflow-hidden rounded-xl border border-border bg-cream-200',
        shape === 'square' ? 'aspect-square' : 'aspect-[16/9]',
    );

    return (
        <div className={className}>
            <div
                className={cn(
                    'grid gap-3',
                    shape === 'square'
                        ? 'grid-cols-3 sm:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2',
                )}
            >
                {keptExisting.map((img) => (
                    <div key={`e-${img.id}`} className={tile}>
                        {img.url && (
                            <img
                                src={img.url}
                                alt={img.alt ?? ''}
                                className="size-full object-cover"
                            />
                        )}
                        {onRemovedChange && (
                            <button
                                type="button"
                                aria-label="Hapus foto"
                                onClick={() => onRemovedChange([...removedIds, img.id])}
                                className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-navy/80 text-cream hover:bg-brick"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        )}
                    </div>
                ))}
                {previews.map((url, i) => (
                    <div key={url} className={tile}>
                        <img src={url} alt="" className="size-full object-cover" />
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-gold px-1.5 py-0.5 text-[0.6rem] font-bold text-navy">
                            BARU
                        </span>
                        <button
                            type="button"
                            aria-label="Batalkan foto baru"
                            onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))}
                            className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-navy/80 text-cream hover:bg-brick"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                ))}
                {(multiple ? total < max : total < 1) && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className={cn(
                            'flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-input bg-[#faf6f0] text-sm font-semibold text-teal transition-colors hover:border-primary hover:bg-teal-50',
                            shape === 'square' ? 'aspect-square' : 'aspect-[16/9]',
                        )}
                    >
                        <ImagePlus className="size-6" strokeWidth={1.75} />
                        <span className="px-2 text-center text-xs">{label}</span>
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={multiple}
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => handleSelect(e.target.files)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG, atau WebP, maksimal {maxSizeMb} MB per foto
                {multiple ? ` (hingga ${max} foto)` : ''}.
            </p>
            {error && (
                <p role="alert" className="mt-1 text-xs font-medium text-brick">
                    {error}
                </p>
            )}
            {files.length > 0 && (
                <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="mt-1"
                    onClick={() => onFilesChange([])}
                >
                    Kosongkan foto baru
                </Button>
            )}
        </div>
    );
}
