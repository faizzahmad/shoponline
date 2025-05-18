import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesTab } from "./_components/categories-tab";
import { verifyAuth } from "@/utils/verifyToken";
import { redirect } from "next/navigation";

const Categories = async () => {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) redirect('/admin')
    return (
        <Tabs defaultValue="category" className="w-full exo p-3">
            <TabsList className="w-full flex h-[60px] bg-transparent gap-3">
                <TabsTrigger value="category" className="w-[50%] py-3 text-lg  data-[state=active]:bg-gray-50 border rounded data-[state=active]:shadow-none bg-white">Category</TabsTrigger>
                <TabsTrigger value="subcategory" className="w-[50%] py-3 text-lg  data-[state=active]:bg-gray-50 border rounded data-[state=active]:shadow-none bg-white">Sub Category</TabsTrigger>
            </TabsList>
            <TabsContent value="category">
                <CategoriesTab />
            </TabsContent>
            <TabsContent value="subcategory">subcategory</TabsContent>
        </Tabs>
    );
}

export default Categories;