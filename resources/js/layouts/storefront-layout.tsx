import MobileTabbar from '@/components/shop/mobile-tabbar';
import SiteFooter from '@/components/shop/site-footer';
import SiteHeader from '@/components/shop/site-header';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <a
                href="#konten"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-cream"
            >
                Lewati ke konten
            </a>
            <SiteHeader />
            <main id="konten" className="flex-1 pb-20 lg:pb-0">
                {children}
            </main>
            <SiteFooter />
            <MobileTabbar />
        </div>
    );
}
