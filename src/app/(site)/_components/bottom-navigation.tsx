import { currentUser } from "@clerk/nextjs/server"
import { Home, ShoppingBasketIcon, User2 } from "lucide-react"
import Link from "next/link"

export const BottomNavigation = async () => {
     const user = await currentUser()
    return (
        <div className="w-full md:hidden  fixed bottom-0 left-0 p-5 grid grid-cols-3 gap-5 justify-between bg-white items-center border shadow-sm">
            <Link className="text-2xl font-semibold w-full flex  justify-center"
                href={'/'}>
                <Home />
            </Link>

            <Link className="text-2xl font-semibold w-full flex  justify-center"
                href={'/shop'}>
                <ShoppingBasketIcon />
            </Link>

            <Link className="text-2xl font-semibold w-full flex  justify-center"
                href={user ? '/account' : '/sign-in'}>
                <User2 />
            </Link>


        </div>
    )
}