
import { getlatestOrdersbyUserPhone } from "@/actions/invoive";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";

export const AccountInfo = async() => {
 const user = await currentUser();
 const orders = await getlatestOrdersbyUserPhone(user?.phoneNumbers[0]?.phoneNumber || "");
 console.log({orders});
      const userButtonAppearance = {
        elements: {
            userButtonAvatarBox: "w-10 h-10",

        },
    };
return (
    <div className="lg:p-20 md:p-10 p-5 bg-gray-50">
      <div className="w-full flex justify-between">
        <div>
            <h1 className="lg:text-3xl md:text-2xl text-xl font-bold raleway">Account Information</h1>
            <p className="text-rose-600 exo sm:text-xs text-[10px] font-[600] mt-2">Note : 
                To chnage your phone no and name click in the user button on the top right corner and then click on &quot;Profile&quot; to edit your details
            </p>
        </div>
       <UserButton appearance={userButtonAppearance} />
      </div>

      <div className="bg-white border rounded-lg mt-10 px-10 py-5 shadow-sm">
        <h5 className="lg:text-2xl md:text-xl text-lg font-semibold raleway">
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
                <Button variant={'link'} className="raleway text-lg text-red-600 md:px-0">
                    View Invoice
                </Button>
                </Link>
              </div>
            </div>
    ))
}

          


        </div>
      </div>
    </div>
)
}