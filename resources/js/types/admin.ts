/**
 * Tipe khusus panel admin. Mengikuti payload dari App\Http\Controllers\Admin\*.
 */
import type {
    OrderStatus,
    ProductStatus,
    Role,
    UmkmStatus,
} from '@/types/domain';

export type StatusCounts<K extends string> = Record<K | 'all', number>;

export type KpiData = {
    active_umkm: { actual: number; target: number };
    transaction_growth: {
        actual: number | null;
        target: number;
        months: number;
        current: number;
        previous: number;
    };
    satisfaction: { actual: number | null; target: number; reviews: number };
    training: { actual: number | null; target: number };
};

export type TotalsData = {
    umkm_active: number;
    umkm_pending: number;
    products: number;
    products_published: number;
    products_pending: number;
    orders: number;
    gmv: number;
    customers: number;
    rating: number | null;
    reviews: number;
    has_demo: boolean;
};

export type MonthlyPoint = {
    label: string;
    key: string;
    orders: number;
    revenue: number;
};

export type AdminUmkmRow = {
    id: number;
    name: string;
    slug: string;
    city: string;
    status: UmkmStatus;
    logo_url: string | null;
    owner: { name: string; email: string; is_active: boolean } | null;
    products_count: number;
    orders_count: number;
    is_demo: boolean;
    created_at: string | null;
};

export type AdminUmkmDetail = {
    id: number;
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
    verified_at: string | null;
    rejection_reason: string | null;
    is_demo: boolean;
    created_at: string | null;
    owner: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        is_active: boolean;
        created_at: string | null;
    } | null;
};

export type AdminProductRow = {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    sold_count: number;
    status: ProductStatus;
    is_active: boolean;
    is_featured: boolean;
    is_demo: boolean;
    is_published: boolean;
    image_url: string | null;
    category: { name: string; slug: string; icon: string } | null;
    umkm: { id: number; name: string; city: string; status: UmkmStatus } | null;
    updated_at: string | null;
    created_at: string | null;
};

export type AdminProductDetail = AdminProductRow & {
    summary: string | null;
    description: string | null;
    weight_gram: number | null;
    rejection_reason: string | null;
    rating: number | null;
    reviews_count: number;
    order_items_count: number;
    images: { id: number; url: string | null; alt: string }[];
    story: {
        title: string;
        body: string;
        process_note: string | null;
        material_note: string | null;
        cultural_note: string | null;
        is_verified: boolean;
    } | null;
};

export type AdminCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    sort_order: number;
    is_active: boolean;
    products_count: number;
    published_count: number;
};

export type AdminOrderRow = {
    id: number;
    number: string;
    status: OrderStatus;
    total: number;
    items_count: number;
    buyer: { name: string; email: string } | null;
    umkm: { name: string; city: string } | null;
    payment_label: string;
    is_demo: boolean;
    created_at: string | null;
};

export type AdminUserRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
    role_label: string;
    is_active: boolean;
    is_demo: boolean;
    orders_count: number;
    umkm: { id: number; name: string; status: UmkmStatus } | null;
    created_at: string | null;
    can_toggle: boolean;
};

export type TrainingMaterialRow = {
    id: number;
    title: string;
    slug: string;
    topic: string;
    topic_label: string;
    summary: string | null;
    duration_minutes: number;
    sort_order: number;
    is_published: boolean;
    updated_at: string | null;
    completed_count?: number;
    completion_rate?: number;
    content?: string;
};

export type Option = { id: number; name: string; slug?: string };
