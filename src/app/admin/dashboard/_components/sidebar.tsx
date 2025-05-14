"use client";
import { cn } from "@/lib/utils"
import { Backpack, BadgePercent, Home, Images, Power, SquareStack, TruckElectric, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const Sidebar = () => {
    const pathname = usePathname();
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
        }



    ]
    return (
        <>
          <div className="mb-10">
              <Image src={'/images/web/logo.svg'} alt="logo" height={60} width={100} />
          </div>
        <ul className="w-full flex flex-col gap-2">
            {sidebarItems.map((item) => (
                <li key={item.name} className={cn("flex items-center gap-4 p-2 hover:bg-indigo-100 rounded-md cursor-pointer", pathname === item.link && "bg-indigo-100" )}>
                    <item.icon size={20} />
                    <Link href={item.link}>{item.name}</Link>
                </li>
            ))}
            <li  className={"flex items-center gap-4 p-2 hover:bg-indigo-100 rounded-md cursor-pointer"}>
                    <Power size={20} />
                    Logout
                </li>
        </ul>
        </>
    )
}