"use client";
import React from "react";

interface DeltaBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
}

export default function DeltaBadge({ text, className = "", ...rest }: DeltaBadgeProps) {
  return (
    <div
      className={`absolute rounded-2xl bg-gradient-to-r from-[--brand-sky]/10 to-[--brand-blue]/10 p-3 text-center text-xs text-[--brand-midnight] shadow-lg animate-floaty border border-[--brand-blue]/10 ${className}`}
      aria-hidden
      {...rest}
    >
      {text}
    </div>
  );
}