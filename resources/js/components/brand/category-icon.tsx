import {
    HandHeart,
    House,
    type LucideIcon,
    Package,
    Shirt,
    Utensils,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
    utensils: Utensils,
    hand: HandHeart,
    shirt: Shirt,
    house: House,
    package: Package,
};

export function categoryIcon(name?: string | null): LucideIcon {
    return (name && icons[name]) || Package;
}

/** Warna aksen per kategori untuk visual cadangan. */
export const categoryTone: Record<
    string,
    { bg: string; line: string; chip: string; icon: string }
> = {
    kuliner: {
        bg: '#F3E3C6',
        line: '#C5872A',
        chip: '#FBF3E2',
        icon: '#9D6A1C',
    },
    kerajinan: {
        bg: '#D6E8E6',
        line: '#076468',
        chip: '#EEF6F5',
        icon: '#054F52',
    },
    'kain-fashion': {
        bg: '#E7CFC9',
        line: '#952831',
        chip: '#F6E9E6',
        icon: '#7D1F27',
    },
    'rumah-tangga': {
        bg: '#D9DEE6',
        line: '#14263E',
        chip: '#EDF0F4',
        icon: '#14263E',
    },
};

export const defaultTone = categoryTone.kerajinan;
