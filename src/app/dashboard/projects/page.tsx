"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchProjects, createProject, updateProject, deleteProject, fetchTeams, type Project, type Team } from "@/lib/boards";
import { useAuthStore } from "@/stores";

export default function ProjectsCrudPage() {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [editing, setEditing] = useState<Project | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const t = await fetchTeams();
        setTeams(t);
        const defaultTeam = t[0]?.id ?? "";
        const teamId = selectedTeam || defaultTeam;
        setSelectedTeam(teamId);
        const list = await fetchProjects(teamId || undefined);
        setProjects(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedTeam) return;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchProjects(selectedTeam);
        setProjects(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedTeam, user]);

  if (!user) {
    return (
      <PageContainer className="p-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/80">Acesso restrito</div>
          <div className="text-xs text-white/60">Faça login para gerenciar projetos.</div>
          <div className="mt-3">
            <a href="/signin" className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition">Ir para login</a>
          </div>
        </div>
      </PageContainer>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !selectedTeam) return;
    setLoading(true);
    try {
      const created = await createProject({
        team_id: selectedTeam,
        name: form.name.trim(),
        description: form.description || null,
        color: form.color || "#6366f1",
      });
      if (created) {
        setProjects((prev) => [...prev, created]);
        setForm({ name: "", description: "", color: "#6366f1" });
      }
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (project: Project) => {
    setEditing({ ...project });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const updated = await updateProject(editing.id, {
        name: editing.name,
        description: editing.description ?? null,
        color: editing.color ?? "#6366f1",
      });
      if (updated) {
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setEditOpen(false);
        setEditing(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Excluir projeto?");
    if (!ok) return;
    setLoading(true);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="p-4 overflow-x-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Projetos</h2>
          <p className="text-gray-500 text-sm">Gerencie os projetos vinculados às equipes.</p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
        <Label className="mb-2 block">Equipe</Label>
        <select
          className="w-full sm:w-64 rounded-md bg-white text-neutral-900 border border-neutral-300 px-3 py-2 text-sm"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleCreate} className="rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="project-name">Nome</Label>
            <Input id="project-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do projeto" className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" />
          </div>
          <div>
            <Label htmlFor="project-desc">Descrição</Label>
            <Input id="project-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição (opcional)" className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" />
          </div>
          <div>
            <Label htmlFor="project-color">Cor</Label>
            <Input id="project-color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#6366f1" className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" />
          </div>
        </div>
        <div className="mt-3">
          <Button type="submit" disabled={loading || !selectedTeam}>Criar projeto</Button>
        </div>
      </form>

      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 border-b border-white/10 text-xs text-white/60">
          <div>Nome</div>
          <div className="hidden sm:block">Descrição</div>
          <div className="hidden sm:block">Cor</div>
          <div className="text-right">Ações</div>
        </div>
        <div>
          {loading && projects.length === 0 && (
            <div className="p-4 text-sm text-white/70">Carregando...</div>
          )}
          {projects.map((p) => (
            <div key={p.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 border-t border-white/10 items-center">
              <div className="text-sm text-white/90">{p.name}</div>
              <div className="hidden sm:block text-sm text-white/70">{p.description ?? ""}</div>
              <div className="hidden sm:block text-sm">
                <span className="inline-flex h-4 w-4 rounded-sm align-middle mr-2" style={{ backgroundColor: p.color ?? "#6366f1" }} />
                <span className="text-white/70 align-middle">{p.color ?? "#6366f1"}</span>
              </div>
              <div className="flex sm:justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Editar</Button>
                <Button size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => handleDelete(p.id)}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          {/* Hidden trigger - usamos estado para abrir */}
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar projeto</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" />
              </div>
              <div>
                <Label>Cor</Label>
                <Input value={editing.color ?? "#6366f1"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button onClick={handleUpdate} disabled={loading}>Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}