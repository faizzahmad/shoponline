"use client";
import Link from "next/link"

interface RedirectLinkProps {
    text : string;
    href : string;
}

export const RedirectLink = ({text,href} : RedirectLinkProps) => {
    return (
        <Link href={
                    `/${href}?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`
                   } className=' underline text-rose-500' >{text}</Link>
    )
}