import { Footer } from "@/components/custom/footer"
import { SiteNavbar } from "./_components/site-navbar"
import { BottomNavigation } from "./_components/bottom-navigation"
import { StickyRevealNavbar } from "./_components/sticky-reveal-navbar"

interface SiteLayoutProps {
    children: React.ReactNode
}

export default function SiteLayout({ children }: SiteLayoutProps) {
    return (
       <main id="site-scroll-root" className="w-full h-screen overflow-y-auto overflow-x-hidden">
            <StickyRevealNavbar>
                <SiteNavbar />
            </StickyRevealNavbar>
         {children}
         <BottomNavigation/>
        <div className="md:mb-0 mb-[4.25rem]">
             <Footer/>
        </div>
       </main>
    )
}