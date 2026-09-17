import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  padded?: boolean;
};

export function Card({ children, className, hover = false, padded = true, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "app-surface app-border rounded-2xl border shadow-md",
        padded && "p-4 md:p-5",
        hover && "card-hover",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
