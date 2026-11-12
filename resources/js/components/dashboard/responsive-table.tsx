import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type Column<T> = {
    key: string;
    header: string;
    /** Render sel. Pada mobile dipakai sebagai nilai pada baris label:nilai. */
    cell: (row: T) => React.ReactNode;
    className?: string;
    /** Kolom utama: menjadi judul kartu pada mobile dan tidak diberi label. */
    primary?: boolean;
    /** Kolom aksi: ditaruh di bawah kartu pada mobile. */
    actions?: boolean;
    /** Sembunyikan pada tampilan kartu mobile. */
    hideOnMobile?: boolean;
    align?: 'left' | 'right';
};

/**
 * Tabel untuk desktop yang otomatis berubah menjadi daftar kartu di layar kecil
 * sehingga tidak perlu scroll horizontal.
 */
export default function ResponsiveTable<T>({
    columns,
    rows,
    rowKey,
    className,
}: {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    className?: string;
}) {
    const primary = columns.find((c) => c.primary) ?? columns[0];
    const actions = columns.find((c) => c.actions);
    const details = columns.filter(
        (c) => c !== primary && c !== actions && !c.hideOnMobile,
    );

    return (
        <div className={className}>
            {/* Desktop / tablet */}
            <div className="hidden overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft md:block">
                <Table>
                    <TableHeader className="bg-cream-200/60">
                        <TableRow className="hover:bg-transparent">
                            {columns.map((c) => (
                                <TableHead
                                    key={c.key}
                                    className={cn(
                                        c.align === 'right' && 'text-right',
                                        c.className,
                                    )}
                                >
                                    {c.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={rowKey(row)}>
                                {columns.map((c) => (
                                    <TableCell
                                        key={c.key}
                                        className={cn(
                                            c.align === 'right' && 'text-right',
                                            c.className,
                                        )}
                                    >
                                        {c.cell(row)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile */}
            <ul className="grid gap-3 md:hidden">
                {rows.map((row) => (
                    <li
                        key={rowKey(row)}
                        className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft"
                    >
                        <div className="min-w-0">{primary.cell(row)}</div>
                        {details.length > 0 && (
                            <dl className="mt-3 grid gap-2 border-t border-border/70 pt-3 text-sm">
                                {details.map((c) => (
                                    <div
                                        key={c.key}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <dt className="shrink-0 text-xs font-semibold text-muted-foreground">
                                            {c.header}
                                        </dt>
                                        <dd className="min-w-0 text-right">
                                            {c.cell(row)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        {actions && (
                            <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-border/70 pt-3">
                                {actions.cell(row)}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
