"use client";
import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

export const useProductAdmin = () => {
    const [descriptionPage, setDescriptionPage] = useQueryState(
        "descriptionPage",
        parseAsBoolean.withDefault(false)
    );

    const [editProductId, setEditProductId] = useQueryState(
        "edit",
        parseAsString.withOptions({ clearOnDefault: true })
    );

    return {
        descriptionPage,
        setDescriptionPage,
        editProductId,
        setEditProductId,
    };
};
