import { ProductCard } from "@/components/custom/product-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { demoBestSellers, sortItems } from "@/lib/staticData";

export const ShopPage = () => {
    return (
        <div className="w-full">
            <div className="w-full flex">
                <div className=" ms-auto text-neutral-800 exo">
                    <Select>
                        <SelectTrigger className="focus:ring-0 border-gray-500 w-56">
                            <SelectValue placeholder="Sort by : Recommended" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recommended">Sort by : Recommended</SelectItem>
                           {
                            sortItems.map((item) => (
                                 <SelectItem key={item.value} value={item.value}>Sort by : {item.name}</SelectItem>
                            ))
                           }
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-10 sm:grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-y-5 gap-x-5 ">
                 {
                            demoBestSellers.map((item,index) => (
                                 <ProductCard
                                      key={index}
                                        images={item.images}
                                        id={item.id}
                                        title={item.title}
                                        price={item.price}
                                        discountedPrice={item.discountedPrice}
                                        imageContainerClassName="relative md:h-[200px] h-[150px] w-full"
                                    />
                            ))

                        }

            </div>
        </div>
    );
}