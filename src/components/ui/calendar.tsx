"use client";

import React from "react";

type CalendarProps = {
  mode?: "single";
  selected?: Date;
  onSelect?: (date?: Date) => void;
  className?: string;
};

// Minimal Calendar wrapper compatible with shadcn API, using native input date
export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const format = (d: Date) => d.toISOString().slice(0, 10);
  return (
    <input
      type="date"
      value={selected ? format(selected) : ""}
      onChange={(e) => {
        const v = e.target.value;
        if (!v) return onSelect?.(undefined);
        // Parse as local date
        const d = new Date(v + "T00:00:00");
        onSelect?.(d);
      }}
      className={"w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 " + (className ?? "")}
    />
  );
}