"use client";
import React from "react";

interface TagChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "blue" | "emerald" | "neutral";
}

export default function TagChip({
  children,
  variant = "blue",
  className = "",
  ...rest
}: TagChipProps) {
  const variants = {
    blue:
      "border-blue-200 bg-blue-50 text-blue-700",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    neutral:
      "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] ${variants[variant]} ${className}`}
      {...rest}
    >
      <span className="size-1.5 rounded-full bg-current/60" /> {children}
    </span>
  );
}