"use client"
import * as React from "react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  wrapClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapClassName, type, icon, ...props }, ref) => {

    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === "password";

    const handleTogglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={cn("grid relative w-full", wrapClassName)}>
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          type={isPasswordType ? (showPassword ? "text" : "password") : type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            icon ? "pl-10" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {isPasswordType && <span
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer"
          onClick={handleTogglePasswordVisibility}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
