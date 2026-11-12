import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eye } from 'lucide-react';
import PageHeader from '@/components/dashboard/page-header';
import ProductForm from '@/components/seller/product-form';
import { Button } from '@/components/ui/button';
import type {
    ProductFormLimits,
    SellerCategoryOption,
    SellerProductDetail,
} from '@/types/seller';

export default function EditProduct({
    product,
    categories,
    limits,
}: {
    product: SellerProductDetail;
    categories: SellerCategoryOption[];
    limits: ProductFormLimits;
}) {
    return (
        <>
            <Head title={`Ubah ${product.name}`} />
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
                <Link href="/seller/produk">
                    <ArrowLeft />
                    Kelola produk
                </Link>
            </Button>
            <PageHeader
                eyebrow="Ubah produk"
                title={product.name}
                description={`Terjual ${product.sold_count} unit · stok saat ini ${product.stock}`}
                actions={
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/produk/${product.slug}`}>
                            <Eye />
                            {product.status === 'approved' && product.is_active ? 'Lihat di toko' : 'Pratinjau'}
                        </Link>
                    </Button>
                }
            />
            <ProductForm product={product} categories={categories} limits={limits} />
        </>
    );
}
