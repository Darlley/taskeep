"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BoardCanvas } from "./BoardCanvas";
import { TaskNote } from "./TaskNote";
import type { Project, Task, Team } from "@/lib/boards";
import { createTask, fetchProjects, fetchTasks, updateTaskPosition, deleteTask, fetchTeams, createProject, updateTask } from "@/lib/boards";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

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
  // Pan/Offset do canvas
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState<null | { x: number; y: number }>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState<{ title: string; content: string; color: string; dueDate: Date | null; project_id: string }>({ title: "", content: "", color: "#fef3c7", dueDate: null, project_id: "" });
  const [newTaskCtx, setNewTaskCtx] = useState<null | { project: Project | null; noteX?: number; noteY?: number; rawX?: number; rawY?: number }>(null);
  // Visualização/Edição de task existente
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState<null | Task>(null);
  // Criação de projeto (essencial: equipe e nome)
  const [teams, setTeams] = useState<Team[]>([]);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createProjectForm, setCreateProjectForm] = useState<{ team_id: string; name: string }>({ team_id: "", name: "" });
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Garante que buscamos projetos do time correto; se não houver teamId, usa o primeiro time disponível
        const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        let effectiveTeamId = (teamId ?? "").trim();
        // Se veio algum id inválido (ex.: "team-1"), ignoramos e buscamos o primeiro válido
        if (effectiveTeamId && !isUuid(effectiveTeamId)) {
          effectiveTeamId = "";
        }
        if (!effectiveTeamId) {
          const teams = await fetchTeams();
          effectiveTeamId = teams[0]?.id ?? "";
        }
        // Se ainda não temos um teamId efetivo, não carregue projetos "globais" para evitar mistura de times
        if (!effectiveTeamId) {
          setProjects([]);
          setTasks({});
          return;
        }
        const prj = await fetchProjects(effectiveTeamId);
        setProjects(prj);
        const obj: Record<string, Task[]> = {};
        for (const p of prj) {
          obj[p.id] = await fetchTasks(p.id);
        }
        setTasks(obj);
        // Carrega lista de equipes para o formulário de criação de projeto
        const t = await fetchTeams();
        setTeams(t);
      } catch (err) {
        console.error("Erro ao carregar projetos/tarefas:", err);
        setProjects([]);
        setTasks({});
      }
    })();
  }, [teamId]);

  // Garante pré-seleção de projeto quando o modal abre e a lista é carregada
  useEffect(() => {
    if (newTaskOpen && !newTaskForm.project_id && projects.length > 0) {
      setNewTaskForm((prev) => ({ ...prev, project_id: projects[0].id }));
    }
  }, [projects, newTaskOpen, newTaskForm.project_id]);

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
      // Multi-seleção com Shift, Ctrl ou Cmd
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        if (copy.has(id)) copy.delete(id);
        else copy.add(id);
      } else {
        // Seleção única por clique simples: sempre selecionar, sem alternar para des-seleção
        copy.clear();
        copy.add(id);
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
    // Agora o board mostra apenas tasks; o projeto é escolhido no modal
    setNewTaskCtx({ project: null, rawX: x, rawY: y });
    setNewTaskForm({ title: "", content: "", color: "#fef3c7", dueDate: null, project_id: projects[0]?.id ?? "" });
    setNewTaskOpen(true);
  };

  // Criação de projeto: prepara valores padrão ao abrir
  useEffect(() => {
    if (createProjectOpen) {
      const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      const effective = (() => {
        const incoming = (teamId ?? "").trim();
        if (incoming && isUuid(incoming)) return incoming;
        return teams[0]?.id ?? "";
      })();
      setCreateProjectForm((prev) => ({ ...prev, team_id: prev.team_id || effective }));
    }
  }, [createProjectOpen, teams, teamId]);

  const submitCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = createProjectForm.team_id.trim();
    const name = createProjectForm.name.trim();
    if (!tid || !name) return;
    setCreatingProject(true);
    try {
      const created = await createProject({ team_id: tid, name });
      if (created) {
        setProjects((prev) => [...prev, created]);
        setCreateProjectOpen(false);
        setCreateProjectForm({ team_id: tid, name: "" });
      }
    } finally {
      setCreatingProject(false);
    }
  };

  const submitNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskCtx) return;
    const selectedProject = newTaskCtx.project ?? projects.find((p) => p.id === newTaskForm.project_id) ?? projects[0];
    if (!selectedProject) return;
    // Compensa o pan/offset do canvas para posicionar corretamente
    const nx = newTaskCtx.noteX ?? ((newTaskCtx.rawX ?? 0) - offset.x - (selectedProject.position_x ?? 0));
    const ny = newTaskCtx.noteY ?? ((newTaskCtx.rawY ?? 0) - offset.y - (selectedProject.position_y ?? 0));
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);
    const content = newTaskForm.content + (newTaskForm.dueDate ? `\nPrazo: ${formatDate(newTaskForm.dueDate)}` : "");
    const created = await createTask({
      project_id: selectedProject.id,
      title: newTaskForm.title || "Nota",
      content,
      position_x: nx,
      position_y: ny,
      width: 200,
      height: 150,
      color: newTaskForm.color || "#fef3c7",
      z_index: zIndexCounter,
    });
    if (created) {
      setTasks((prev) => ({
        ...prev,
        [selectedProject.id]: [...(prev[selectedProject.id] ?? []), created],
      }));
      setZIndexCounter((z) => z + 1);
    }
    setNewTaskOpen(false);
    setNewTaskCtx(null);
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-end gap-2">
        <Button onClick={() => setCreateProjectOpen(true)}>Novo projeto</Button>
      </div>
      {selectedTaskIds.size > 0 && (
        <div className="mb-2 flex items-center gap-3 text-sm">
          <span className="text-neutral-700">{selectedTaskIds.size} nota(s) selecionada(s)</span>
          <Button variant="destructive" onClick={handleDeleteSelected}>Excluir</Button>
        </div>
      )}
    <BoardCanvas onDoubleCreate={handleCreateAt}>
      {/* Apenas tasks no board; posição absoluta combinando offset do projeto + task */}
      {allTasksFlat.map(({ task, project }) => (
        <TaskNote
          key={task.id}
          id={task.id}
          x={(project.position_x ?? 0) + task.position_x + offset.x}
          y={(project.position_y ?? 0) + task.position_y + offset.y}
          width={task.width}
          height={task.height}
          color={task.color}
          title={task.title}
          content={task.content}
          selected={selectedTaskIds.has(task.id)}
          onClick={toggleSelect}
          onDoubleClick={(id) => {
            const found = allTasksFlat.find(({ task }) => task.id === id)?.task ?? null;
            if (found) {
              setEditTask({ ...found });
              setEditTaskOpen(true);
            }
          }}
          onDragDelta={(id, dx, dy) => applyDelta(id, dx, dy)}
          onDragEnd={(id) => persistMoved(id)}
        />
      ))}

      {/* Dicas de atalhos no canvas */}
      <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm text-gray-600 z-50">
        Alt+Arrastar ou botão do meio: Pan | Duplo clique: Nova task | Shift+Arrastar: Seleção múltipla
      </div>

      {/* Marquee selection e Pan (Alt/botão do meio) */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: "auto" }}
        onPointerDown={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const startX = e.clientX - rect.left;
          const startY = e.clientY - rect.top;
          // Shift inicia marquee seleção
          if (e.shiftKey) {
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            setMarquee({ x: startX, y: startY, w: 0, h: 0 });
            return;
          }
          // Alt ou botão do meio inicia pan
          if (e.altKey || e.button === 1) {
            e.preventDefault();
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            setPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
            return;
          }
        }}
        onPointerMove={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const curX = e.clientX - rect.left;
          const curY = e.clientY - rect.top;
          if (marquee) {
            const w = curX - marquee.x;
            const h = curY - marquee.y;
            setMarquee({ ...marquee, w, h });
            return;
          }
          if (panning && panStart) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            setPanStart({ x: e.clientX, y: e.clientY });
            setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
            return;
          }
        }}
        onPointerUp={(e) => {
          if (marquee) {
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
              // aplica offset para comparar com marquee visual
              const rx = ax + offset.x;
              const ry = ay + offset.y;
              const intersects = rx < mx + mw && rx + aw > mx && ry < my + mh && ry + ah > my;
              if (intersects) selected.add(task.id);
            }
            setSelectedTaskIds(selected);
            setMarquee(null);
          }
          if (panning) {
            setPanning(false);
            setPanStart(null);
          }
          (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        }}
        onPointerLeave={() => {
          if (marquee) setMarquee(null);
          if (panning) {
            setPanning(false);
            setPanStart(null);
          }
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

    {/* Visualização/Edição de task existente */}
    <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
      <DialogContent className="bg-white text-neutral-900 border border-neutral-200">
        <DialogHeader>
          <DialogTitle>Visualizar/Editar task</DialogTitle>
        </DialogHeader>
        {editTask && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const updated = await updateTask(editTask.id, {
                title: editTask.title,
                content: editTask.content ?? null,
                color: editTask.color ?? "#fef3c7",
              });
              if (updated) {
                setTasks((prev) => {
                  const next: Record<string, Task[]> = { ...prev };
                  const pid = updated.project_id;
                  next[pid] = (next[pid] ?? []).map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
                  return next;
                });
                setEditTaskOpen(false);
                setEditTask(null);
              }
            }}
            className="space-y-3"
          >
            <div>
              <Label htmlFor="etitle" className="text-neutral-700">Título</Label>
              <Input
                id="etitle"
                value={editTask.title}
                onChange={(e) => setEditTask((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400"
                placeholder="Ex.: Nota rápida"
              />
            </div>
            <div>
              <Label htmlFor="econtent" className="text-neutral-700">Conteúdo</Label>
              <textarea
                id="econtent"
                rows={4}
                value={editTask.content ?? ""}
                onChange={(e) => setEditTask((prev) => (prev ? { ...prev, content: e.target.value } : prev))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-neutral-400"
                placeholder="Detalhes da nota"
              />
            </div>
            <div>
              <Label htmlFor="ecolor" className="text-neutral-700">Cor (hex)</Label>
              <Input
                id="ecolor"
                type="text"
                value={(editTask.color ?? "#fef3c7")}
                onChange={(e) => setEditTask((prev) => (prev ? { ...prev, color: e.target.value } : prev))}
                onBlur={(e) => {
                  const raw = e.target.value.trim();
                  const normalized = (() => {
                    let v = raw.toUpperCase();
                    v = v.startsWith("#") ? v : `#${v}`;
                    return v.slice(0, 7);
                  })();
                  setEditTask((prev) => (prev ? { ...prev, color: normalized } : prev));
                }}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                title="Informe uma cor hexadecimal válida (ex.: #FFAA00)"
                maxLength={7}
                className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400"
                placeholder="#FFAA00"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setEditTaskOpen(false); setEditTask(null); }}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>

    <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
      <DialogContent className="bg-white text-neutral-900 border border-neutral-200">
        <DialogHeader>
          <DialogTitle>Criar nova task</DialogTitle>
        </DialogHeader>
        <form onSubmit={submitNewTask} className="space-y-3">
          <div>
            <Label htmlFor="project" className="text-neutral-700">Projeto</Label>
            <select
              id="project"
              className="w-full rounded-md bg-white text-neutral-900 border border-neutral-300 px-3 py-2 text-sm"
              value={newTaskForm.project_id}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, project_id: e.target.value })}
            >
              {projects.length === 0 ? (
                <option value="" disabled>
                  Nenhum projeto disponível
                </option>
              ) : (
                <>
                  {!newTaskForm.project_id && (
                    <option value="" disabled>
                      Selecione um projeto
                    </option>
                  )}
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div>
            <Label htmlFor="title" className="text-neutral-700">Título</Label>
            <Input id="title" value={newTaskForm.title} onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })} className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" placeholder="Ex.: Nota rápida" />
          </div>
          <div>
            <Label htmlFor="content" className="text-neutral-700">Conteúdo</Label>
            <textarea id="content" rows={4} value={newTaskForm.content} onChange={(e) => setNewTaskForm({ ...newTaskForm, content: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-neutral-400" placeholder="Detalhes da nota" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="color" className="text-neutral-700">Cor (hex)</Label>
              <Input
                id="color"
                type="text"
                value={newTaskForm.color}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, color: e.target.value })}
                onBlur={(e) => {
                  const raw = e.target.value.trim();
                  const normalized = (() => {
                    let v = raw.toUpperCase();
                    v = v.startsWith("#") ? v : `#${v}`;
                    return v.slice(0, 7);
                  })();
                  setNewTaskForm({ ...newTaskForm, color: normalized });
                }}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                title="Informe uma cor hexadecimal válida (ex.: #FFAA00)"
                maxLength={7}
                className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400"
                placeholder="#FFAA00"
              />
            </div>
            <div>
              <Label className="text-neutral-700">Prazo</Label>
              <div className="rounded-md border border-neutral-300 bg-white px-2 py-2">
                <Calendar
                  mode="single"
                  selected={newTaskForm.dueDate ?? undefined}
                  onSelect={(date) => setNewTaskForm({ ...newTaskForm, dueDate: date ?? null })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setNewTaskOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Criação de projeto (sem cor e sem data) */}
    <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
      <DialogContent className="bg-white text-neutral-900 border border-neutral-200">
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={submitCreateProject} className="space-y-3">
          <div>
            <Label htmlFor="team" className="text-neutral-700">Equipe</Label>
            <select
              id="team"
              className="w-full rounded-md bg-white text-neutral-900 border border-neutral-300 px-3 py-2 text-sm"
              value={createProjectForm.team_id}
              onChange={(e) => setCreateProjectForm({ ...createProjectForm, team_id: e.target.value })}
            >
              {teams.length === 0 ? (
                <option value="" disabled>Nenhuma equipe disponível</option>
              ) : (
                teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)
              )}
            </select>
          </div>
          <div>
            <Label htmlFor="proj-name" className="text-neutral-700">Nome</Label>
            <Input id="proj-name" value={createProjectForm.name} onChange={(e) => setCreateProjectForm({ ...createProjectForm, name: e.target.value })}
              className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" placeholder="Nome do projeto" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateProjectOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={creatingProject || !createProjectForm.team_id || !createProjectForm.name.trim()}>Criar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}