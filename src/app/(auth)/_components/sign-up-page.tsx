"use client";
import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SignUpSkeleton } from "./auth-skelton";

export const SignUnPage = () => {
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
                isloading ? (<SignUpSkeleton />) : (<SignUp afterSignUpUrl={'/'} />)
            }

        </>
    )
}