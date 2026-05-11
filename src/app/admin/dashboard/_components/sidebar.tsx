"use client";
import { cn } from "@/lib/utils"
import { Backpack, BadgePercent, Home, Images, Loader2, Package, Power, SquareStack, TruckElectric, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const res = await fetch("/api/admin-logout", { method: "POST" });
            if (!res.ok) {
                throw new Error("Logout failed");
            }
            toast.success("Logged out");
            router.push("/admin");
            router.refresh();
        } catch {
            toast.error("Could not log out. Try again.");
        } finally {
            setLoggingOut(false);
        }
    };
    const sidebarItems = [
        {
            name : 'Dashboard',
            icon : Home,
            link : '/admin/dashboard'
        },
        {
            name : 'Categories',
            icon : SquareStack,
            link : '/admin/dashboard/categories'
        },
        {
            name : 'Products',
            icon : Backpack,
            link : '/admin/dashboard/products'
        },
        {
            name : 'Orders',
            icon : TruckElectric,
            link : '/admin/dashboard/orders'
        },
        {
            name : 'Users',
            icon : Users,
            link : '/admin/dashboard/users'
        },
        {
            name : 'Coupons',
            icon : BadgePercent,
            link : '/admin/dashboard/coupons'
        },
        {
            name : 'Banners',
            icon : Images,
            link : '/admin/dashboard/banners'
        },
        {
            name : 'Packages',
            icon : Package,
            link : '/admin/dashboard/packages'
        },

    ]
    return (
        <>
          <div className="mb-10">
              <Image src={'/images/web/logo.png'} alt="logo" height={60} width={100} />
          </div>
        <ul className="w-full flex flex-col gap-2">
            {sidebarItems.map((item) => (
                <li key={item.name} className={cn("flex items-center gap-4 p-2 hover:bg-indigo-100 rounded-md cursor-pointer", pathname === item.link && "bg-indigo-100" )}>
                    <item.icon size={20} />
                    <Link href={item.link}>{item.name}</Link>
                </li>
            ))}
            <li>
                <button
                    type="button"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    className={cn(
                        "flex w-full items-center gap-4 p-2 rounded-md text-left hover:bg-indigo-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                >
                    {loggingOut ? (
                        <Loader2 size={20} className="animate-spin shrink-0" />
                    ) : (
                        <Power size={20} className="shrink-0" />
                    )}
                    Logout
                </button>
            </li>
        </ul>
        </>
    )
}