import { Footer } from "@/components/custom/footer"
import { SiteNavbar } from "./_components/site-navbar"
import { BottomNavigation } from "./_components/bottom-navigation"

interface SiteLayoutProps {
    children: React.ReactNode
}

export default function SiteLayout({ children }: SiteLayoutProps) {
    return (
       <main className="w-full h-screen overflow-y-auto">
            <SiteNavbar/>
         {children}
         <BottomNavigation/>
        <div className="md:mb-0 mb-16">
             <Footer/>
        </div>
       </main>
    )
}