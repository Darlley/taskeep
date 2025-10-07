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
  onDoubleClick?: (id: string, e: React.MouseEvent) => void;
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
  onDoubleClick,
  onDragDelta,
  onDragEnd,
}: TaskNoteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Permite iniciar seleção em nível superior e pan com Alt/botão do meio
    if (e.shiftKey || e.altKey || e.button === 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    setStart({ x: e.clientX, y: e.clientY });
    // Marca que houve movimento para diferenciar de um clique simples
    if (Math.abs(dx) + Math.abs(dy) > 2) setHasDragged(true);
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
      onClick={(e) => {
        // Se houve arraste, suprime o clique para não togglar seleção
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(id, e);
      }}
      onDoubleClick={(e) => onDoubleClick?.(id, e)}
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