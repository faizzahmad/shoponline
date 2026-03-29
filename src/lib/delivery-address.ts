/** Parts used when creating or persisting an order delivery address */
export type DeliveryAddressParts = {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
};

/** Single formatted block for invoices and legacy `deliveryAddress` */
export function formatDeliveryAddress(parts: DeliveryAddressParts): string {
    const street = parts.streetAddress.trim();
    const locality = [parts.city.trim(), parts.state.trim(), parts.zipCode.trim()]
        .filter(Boolean)
        .join(", ");
    return [street, locality].filter(Boolean).join("\n");
}

/** Returns an error message string, or `null` if valid */
export function validateDeliveryAddressParts(parts: DeliveryAddressParts): string | null {
    if (!parts.streetAddress?.trim()) {
        return "Please enter your street or flat address.";
    }
    if (parts.streetAddress.trim().length < 10) {
        return "Please enter a complete street address (at least 10 characters).";
    }
    if (!parts.city?.trim()) {
        return "Please enter your city.";
    }
    if (!parts.state?.trim()) {
        return "Please enter your state.";
    }
    if (!parts.zipCode?.trim()) {
        return "Please enter your PIN or ZIP code.";
    }
    if (parts.zipCode.trim().length < 4) {
        return "Please enter a valid PIN or ZIP code.";
    }
    return null;
}
