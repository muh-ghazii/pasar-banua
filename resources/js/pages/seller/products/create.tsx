import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/dashboard/page-header';
import ProductForm from '@/components/seller/product-form';
import { Button } from '@/components/ui/button';
import type { ProductFormLimits, SellerCategoryOption } from '@/types/seller';

export default function CreateProduct({
    categories,
    limits,
}: {
    categories: SellerCategoryOption[];
    limits: ProductFormLimits;
}) {
    return (
        <>
            <Head title="Tambah produk" />
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
                <Link href="/seller/produk">
                    <ArrowLeft />
                    Kelola produk
                </Link>
            </Button>
            <PageHeader
                eyebrow="Produk baru"
                title="Tambah produk"
                description="Lengkapi data produk. Setelah disimpan, produk ditinjau admin sebelum tampil di katalog Pasar Banua."
            />
            <ProductForm product={null} categories={categories} limits={limits} />
        </>
    );
}
