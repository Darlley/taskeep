"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type BoardCanvasProps = {
  onDoubleCreate: (point: { x: number; y: number }) => void;
  children?: React.ReactNode;
};

// Um canvas grande com rolagem em todas direções e fundo quadriculado
export function BoardCanvas({ onDoubleCreate, children }: BoardCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [size] = useState({ width: 12000, height: 12000 });
  const [panning, setPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);

  // Centraliza a viewport no meio do canvas ao montar
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = size.width / 2 - el.clientWidth / 2;
      el.scrollTop = size.height / 2 - el.clientHeight / 2;
    }
  }, [size.width, size.height]);

  const handleDouble = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = innerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // Coordenadas relativas ao canvas interno
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onDoubleCreate({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Pan com botão do meio ou Alt+Clique
    if (e.button === 1 || e.altKey) {
      setPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      // evita seleção de texto acidental
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panning || !panStart.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    el.scrollLeft -= dx;
    el.scrollTop -= dy;
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  const stopPan = () => {
    setPanning(false);
    panStart.current = null;
  };

  return (
    <div
      ref={scrollRef}
      className="relative h-[calc(100dvh-160px)] w-full overflow-auto rounded-md border border-neutral-200 dark:border-neutral-800"
    >
      <div
        ref={innerRef}
        onDoubleClick={handleDouble}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
        className={"relative " + (panning ? "cursor-grabbing" : "cursor-default")}
        style={{
          width: size.width,
          height: size.height,
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        {children}
      </div>
    </div>
  );
}