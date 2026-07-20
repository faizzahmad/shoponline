import type { Metadata } from "next";
import { AccountInfo } from "./_components/AcccountInfo";

export const metadata: Metadata = {
    title: "My account",
    description: "Manage your ShopOnline profile and order history.",
    robots: { index: false, follow: false },
};

const AccountPage = async () => {

    return ( 
        <div className="w-full">
            <AccountInfo/>
        </div>
     );
}
 
export default AccountPage;