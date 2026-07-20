"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchData } from "@/utils/apiCall";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/custom/brand-logo";

interface LoginRespose {
 message: string;
 token : string;
}

export const Login = () => {
    const [loader, setLoader] = useState(false);
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoader(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");
        try {
            const response = await fetchData<LoginRespose>(`admin-login?email=${email}&password=${password}`);
            if (response) {
                toast.success("Login successful", {
                    position: "bottom-center",
                });
                router.push('/admin/dashboard');

            }
        } catch (err) {
            toast.error("Invalid email or password", {
                description: "Please check your credentials and try again.",
                duration: 3000,
                position: "bottom-center",
            });
            console.log(err);

        } finally {
            setLoader(false);
        }

    }
    return (
        <form onSubmit={handleSubmit} >
            <div className=" mb-10 flex justify-center">
                <BrandLogo width={150} className="w-[140px]" />
            </div>
            <Card className="w-[400px] raleway">
                <CardHeader>
                    <CardTitle className="text-center text-4xl">Log-in</CardTitle>
                    <CardDescription className="text-center">
                        Login to your admin account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email id</Label>
                            <Input id="email" type="email" name="email" placeholder="Enter your email id" required />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Password</Label>
                            <Input id="password" name="password" type="password" placeholder="Enter your password" required />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">

                    <Button type="submit" disabled={loader} className="w-full text-[1rem] font-semibold flex items-center justify-center">Submit
                        {loader && <Loader className="animate-spin" />}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}