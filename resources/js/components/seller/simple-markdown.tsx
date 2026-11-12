import { Fragment } from 'react';
import { cn } from '@/lib/utils';

type Block =
    | { type: 'h2' | 'h3' | 'p'; text: string }
    | { type: 'ul' | 'ol'; items: string[] };

function parse(source: string): Block[] {
    const blocks: Block[] = [];
    let paragraph: string[] = [];
    let list: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flush = () => {
        if (paragraph.length) {
            blocks.push({ type: 'p', text: paragraph.join(' ') });
            paragraph = [];
        }

        if (list) {
            blocks.push(list);
            list = null;
        }
    };

    for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
        const line = raw.trim();

        if (!line) {
            flush();
            continue;
        }

        if (line.startsWith('### ') || line.startsWith('## ')) {
            flush();
            blocks.push({
                type: line.startsWith('### ') ? 'h3' : 'h2',
                text: line.replace(/^#+\s/, ''),
            });
            continue;
        }

        const bullet = line.match(/^[-*]\s+(.*)$/);
        const numbered = line.match(/^\d+[.)]\s+(.*)$/);

        if (bullet || numbered) {
            const type = bullet ? 'ul' : 'ol';

            if (paragraph.length) {
                blocks.push({ type: 'p', text: paragraph.join(' ') });
                paragraph = [];
            }

            if (!list || list.type !== type) {
                if (list) {
                    blocks.push(list);
                }

                list = { type, items: [] };
            }

            list.items.push((bullet ?? numbered)![1]);
            continue;
        }

        if (list) {
            blocks.push(list);
            list = null;
        }

        paragraph.push(line);
    }

    flush();

    return blocks;
}

/** Tebalkan teks di antara **…** tanpa memakai HTML mentah. */
function Inline({ text }: { text: string }) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return (
        <>
            {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={i} className="font-semibold text-navy">
                        {part.slice(2, -2)}
                    </strong>
                ) : (
                    <Fragment key={i}>{part}</Fragment>
                ),
            )}
        </>
    );
}

/**
 * Perender Markdown sederhana (judul, paragraf, daftar) untuk materi pelatihan.
 * Konten dirender sebagai teks React biasa sehingga aman dari XSS.
 */
export default function SimpleMarkdown({
    source,
    className,
}: {
    source: string;
    className?: string;
}) {
    return (
        <div className={cn('text-[0.95rem] leading-relaxed text-navy/85', className)}>
            {parse(source).map((block, i) => {
                switch (block.type) {
                    case 'h2':
                        return (
                            <h2
                                key={i}
                                className="mt-8 mb-3 font-heading text-lg font-bold text-navy first:mt-0"
                            >
                                <Inline text={block.text} />
                            </h2>
                        );
                    case 'h3':
                        return (
                            <h3 key={i} className="mt-6 mb-2 font-heading text-base font-bold text-navy">
                                <Inline text={block.text} />
                            </h3>
                        );
                    case 'ul':
                    case 'ol': {
                        const List = block.type;

                        return (
                            <List
                                key={i}
                                className={cn(
                                    'my-3 grid gap-2 pl-5',
                                    block.type === 'ul'
                                        ? 'list-disc marker:text-gold'
                                        : 'list-decimal marker:font-semibold marker:text-teal',
                                )}
                            >
                                {block.items.map((item, j) => (
                                    <li key={j} className="pl-1">
                                        <Inline text={item} />
                                    </li>
                                ))}
                            </List>
                        );
                    }
                    default:
                        return (
                            <p key={i} className="my-3 text-pretty">
                                <Inline text={block.text} />
                            </p>
                        );
                }
            })}
        </div>
    );
}
