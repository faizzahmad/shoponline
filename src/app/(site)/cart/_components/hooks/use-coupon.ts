import { useQueryState,parseAsString } from 'nuqs';

export const useCoupon = () => {
    const [couponCode, setCouponCode] = useQueryState(
        'couponCode',
        parseAsString.withDefault('').withOptions({ clearOnDefault: true })
    );

    // Function to reset coupon code
    const resetCouponCode = () => {
        setCouponCode('');
    };
    

    return {
        couponCode,
        setCouponCode,
        resetCouponCode,
    };
}