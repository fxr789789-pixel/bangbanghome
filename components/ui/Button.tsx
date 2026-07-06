import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline";
}

export function Button({
  children,
  className = "",
  asChild = false,
  variant = "default",
  ...props
}: PropsWithChildren<ButtonProps>) {
  const baseClassName = variant === "outline"
    ? "inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
    : "inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90";

  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button className={`${baseClassName} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default Button;
