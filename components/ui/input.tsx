"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-semibold text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200",
            "placeholder:text-slate-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            error && "border-red-400 focus-visible:ring-red-300/40 focus-visible:border-red-400",
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
