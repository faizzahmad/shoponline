"use client";

import { Button } from "@/components/ui/button";
import { FixedLoader } from "@/components/custom/fixed-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { deleteData, fetchData, postData, updateDataWithData } from "@/utils/apiCall";
import { Loader2, Package, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type ShippingPackageRow = {
    _id: string;
    name: string;
    length: number;
    breadth: number;
    height: number;
    maxWeightGrams?: number;
    notes?: string;
    sortOrder?: number;
    createdAt?: string;
};

type MessageResponse = { message: string };

const emptyForm = () => ({
    name: "",
    length: "",
    breadth: "",
    height: "",
    maxWeightGrams: "",
    notes: "",
    sortOrder: "0",
});

export const PackagesHome = () => {
    const [packages, setPackages] = useState<ShippingPackageRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ShippingPackageRow | null>(null);

    const loadPackages = async () => {
        setLoading(true);
        try {
            const rows = await fetchData<ShippingPackageRow[]>("packages");
            setPackages(Array.isArray(rows) ? rows : []);
        } catch {
            toast.error("Could not load packages");
            setPackages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPackages();
    }, []);

    const validateForm = (): boolean => {
        if (!form.name.trim()) {
            toast.error("Enter a package name");
            return false;
        }
        const L = Number(form.length);
        const B = Number(form.breadth);
        const H = Number(form.height);
        if (!Number.isFinite(L) || L <= 0) {
            toast.error("Length must be greater than 0 (cm)");
            return false;
        }
        if (!Number.isFinite(B) || B <= 0) {
            toast.error("Breadth must be greater than 0 (cm)");
            return false;
        }
        if (!Number.isFinite(H) || H <= 0) {
            toast.error("Height must be greater than 0 (cm)");
            return false;
        }
        if (form.maxWeightGrams.trim()) {
            const w = Number(form.maxWeightGrams);
            if (!Number.isFinite(w) || w < 1) {
                toast.error("Max weight must be at least 1 gram, or leave empty");
                return false;
            }
        }
        return true;
    };

    const resetForm = () => {
        setForm(emptyForm());
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const basePayload = {
            name: form.name.trim(),
            length: Number(form.length),
            breadth: Number(form.breadth),
            height: Number(form.height),
            maxWeightGrams: form.maxWeightGrams.trim()
                ? Number(form.maxWeightGrams)
                : null,
            notes: form.notes,
            sortOrder: Number(form.sortOrder) || 0,
        };

        setSaving(true);
        try {
            if (editingId) {
                const res = await updateDataWithData<
                    typeof basePayload & { _id: string },
                    MessageResponse
                >("packages", { ...basePayload, _id: editingId });
                toast.success(res.message || "Package updated");
            } else {
                const res = await postData<typeof basePayload, MessageResponse>(
                    "packages",
                    basePayload
                );
                toast.success(res.message || "Package created");
            }
            resetForm();
            await loadPackages();
        } catch {
            toast.error(editingId ? "Failed to update package" : "Failed to create package");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (row: ShippingPackageRow) => {
        setEditingId(row._id);
        setForm({
            name: row.name,
            length: String(row.length),
            breadth: String(row.breadth),
            height: String(row.height),
            maxWeightGrams:
                row.maxWeightGrams != null ? String(row.maxWeightGrams) : "",
            notes: row.notes ?? "",
            sortOrder: String(row.sortOrder ?? 0),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteData<MessageResponse>(
                `packages?id=${encodeURIComponent(deleteTarget._id)}`
            );
            toast.success("Package removed");
            if (editingId === deleteTarget._id) resetForm();
            setDeleteTarget(null);
            await loadPackages();
        } catch {
            toast.error("Could not delete package");
        }
    };

    return (
        <>
            {saving && <FixedLoader />}
            <div className="space-y-6 raleway max-w-6xl">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Package className="size-7 text-indigo-600" aria-hidden />
                            Shipping packages
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                            Save the box sizes you use for packing. Dimensions are in centimetres;
                            optional max weight helps when you plug in Shiprocket later.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white border rounded-lg shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between gap-2 border-b pb-3 mb-1">
                        <h2 className="text-lg font-medium">
                            {editingId ? "Edit package" : "Add package"}
                        </h2>
                        {editingId ? (
                            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                                Cancel edit
                            </Button>
                        ) : null}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="pkg-name">Name</Label>
                        <Input
                            id="pkg-name"
                            placeholder="e.g. Small carton — 6×4×3 in"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pkg-sort">Sort order</Label>
                        <Input
                            id="pkg-sort"
                            type="number"
                            inputMode="numeric"
                            value={form.sortOrder}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, sortOrder: e.target.value }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pkg-l">Length (cm)</Label>
                        <Input
                            id="pkg-l"
                            type="number"
                            min={0.1}
                            step="0.1"
                            value={form.length}
                            onChange={(e) => setForm((f) => ({ ...f, length: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pkg-b">Breadth (cm)</Label>
                        <Input
                            id="pkg-b"
                            type="number"
                            min={0.1}
                            step="0.1"
                            value={form.breadth}
                            onChange={(e) => setForm((f) => ({ ...f, breadth: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pkg-h">Height (cm)</Label>
                        <Input
                            id="pkg-h"
                            type="number"
                            min={0.1}
                            step="0.1"
                            value={form.height}
                            onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pkg-w">Max weight (grams, optional)</Label>
                        <Input
                            id="pkg-w"
                            type="number"
                            min={1}
                            step={1}
                            placeholder="Leave empty if unknown"
                            value={form.maxWeightGrams}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, maxWeightGrams: e.target.value }))
                            }
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                        <Label htmlFor="pkg-notes">Notes (optional)</Label>
                        <Textarea
                            id="pkg-notes"
                            rows={2}
                            placeholder="Internal reference, SKU of box, supplier…"
                            value={form.notes}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                        <Button type="submit" disabled={saving} className="min-w-[140px]">
                            {saving ? (
                                <>
                                    <Loader2 className="size-4 animate-spin mr-2" />
                                    Saving…
                                </>
                            ) : editingId ? (
                                "Save changes"
                            ) : (
                                "Create package"
                            )}
                        </Button>
                    </div>
                </form>

                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b">
                        <h2 className="text-lg font-medium">Your boxes</h2>
                    </div>
                    {loading ? (
                        <div className="p-10 flex justify-center text-muted-foreground">
                            <Loader2 className="size-8 animate-spin" />
                        </div>
                    ) : packages.length === 0 ? (
                        <p className="p-8 text-sm text-muted-foreground text-center">
                            No packages yet. Add one above.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>L × B × H (cm)</TableHead>
                                    <TableHead>Max wt (g)</TableHead>
                                    <TableHead className="hidden md:table-cell">Notes</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packages.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell className="tabular-nums text-sm">
                                            {row.length} × {row.breadth} × {row.height}
                                        </TableCell>
                                        <TableCell className="tabular-nums text-sm">
                                            {row.maxWeightGrams != null ? row.maxWeightGrams : "—"}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell max-w-[240px] truncate text-muted-foreground text-sm">
                                            {row.notes || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit ${row.name}`}
                                                    onClick={() => startEdit(row)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-rose-600 hover:text-rose-700"
                                                    aria-label={`Delete ${row.name}`}
                                                    onClick={() => setDeleteTarget(row)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <AlertDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent className="raleway">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete package?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget
                                ? `Remove “${deleteTarget.name}” from your saved box sizes? This cannot be undone.`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={confirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
