import { Footer } from "@/components/custom/footer"
import { SiteNavbar } from "./_components/site-navbar"

interface SiteLayoutProps {
    children: React.ReactNode
}

export default function SiteLayout({ children }: SiteLayoutProps) {
    return (
       <main className="w-full h-screen overflow-y-auto">
            <SiteNavbar/>
         {children}
         <Footer/>
       </main>
    )
}