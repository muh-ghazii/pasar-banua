import type { CategoryLite, ProductCardData } from '@/types/domain';

export type CategoryWithStats = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    products_count: number;
    cover_url: string | null;
};

export type StoryCardData = {
    id: number;
    title: string;
    excerpt: string;
    is_verified: boolean;
    product: {
        name: string;
        slug: string;
        image_url: string | null;
        category: CategoryLite | null;
        umkm: string | null;
        city?: string | null;
    };
};

export type StoryDetail = {
    title: string;
    body: string;
    process_note: string | null;
    material_note: string | null;
    cultural_note: string | null;
    is_verified: boolean;
};

export type CatalogFilters = {
    q: string;
    kategori: string;
    kota: string;
    harga_min: number | null;
    harga_maks: number | null;
    tersedia: boolean;
    urut: 'terbaru' | 'populer' | 'termurah' | 'termahal' | 'rating';
};

export type CartLine = {
    id: number;
    quantity: number;
    line_total: number;
    issue: string | null;
    available: boolean;
    product: {
        id: number;
        name: string;
        slug: string;
        price: number;
        stock: number;
        image_url: string | null;
        category: string | null;
        category_slug: string | null;
    };
};

export type CartGroup = {
    umkm: { id: number; name: string; slug: string; city: string };
    items: CartLine[];
    subtotal: number;
    shipping_fee: number;
};

export type CartSummary = {
    groups: CartGroup[];
    items_count: number;
    subtotal: number;
    shipping_fee: number;
    total: number;
    has_issues: boolean;
};

export type { ProductCardData };
