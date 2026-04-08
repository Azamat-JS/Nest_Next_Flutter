'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // optional: you can add custom props here if needed
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, defaultValue, ...props }, ref) => {
    // If a value is passed, treat as controlled, else uncontrolled
    const isControlled = value !== undefined

    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={isControlled ? value : undefined}
        defaultValue={!isControlled ? defaultValue : undefined}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"