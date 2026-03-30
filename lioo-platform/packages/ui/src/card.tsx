import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "disabled" | "elevated";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    let baseStyles = "bg-surface-container-lowest rounded-lg border border-transparent ";
    
    switch (variant) {
      case "default":
        baseStyles += "shadow-sm border-outline-variant/20 p-6 ";
        break;
      case "elevated":
         baseStyles += "shadow-xl shadow-on-surface/5 p-6 ";
         break;
      case "interactive":
        baseStyles += "group hover:border-primary/10 hover:shadow-xl hover:shadow-on-surface/5 transition-all duration-300 p-5 ";
        break;
      case "disabled":
        baseStyles += "opacity-80 hover:opacity-100 transition-all duration-300 p-5 ";
        break;
    }

    return (
      <div ref={ref} className={`${baseStyles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
