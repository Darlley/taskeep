import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "sm";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
      default: "bg-white text-neutral-900 hover:bg-neutral-200",
      outline: "border border-white/10 bg-transparent text-white hover:border-white/20",
    } as const;
    const sizes = {
      default: "px-4 py-2.5",
      sm: "px-3 py-2 text-xs",
    } as const;

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";