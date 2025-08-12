"use client";
import { SignUp, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SignUpSkeleton } from "./auth-skelton";
import { useIsChanged } from "@/store/use-ischnaged";

export const SignUnPage = () => {
    const [isloading, setIsLoading] = useState(false);
      const {setIsChanged,isChanged} = useIsChanged((state) => state);
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [])

     const { isSignedIn } = useAuth(); // ← Clerk auth hook

  

useEffect(() => {
  if (isSignedIn) {
    setIsChanged(!isChanged);
  }
}, [isSignedIn, isChanged, setIsChanged]);

    return (
        <>
            {
                isloading ? (<SignUpSkeleton />) : (<SignUp afterSignUpUrl={'/'} />)
            }

        </>
    )
}