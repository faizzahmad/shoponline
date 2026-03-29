import type { ReactNode } from "react";

type SiteContentShellProps = {
  children: ReactNode;
};

export function SiteContentShell({ children }: SiteContentShellProps) {
  return (
    <div className="w-full bg-indigo-50 min-h-[50vh]">
      <article className="max-w-4xl mx-auto px-5 py-10 md:py-14 pb-24 md:pb-20">
        {children}
      </article>
    </div>
  );
}
