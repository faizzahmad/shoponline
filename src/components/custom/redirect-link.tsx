"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type RedirectLinkProps = {
  href: string;
  text: string;
};

export const RedirectLink = ({ href, text }: RedirectLinkProps) => {
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectUrl(
        `/${href}?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`
      );
    }
  }, [href]);

  if (!redirectUrl) return null; // Prevent premature rendering on server

  return (
    <Link href={redirectUrl} className="underline text-[#1B3F66]">
      {text}
    </Link>
  );
};
