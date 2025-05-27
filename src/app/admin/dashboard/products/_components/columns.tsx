"use client"

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ActionsDropdown } from "./actions-dropdown";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product  = {
    _id : string;
    productName: string;
    images: string[];
    productStock: string;
    productCategory: string;
    productCategoryId: string;
    productSubCategory: string;
    productSubCategoryId: string;
    discountPrice: string;
    originalPrice: string;
    shortDescription: string;
    longDescription: string;
    varients: any[];
};

export const Productcolumns: ColumnDef<Product>[] = [
    
    {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => {
            return <span className="pl-2">{row.index + 1}</span>;
        },
    },
    {
        accessorKey: "productName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Product Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const title = row.getValue("productName") as string;
            return <span className="pl-4">{title}</span>
        }
    },
    {
        accessorKey: "images",
        cell: ({ row }) => {
            const images = row.getValue("images") as string;

            return <div className="relative size-10 rounded overflow-hidden">
                <Image src={images[0]} alt="categoryImage" layout="fill" objectFit="cover" />
            </div>
        },

    },
    {
        accessorKey: "productStock",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                   Product stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const stock = row.getValue("productStock") as number;
            return <span className="pl-4">{stock}</span>
        }
    },
     {
        accessorKey: "originalPrice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                   Price
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = row.getValue("originalPrice") as number;
            return <span className="pl-4">{price}</span>
        }
    },

    {
  accessorKey: "category",
  header: "Category/SubCategory",
  cell: ({ row }) => {
    const category = row.original.productCategory as string;
    const subCategory = row.original.productSubCategory as string;

    return (
      <div>
        {category} / {subCategory}
      </div>
    );
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
        const product = row.original;
        return <ActionsDropdown product={product} />;
            
        },
    },
]
