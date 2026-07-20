import type { ReactNode } from "react";

type SiteContentShellProps = {
  children: ReactNode;
};

export function SiteContentShell({ children }: SiteContentShellProps) {
  return (
    <div className="w-full bg-[#FAFAF9] min-h-[50vh]">
      <article className="mx-auto max-w-4xl px-5 py-8 text-sm leading-relaxed text-neutral-800 sm:py-10 md:py-14 md:text-base pb-24 md:pb-20">
        {children}
      </article>
    </div>
  );
}
