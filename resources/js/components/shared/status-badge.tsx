import { Badge } from '@/components/ui/badge';
import type {
    OrderStatus,
    ProductStatus,
    UmkmStatus,
} from '@/types/domain';

type Variant = React.ComponentProps<typeof Badge>['variant'];

const orderMap: Record<OrderStatus, { label: string; variant: Variant }> = {
    pending: { label: 'Menunggu konfirmasi', variant: 'gold' },
    processing: { label: 'Diproses', variant: 'teal' },
    shipped: { label: 'Dikirim', variant: 'navy' },
    completed: { label: 'Selesai', variant: 'default' },
    cancelled: { label: 'Dibatalkan', variant: 'brick' },
};

const productMap: Record<ProductStatus, { label: string; variant: Variant }> = {
    pending: { label: 'Menunggu kurasi', variant: 'gold' },
    approved: { label: 'Disetujui', variant: 'teal' },
    rejected: { label: 'Ditolak', variant: 'brick' },
};

const umkmMap: Record<UmkmStatus, { label: string; variant: Variant }> = {
    pending: { label: 'Menunggu verifikasi', variant: 'gold' },
    approved: { label: 'Terverifikasi', variant: 'teal' },
    rejected: { label: 'Ditolak', variant: 'brick' },
    suspended: { label: 'Dinonaktifkan', variant: 'neutral' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const item = orderMap[status];

    return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
    const item = productMap[status];

    return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function UmkmStatusBadge({ status }: { status: UmkmStatus }) {
    const item = umkmMap[status];

    return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function ActiveBadge({
    active,
    activeLabel = 'Aktif',
    inactiveLabel = 'Nonaktif',
}: {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}) {
    return (
        <Badge variant={active ? 'teal' : 'neutral'}>
            {active ? activeLabel : inactiveLabel}
        </Badge>
    );
}

/** Penanda data simulasi. Tampil di dashboard/analitik saat mode demo aktif. */
export function DemoBadge({ className }: { className?: string }) {
    return (
        <Badge variant="gold" className={className} title="Data simulasi untuk demonstrasi">
            DEMO
        </Badge>
    );
}
