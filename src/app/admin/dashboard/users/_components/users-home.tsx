"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { fetchData } from "@/utils/apiCall";
import { Usercolumns, type UserRow } from "./columns";
import { UsersDataTable } from "./users-table";

export const UsersHome = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserRow[]>([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchData<UserRow[]>("users");
                if (Array.isArray(data)) {
                    setUsers(data);
                }
            } catch {
                toast.error("Could not load users");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Users</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Customers synced from Clerk into your database.
                </p>
            </div>
            <div className="w-full bg-white shadow-sm border border-neutral-200 rounded-lg p-5">
                {loading ? (
                    <div className="w-full h-[50vh] flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader className="size-8 animate-spin" />
                        Loading users…
                    </div>
                ) : (
                    <UsersDataTable data={users} columns={Usercolumns} />
                )}
            </div>
        </>
    );
};
