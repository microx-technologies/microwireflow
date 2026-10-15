import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sketchy text-sm font-base ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX-half hover:translate-y-boxShadowY-half hover:shadow-shadow-half active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none",
        noShadow: "text-main-foreground bg-main border-2 border-border",
        neutral:
          "bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-boxShadowX-half hover:translate-y-boxShadowY-half hover:shadow-shadow-half active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none",
        reverse:
          "text-main-foreground bg-main border-2 border-border hover:translate-x-reverseBoxShadowX-half hover:translate-y-reverseBoxShadowY-half hover:shadow-shadow-half active:translate-x-reverseBoxShadowX active:translate-y-reverseBoxShadowY active:shadow-shadow",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-8 gap-1.5 px-2.5 text-xs rounded-sketchy-sm [&_svg]:size-3.5",
        sm: "h-9 px-3",
        lg: "h-11 px-8 rounded-sketchy-lg",
        icon: "size-10",
        "icon-xs": "size-8 rounded-sketchy-sm [&_svg]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-11 rounded-sketchy-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
