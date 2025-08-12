"use client"

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";



// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type CouponsType = {
    _id: string
    couponCode: string
    discountPercentage: number
    maxCount: number
    validTo: string
    validFrom: string
    usedCount: number
    createdAt: string
}

export const Couponcolumns: ColumnDef<CouponsType>[] = [

    {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => {
            return <span className="pl-2">{row.index + 1}</span>;
        },
    },
    {
        accessorKey: "couponCode",
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
            const title = row.getValue("couponCode") as string;
            return <span className="pl-4">{title}</span>
        }
    },
    {
        accessorKey: "discountPercentage",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Discount Percentage
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const discount = row.getValue("discountPercentage") as number;
            return <span className="pl-3">{discount}%</span>
        }
    },
    {
        accessorKey: "maxCount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Max Count
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },

        cell: ({ row }) => {
            const maxCount = row.getValue("maxCount") as number;
            return <span className="pl-3">{maxCount}</span>
        }
    },
    {
        accessorKey: "usedCount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Used Count
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    },

    {
        accessorKey: "validFrom",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Valid From
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },

        cell: ({ row }) => {
            const date = row.getValue("validFrom") as string;
            const formattedDate = format(new Date(date), "dd/MM/yyyy");
            return <span className="pl-3">{formattedDate}</span>
        }
    },
   
     {
        accessorKey: "validTo",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                  Valid To
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },

        cell: ({ row }) => {
            const date = row.getValue("validTo") as string;
            const formattedDate = format(new Date(date), "dd/MM/yyyy");
            return <span className="pl-3">{formattedDate}</span>
        }
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
    // {
    //     id: "actions",
    //     cell: ({ row }) => {
    //     const category = row.original;
    //     return <ActionsDropdown category={category} />;

    //     },
    // },
]
