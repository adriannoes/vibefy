import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-sm",
        success: "border-transparent bg-success text-success-foreground hover:bg-success-hover shadow-sm",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning-hover shadow-sm",
        info: "border-transparent bg-info text-info-foreground hover:bg-info-hover shadow-sm",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        ghost: "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
