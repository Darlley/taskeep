"use client";

import React, { useRef, useState } from "react";

type TaskNoteProps = {
  id: string;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  color?: string | null;
  title: string;
  content?: string | null;
  selected?: boolean;
  onClick?: (id: string, e: React.MouseEvent) => void;
  onDragDelta?: (id: string, dx: number, dy: number) => void;
  onDragEnd?: (id: string) => void;
};

export function TaskNote({
  id,
  x,
  y,
  width = 200,
  height = 150,
  color = "#fef3c7",
  title,
  content,
  selected = false,
  onClick,
  onDragDelta,
  onDragEnd,
}: TaskNoteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.shiftKey) return; // permite iniciar seleção em nível superior
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    setStart({ x: e.clientX, y: e.clientY });
    onDragDelta?.(id, dx, dy);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    setStart(null);
    onDragEnd?.(id);
  };

  const border = selected ? "2px solid #3b82f6" : "1px solid rgba(0,0,0,0.1)";

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(e) => onClick?.(id, e)}
      className="absolute rounded-md shadow-sm cursor-move select-none"
      style={{ left: x, top: y, width: width ?? 200, height: height ?? 150, background: color ?? "#fef3c7", border }}
    >
      <div className="px-2 py-1 text-xs font-medium text-neutral-700">
        {title}
      </div>
      <div className="px-2 text-[12px] text-neutral-700/80 leading-snug overflow-hidden">
        {content ?? ""}
      </div>
    </div>
  );
}