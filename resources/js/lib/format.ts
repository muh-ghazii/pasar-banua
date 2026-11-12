const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
});

/** Format Rupiah tanpa spasi, mis. Rp25.000 */
export function formatRupiah(value: number | null | undefined): string {
    return rupiah.format(value ?? 0).replace(/\s/g, '');
}

/** Format ringkas untuk sumbu grafik, mis. 1,2 jt */
export function formatCompactRupiah(value: number): string {
    if (value >= 1_000_000_000) {
        return `Rp${(value / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
    }

    if (value >= 1_000_000) {
        return `Rp${(value / 1_000_000).toFixed(1).replace('.', ',')} jt`;
    }

    if (value >= 1_000) {
        return `Rp${Math.round(value / 1_000)} rb`;
    }

    return `Rp${value}`;
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export function timeAgo(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.round(diff / 60000);

    if (minutes < 1) {
        return 'baru saja';
    }

    if (minutes < 60) {
        return `${minutes} menit lalu`;
    }

    const hours = Math.round(minutes / 60);

    if (hours < 24) {
        return `${hours} jam lalu`;
    }

    const days = Math.round(hours / 24);

    if (days < 7) {
        return `${days} hari lalu`;
    }

    return formatDate(value);
}

export function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}
