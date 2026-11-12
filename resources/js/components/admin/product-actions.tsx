import { Star } from 'lucide-react';
import { quickPost } from '@/components/admin/actions';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { AdminProductRow } from '@/types/admin';

export const REJECT_SUGGESTIONS = [
    'Foto produk kurang jelas atau buram',
    'Deskripsi belum lengkap (bahan, ukuran, berat)',
    'Harga belum sesuai dengan isi kemasan',
    'Produk tidak sesuai kategori yang dipilih',
];

export function FeaturedToggle({ product }: { product: AdminProductRow }) {
    const disabled = product.status !== 'approved' && !product.is_featured;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled}
                    aria-pressed={product.is_featured}
                    aria-label={product.is_featured ? 'Hapus dari produk unggulan' : 'Jadikan produk unggulan'}
                    onClick={() => quickPost(`/admin/produk/${product.id}/unggulan`)}
                >
                    <Star className={cn('size-[18px]', product.is_featured ? 'fill-gold text-gold' : 'text-muted-foreground')} strokeWidth={1.75} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {disabled ? 'Setujui produk dulu' : product.is_featured ? 'Produk unggulan' : 'Jadikan unggulan'}
            </TooltipContent>
        </Tooltip>
    );
}
