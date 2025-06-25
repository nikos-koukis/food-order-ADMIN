import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-2 border-foreground text-foreground",
        solid: "text-white",
        soft: "bg-opacity-15",
        outline: "border-2 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  color?: "default" | "primary" | "secondary" | "destructive" | "warning" | "success" | "orange" | "purple" | "pink" | "blue";
}

function Badge({ className, variant, color = "default", ...props }: BadgeProps) {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return variant === "solid" 
          ? "bg-primary text-primary-foreground"
          : variant === "soft"
          ? "bg-primary/20 text-primary"
          : "border-primary text-primary";
      case "secondary":
        return variant === "solid"
          ? "bg-secondary text-secondary-foreground"
          : variant === "soft"
          ? "bg-secondary/20 text-secondary"
          : "border-secondary text-secondary";
      case "destructive":
        return variant === "solid"
          ? "bg-red-500 text-white dark:bg-red-600"
          : variant === "soft"
          ? "bg-red-500/20 text-red-600 dark:text-red-400"
          : "border-red-500 text-red-500 dark:border-red-400 dark:text-red-400";
      case "warning":
        return variant === "solid"
          ? "bg-yellow-500 text-white dark:bg-yellow-600"
          : variant === "soft"
          ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
          : "border-yellow-500 text-yellow-500 dark:border-yellow-400 dark:text-yellow-400";
      case "success":
        return variant === "solid"
          ? "bg-green-500 text-white dark:bg-green-600"
          : variant === "soft"
          ? "bg-green-500/20 text-green-600 dark:text-green-400"
          : "border-green-500 text-green-500 dark:border-green-400 dark:text-green-400";
      case "orange":
        return variant === "solid"
          ? `bg-orange-500 text-white dark:bg-orange-600`
          : variant === "soft"
          ? `bg-orange-500/20 text-orange-600 dark:text-orange-400`
          : `border-orange-500 text-orange-500 dark:border-orange-400 dark:text-orange-400`;
      case "purple":
        return variant === "solid"
          ? `bg-purple-500 text-white dark:bg-purple-600`
          : variant === "soft"
          ? `bg-purple-500/20 text-purple-600 dark:text-purple-400`
          : `border-purple-500 text-purple-500 dark:border-purple-400 dark:text-purple-400`;
      case "pink":
        return variant === "solid"
          ? `bg-pink-500 text-white dark:bg-pink-600`
          : variant === "soft"
          ? `bg-pink-500/20 text-pink-600 dark:text-pink-400`
          : `border-pink-500 text-pink-500 dark:border-pink-400 dark:text-pink-400`;
      case "blue":
        return variant === "solid"
          ? `bg-blue-500 text-white dark:bg-blue-600`
          : variant === "soft"
          ? `bg-blue-500/20 text-blue-600 dark:text-blue-400`
          : `border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400`;
      default:
        return "";
    }
  };

  return (
    <div 
      className={cn(badgeVariants({ variant }), getColorClasses(), className)} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }