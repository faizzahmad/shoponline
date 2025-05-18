"use client"

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useAlertDialog } from "../../hooks/user-alert-dialog";
import { ActionsDropdown } from "./actions-dropdown";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Category = {
    _id: string
    title: string
    image: string
    createdAt: string
}

export const Categorycolumns: ColumnDef<Category>[] = [
    
    {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => {
            return <span className="pl-2">{row.index + 1}</span>;
        },
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Category Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const title = row.getValue("title") as string;
            return <span className="pl-4">{title}</span>
        }
    },
    {
        accessorKey: "image",
        cell: ({ row }) => {
            const image = row.getValue("image") as string;

            return <div className="relative size-10 rounded overflow-hidden">
                <Image src={image} alt="categoryImage" layout="fill" objectFit="cover" />
            </div>
        },

    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    createdAt
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },

        cell: ({ row }) => {
            const date = row.getValue("createdAt") as string;
            const formattedDate = format(new Date(date), "dd/MM/yyyy");
            return <span className="pl-3">{formattedDate}</span>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
        const category = row.original;
        return <ActionsDropdown category={category} />;
            
        },
    },
]
