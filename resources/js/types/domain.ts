/**
 * Tipe domain Pasar Banua. Bentuknya mengikuti data yang dikirim controller
 * Laravel lewat Inertia.
 */

export type Role = 'customer' | 'seller' | 'admin';

export type UmkmStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProductStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled';

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
};

export type CategoryLite = { name: string; slug: string; icon?: string | null };

export type NavCategory = { id: number; name: string; slug: string; icon: string };

export type ProductCardData = {
    id: number;
    name: string;
    slug: string;
    summary: string | null;
    price: number;
    stock: number;
    sold_count: number;
    is_featured: boolean;
    image_url: string | null;
    image_alt: string;
    category: CategoryLite | null;
    umkm: { name: string; slug: string; city: string } | null;
    rating: number | null;
    reviews_count: number;
};

export type UmkmCardData = {
    id: number;
    name: string;
    slug: string;
    tagline: string | null;
    city: string;
    logo_url: string | null;
    cover_url: string | null;
    products_count: number;
    is_demo: boolean;
};

export type SharedUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
    role_label: string;
    home_path: string;
    umkm: {
        id: number;
        name: string;
        slug: string;
        status: UmkmStatus;
        status_label: string;
        logo_url: string | null;
    } | null;
};

export type AppNotificationItem = {
    id: string;
    title: string;
    message: string;
    url: string | null;
    tone: 'info' | 'success' | 'danger' | 'warning';
    read: boolean;
    created_at: string | null;
};

export type OrderItemData = {
    id: number;
    product_id: number | null;
    product_name: string;
    product_slug?: string | null;
    image_url: string | null;
    unit_price: number;
    quantity: number;
    subtotal: number;
};

export type OrderData = {
    id: number;
    number: string;
    status: OrderStatus;
    status_label: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string | null;
    postal_code: string | null;
    notes: string | null;
    payment_method: string;
    payment_label: string;
    subtotal: number;
    shipping_fee: number;
    total: number;
    tracking_note: string | null;
    cancel_reason: string | null;
    created_at: string;
    processed_at: string | null;
    shipped_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    is_demo: boolean;
    umkm?: { name: string; slug: string; city: string } | null;
    buyer?: { name: string; email: string } | null;
    items: OrderItemData[];
    items_count?: number;
    can?: {
        cancel?: boolean;
        confirm_received?: boolean;
        update_status?: boolean;
        review?: boolean;
    };
    next_statuses?: { value: OrderStatus; label: string }[];
};

export type StatItem = {
    label: string;
    value: string | number;
    hint?: string;
};

export type TrendPoint = { label: string; value: number };
