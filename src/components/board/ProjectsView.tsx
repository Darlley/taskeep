"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BoardCanvas } from "./BoardCanvas";
import { TaskNote } from "./TaskNote";
import type { Project, Task } from "@/lib/boards";
import { createTask, fetchProjects, fetchTasks, updateTaskPosition, deleteTask } from "@/lib/boards";
import { Button } from "@/components/ui/button";

type ProjectsViewProps = {
  teamId?: string;
};

export function ProjectsView({ teamId }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [dragBuffer, setDragBuffer] = useState<Record<string, { x: number; y: number }>>({});
  const [zIndexCounter, setZIndexCounter] = useState(1);
  const [marquee, setMarquee] = useState<null | { x: number; y: number; w: number; h: number }>(null);

  useEffect(() => {
    (async () => {
      const prj = await fetchProjects(teamId);
      setProjects(prj);
      const obj: Record<string, Task[]> = {};
      for (const p of prj) {
        obj[p.id] = await fetchTasks(p.id);
      }
      setTasks(obj);
    })();
  }, [teamId]);

  const allTasksFlat = useMemo(() => {
    const list: Array<{ task: Task; project: Project }> = [];
    for (const project of projects) {
      for (const t of tasks[project.id] ?? []) list.push({ task: t, project });
    }
    return list;
  }, [projects, tasks]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    setSelectedTaskIds((prev) => {
      const copy = new Set(prev);
      if (e.shiftKey) {
        if (copy.has(id)) copy.delete(id);
        else copy.add(id);
      } else {
        if (copy.size === 1 && copy.has(id)) copy.clear();
        else {
          copy.clear();
          copy.add(id);
        }
      }
      return copy;
    });
  };

  const applyDelta = (id: string, dx: number, dy: number) => {
    const movingIds = selectedTaskIds.size > 0 && selectedTaskIds.has(id) ? Array.from(selectedTaskIds) : [id];
    setTasks((prev) => {
      const next = { ...prev };
      for (const pid of Object.keys(next)) {
        next[pid] = next[pid].map((t) => {
          if (!movingIds.includes(t.id)) return t;
          return { ...t, position_x: t.position_x + dx, position_y: t.position_y + dy };
        });
      }
      return next;
    });
    setDragBuffer((prev) => {
      const nb = { ...prev };
      for (const mid of movingIds) {
        const cur = nb[mid] ?? { x: 0, y: 0 };
        nb[mid] = { x: cur.x + dx, y: cur.y + dy };
      }
      return nb;
    });
  };

  const persistMoved = async (id: string) => {
    const movingIds = selectedTaskIds.size > 0 && selectedTaskIds.has(id) ? Array.from(selectedTaskIds) : [id];
    const list = allTasksFlat.filter(({ task }) => movingIds.includes(task.id));
    for (const { task } of list) {
      await updateTaskPosition(task.id, {
        position_x: task.position_x,
        position_y: task.position_y,
        z_index: zIndexCounter,
      });
    }
    setZIndexCounter((z) => z + 1);
    setDragBuffer({});
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedTaskIds);
    for (const id of ids) {
      await deleteTask(id);
    }
    // Remove localmente das listas
    setTasks((prev) => {
      const next: Record<string, Task[]> = {};
      for (const key of Object.keys(prev)) {
        next[key] = (prev[key] ?? []).filter((t) => !selectedTaskIds.has(t.id));
      }
      return next;
    });
    setSelectedTaskIds(new Set());
  };

  const handleCreateAt = async ({ x, y }: { x: number; y: number }) => {
    // Detecta projeto alvo baseado na área (600x400) a partir de position_x/y do projeto
    const target = projects.find((p) => {
      const px = p.position_x ?? 0;
      const py = p.position_y ?? 0;
      return x >= px && x <= px + 600 && y >= py && y <= py + 400;
    }) ?? projects[0];
    if (!target) return;
    const noteX = x - (target.position_x ?? 0);
    const noteY = y - (target.position_y ?? 0);
    const created = await createTask({
      project_id: target.id,
      title: "Nota",
      content: "",
      position_x: noteX,
      position_y: noteY,
      width: 200,
      height: 150,
      color: "#fef3c7",
      z_index: zIndexCounter,
    });
    if (created) {
      setTasks((prev) => ({
        ...prev,
        [target.id]: [...(prev[target.id] ?? []), created],
      }));
    }
  };

  return (
    <>
      {selectedTaskIds.size > 0 && (
        <div className="mb-2 flex items-center gap-3 text-sm">
          <span className="text-neutral-700">{selectedTaskIds.size} nota(s) selecionada(s)</span>
          <Button variant="destructive" onClick={handleDeleteSelected}>Excluir</Button>
        </div>
      )}
    <BoardCanvas onDoubleCreate={handleCreateAt}>
      {/* Projetos como containers */}
      {projects.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-lg border shadow-sm"
          style={{
            left: p.position_x ?? 0,
            top: p.position_y ?? 0,
            width: 600,
            height: 400,
            background: "white",
            borderColor: p.color ?? "#ddd",
          }}
        >
          <div
            className="px-3 py-2 text-sm font-medium"
            style={{ color: p.color ?? "#6366f1" }}
          >
            {p.name}
          </div>

          {/* Tasks dentro do container */}
          {(tasks[p.id] ?? []).map((t) => (
            <TaskNote
              key={t.id}
              id={t.id}
              x={(p.position_x ?? 0) + t.position_x}
              y={(p.position_y ?? 0) + t.position_y}
              width={t.width}
              height={t.height}
              color={t.color}
              title={t.title}
              content={t.content}
              selected={selectedTaskIds.has(t.id)}
              onClick={toggleSelect}
              onDragDelta={(id, dx, dy) => applyDelta(id, dx, dy)}
              onDragEnd={(id) => persistMoved(id)}
            />)
          )}
        </div>
      ))}

      {/* Marquee selection: segure Shift e arraste */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: "auto" }}
        onMouseDown={(e) => {
          if (!e.shiftKey) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const startX = e.clientX - rect.left;
          const startY = e.clientY - rect.top;
          setMarquee({ x: startX, y: startY, w: 0, h: 0 });
        }}
        onMouseMove={(e) => {
          if (!marquee) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const curX = e.clientX - rect.left;
          const curY = e.clientY - rect.top;
          const w = curX - marquee.x;
          const h = curY - marquee.y;
          setMarquee({ ...marquee, w, h });
        }}
        onMouseUp={() => {
          if (!marquee) return;
          // normaliza para limites positivos
          const mx = Math.min(marquee.x, marquee.x + marquee.w);
          const my = Math.min(marquee.y, marquee.y + marquee.h);
          const mw = Math.abs(marquee.w);
          const mh = Math.abs(marquee.h);
          const selected = new Set<string>();
          for (const { task, project } of allTasksFlat) {
            const ax = (project.position_x ?? 0) + task.position_x;
            const ay = (project.position_y ?? 0) + task.position_y;
            const aw = task.width ?? 200;
            const ah = task.height ?? 150;
            const intersects = ax < mx + mw && ax + aw > mx && ay < my + mh && ay + ah > my;
            if (intersects) selected.add(task.id);
          }
          setSelectedTaskIds(selected);
          setMarquee(null);
        }}
      >
        {marquee && (
          <div
            className="absolute border-2 border-blue-500/70 bg-blue-500/10"
            style={{
              left: Math.min(marquee.x, marquee.x + marquee.w),
              top: Math.min(marquee.y, marquee.y + marquee.h),
              width: Math.abs(marquee.w),
              height: Math.abs(marquee.h),
            }}
          />
        )}
      </div>
    </BoardCanvas>
    </>
  );
}