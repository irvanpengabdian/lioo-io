import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "nav" | "outline";
  icon?: string;
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", icon, isLoading, children, ...props }, ref) => {
    let baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none active:scale-95 ";
    
    // Size variants
    switch (size) {
      case "sm": baseStyles += "px-4 py-2 text-xs rounded-full "; break;
      case "md": baseStyles += "px-6 py-3 text-sm rounded-full "; break;
      case "lg": baseStyles += "px-10 py-4 text-base rounded-full "; break;
      case "icon": baseStyles += "p-2 rounded-full flex-shrink-0 "; break; // Circular icon
    }

    // Color variants
    switch (variant) {
      case "primary":
        baseStyles += "bg-primary text-white shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] ";
        break;
      case "secondary":
        baseStyles += "bg-surface-container-highest text-on-surface hover:bg-outline-variant/70 transition-colors ";
        break;
      case "outline":
        baseStyles += "bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors ";
        break;
      case "ghost":
        baseStyles += "text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors ";
        break;
      case "nav":
        baseStyles += "w-full justify-start px-4 py-3 rounded-xl hover:text-primary hover:bg-white/50 text-[#43493E] font-medium ";
        // Hapus padding bulat spesifik
        baseStyles = baseStyles.replace(/px-\d+ py-\d+ text-[a-z]+ rounded-full/, "");
        break;
    }

    return (
      <button ref={ref} className={`${baseStyles} ${className}`} {...props}>
        {icon && !isLoading && <span className="material-symbols-outlined text-[1.2em]">{icon}</span>}
        {isLoading && <span className="material-symbols-outlined animate-spin text-[1.2em]">progress_activity</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
