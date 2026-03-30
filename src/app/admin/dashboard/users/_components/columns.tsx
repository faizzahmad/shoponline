"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type UserRow = {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    createdAt?: string;
};

export const Usercolumns: ColumnDef<UserRow>[] = [
    {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => <span className="pl-2">{row.index + 1}</span>,
    },
    {
        accessorKey: "firstName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const first = row.original.firstName;
            const last = row.original.lastName;
            return (
                <span className="pl-2">
                    {first} {last}
                </span>
            );
        },
    },
    {
        accessorKey: "phoneNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Phone
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span className="pl-2">{row.original.phoneNumber}</span>,
    },
    {
        accessorKey: "role",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Role
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="pl-2 capitalize">{row.original.role || "user"}</span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Joined
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const raw = row.original.createdAt;
            const d = raw ? new Date(raw) : null;
            return (
                <span className="pl-2 text-sm whitespace-nowrap">
                    {d && !Number.isNaN(d.getTime()) ? format(d, "dd/MM/yyyy") : "—"}
                </span>
            );
        },
    },
];
