"use client";

import React, { useRef } from "react";

type BoardCanvasProps = {
  onDoubleCreate: (point: { x: number; y: number }) => void;
  children?: React.ReactNode;
};

// Um canvas grande com rolagem em todas direções e fundo quadriculado
export function BoardCanvas({ onDoubleCreate, children }: BoardCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleDouble = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = innerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // Coordenadas relativas ao canvas interno
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onDoubleCreate({ x, y });
  };

  // Desabilita panning e rolagem; mantém apenas duplo clique

  return (
    <div
      ref={scrollRef}
      className="relative h-[calc(100dvh-160px)] w-full overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800"
    >
      <div
        ref={innerRef}
        onDoubleClick={handleDouble}
        className={"relative cursor-default"}
        style={{
          width: "100%",
          height: "100%",
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