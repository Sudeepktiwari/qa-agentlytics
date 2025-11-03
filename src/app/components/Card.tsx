"use client";
import React, { ElementType } from "react";

type CardVariant = "default" | "gradient" | "emphasis";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  loading?: boolean;
  overflowVisible?: boolean;
  as?: ElementType;
  ariaLabel?: string;
}

export default function Card({
  variant = "default",
  loading = false,
  overflowVisible = false,
  as,
  ariaLabel,
  className = "",
  children,
  ...rest
}: CardProps) {
  const Element = (as ?? "div") as ElementType;

  const base =
    "relative rounded-2xl border shadow-sm transition-all card-hover " +
    (overflowVisible ? "overflow-visible " : "overflow-hidden ");

  const variants: Record<CardVariant, string> = {
    default:
      "bg-white border-[color:var(--border-subtle)]",
    gradient:
      "bg-gradient-to-br from-white via-[--brand-sky]/10 to-[--brand-blue]/10 border-[--brand-blue]/12",
    emphasis:
      "bg-[--surface] border-[--brand-blue]/12 shadow-card",
  };

  const loadingSkeleton = (
    <div className="animate-shimmer">
      <div className="h-4 w-32 rounded bg-[--surface-alt]" />
      <div className="mt-3 h-3 w-full rounded bg-[--surface-alt]" />
      <div className="mt-2 h-3 w-2/3 rounded bg-[--surface-alt]" />
    </div>
  );

  return (
    <Element
      role="article"
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? loadingSkeleton : children}
    </Element>
  );
}