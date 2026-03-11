import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const linkVariants = cva(
  "inline-flex w-fit items-center gap-1 text-sm transition-colors transition-transform  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "text-muted-foreground hover:text-primary focus:text-primary active:text-primary/60 active:scale-80",
        primary:
          "text-primary hover:text-primary/80",
        foreground:
          "text-foreground hover:text-foreground/80 underline underline-offset-4",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 -mx-2",
        nav:
          "hover:text-primary font-medium rounded-md px-3 py-2 focus:text-primary active:text-primary/60 active:scale-80",
        navMobile:
          "hover:bg-accent active:text-primary active:scale-80 font-medium rounded-md px-3 py-3 focus:text-primary w-9/12",
      },
      size: {
        default: "text-sm",
        lg: "text-base",
        xs: "text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function CustomLink({
  className,
  variant,
  size,
  asChild = false,
  external = false,
  ...props
}: React.ComponentProps<"a"> &
  VariantProps<typeof linkVariants> & {
    asChild?: boolean
    external?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="link"
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className={cn(linkVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { CustomLink, linkVariants }
