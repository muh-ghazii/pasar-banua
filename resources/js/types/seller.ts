/**
 * Tipe khusus dashboard UMKM (mengikuti payload controller App\Http\Controllers\Seller).
 */
import type {
    CategoryLite,
    OrderData,
    OrderStatus,
    ProductStatus,
    UmkmStatus,
} from '@/types/domain';

export type SellerCategoryOption = {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
};

export type SellerProductRow = {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    sold_count: number;
    status: ProductStatus;
    status_label: string;
    is_active: boolean;
    is_featured: boolean;
    is_demo: boolean;
    has_story: boolean;
    rejection_reason: string | null;
    image_url: string | null;
    category: CategoryLite | null;
    updated_at: string | null;
};

export type SellerProductDetail = SellerProductRow & {
    summary: string | null;
    description: string | null;
    weight_gram: number | null;
    category_id: number;
    images: { id: number; url: string | null; alt: string | null }[];
    story_title: string | null;
    story_body: string | null;
};

export type ProductFormLimits = {
    max_images: number;
    max_image_mb: number;
};

export type StockRow = {
    id: number;
    name: string;
    slug: string;
    stock: number;
    price: number;
    sold_count: number;
    is_active: boolean;
    status: ProductStatus;
    image_url: string | null;
    category: CategoryLite | null;
    updated_at: string | null;
};

export type StoryRow = {
    id: number;
    name: string;
    slug: string;
    status: ProductStatus;
    image_url: string | null;
    category: CategoryLite | null;
    story: {
        title: string;
        excerpt: string;
        is_verified: boolean;
        updated_at: string | null;
    } | null;
};

export type StoryDetail = {
    title: string;
    body: string;
    process_note: string | null;
    material_note: string | null;
    cultural_note: string | null;
    is_verified: boolean;
    updated_at: string | null;
};

export type TrainingItem = {
    id: number;
    title: string;
    slug: string;
    topic: string;
    summary: string | null;
    duration_minutes: number;
    completed: boolean;
};

export type TrainingDetail = {
    id: number;
    title: string;
    slug: string;
    topic: string;
    summary: string | null;
    content: string;
    duration_minutes: number;
    completed_at: string | null;
};

export type SellerUmkmProfile = {
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    story: string | null;
    city: string;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    instagram: string | null;
    logo_url: string | null;
    cover_url: string | null;
    status: UmkmStatus;
    status_label: string;
    rejection_reason: string | null;
    verified_at: string | null;
    is_demo: boolean;
};

export type SellerDashboardData = {
    umkm: {
        name: string;
        slug: string;
        status: UmkmStatus;
        status_label: string;
        rejection_reason: string | null;
        is_demo: boolean;
        profile_complete: boolean;
    };
    stats: {
        active_products: number;
        pending_products: number;
        rejected_products: number;
        total_products: number;
        total_orders: number;
        to_process: number;
        awaiting_confirmation: number;
        completed_orders: number;
        revenue_completed: number;
        revenue_in_progress: number;
    };
    orderStatus: { value: OrderStatus; label: string; count: number }[];
    trend: { label: string; value: number }[];
    latestOrders: OrderData[];
    lowStock: {
        id: number;
        name: string;
        slug: string;
        stock: number;
        image_url: string | null;
    }[];
    topProducts: {
        id: number;
        name: string;
        slug: string;
        sold_count: number;
        price: number;
        image_url: string | null;
    }[];
    training: { completed: number; total: number };
};
