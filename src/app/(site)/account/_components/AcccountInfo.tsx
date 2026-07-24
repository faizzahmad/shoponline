
import { getlatestOrdersbyUserEmail } from "@/actions/invoive";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";

export const AccountInfo = async() => {
 const user = await currentUser();
 const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? "";
 const orders = email ? await getlatestOrdersbyUserEmail(email) : [];
      const userButtonAppearance = {
        elements: {
            userButtonAvatarBox: "w-10 h-10",

        },
    };
return (
    <div className="lg:p-20 md:p-10 p-5 bg-gray-50">
      <div className="w-full flex justify-between">
        <div>
            <h1 className="text-lg font-bold raleway sm:text-xl md:text-2xl lg:text-3xl">Account Information</h1>
            <p className="text-[#0F2744] exo sm:text-xs text-[10px] font-[600] mt-2">Note : 
                To change your name or email, use the user menu (top right) and open &quot;Manage account&quot; in Clerk.
            </p>
        </div>
       <UserButton appearance={userButtonAppearance} />
      </div>

      <div className="bg-white border rounded-lg mt-10 px-10 py-5 shadow-sm">
        <h5 className="text-base font-semibold raleway sm:text-lg md:text-xl lg:text-2xl">
            Your Order History.
        </h5>

        <div className="mt-8 grid grid-cols-1 gap-4">
{
    orders.map((order) => (
          <div className="w-full bg-white p-5 rounded-lg shadow-sm border flex gap-4 justify-between items-center flex-wrap" key={order._id}>
              <div className="md:flex gap-10">
                  <div>
                    <h6 className="md:text-lg text-base md:font-semibold font-[500] raleway">Order ID:</h6>
                    <p className="text-gray-600 exo font-[300]">#{order._id}</p>
                </div>
                <div>
                    <h6 className="md:text-lg text-base md:font-semibold font-[500] raleway">Order Date:</h6>
                    <p className="text-gray-600 exo font-[300]">
                        {
                            format(new Date(order.orderDateTime), 'dd MMMM yyyy')
                        }
                    </p>
                </div>
                <div>
                    <h6 className="md:text-lg text-base md:font-semibold font-[500] raleway">Total Amount:</h6>
                    <p className="text-gray-600 font-[300] exo">
                       {"\u20B9"} {order.totalAmount}
                    </p>
                </div>
              </div>
              <div>
                <Link href={`/invoice/${order._id}`} target="_blank">
                <Button variant={'link'} className="raleway text-lg text-[#0F2744] md:px-0">
                    View Invoice
                </Button>
                </Link>
              </div>
            </div>
    ))}

          


        </div>
      </div>
    </div>
)
}
