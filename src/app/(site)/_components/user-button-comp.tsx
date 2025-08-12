"use client";
import { UserButton } from "@clerk/nextjs"

export const UserButtonComp =  () => {
     const userButtonAppearance = {
        elements: {
            userButtonAvatarBox: "w-10 h-10",

        },
    };
    return(
<UserButton appearance={userButtonAppearance}/>
    )
}