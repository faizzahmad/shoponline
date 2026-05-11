import { currentUser } from "@clerk/nextjs/server";
import { BottomNavigationClient } from "./bottom-navigation-client";

export const BottomNavigation = async () => {
    const user = await currentUser();
    return <BottomNavigationClient isSignedIn={!!user} />;
};
