"use client";
import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SignInSkeleton } from "./auth-skelton";

export const SignInPage = () => {
    const [isloading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [])
    
    return (
        <>
            {
                isloading ? (<SignInSkeleton />) : (<SignIn afterSignUpUrl={'/'} />)
            }

        </>
    )
}