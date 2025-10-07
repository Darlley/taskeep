"use client";

import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { ProjectsView } from "@/components/board/ProjectsView";
import { TeamsView } from "@/components/board/TeamsView";
import { useAuthStore } from "@/stores";
import { LayoutGrid, Kanban, Plus, LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProjects, createProject, fetchTeams, type Project, type Team } from "@/lib/boards";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Page() {
  const { user } = useAuthStore();
  const [view, setView] = useState<"projects" | "teams">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [createForm, setCreateForm] = useState<{ team_id: string; name: string; description: string; color: string }>({ team_id: "", name: "", description: "", color: "#6366f1" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/signin");
  }

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [t, p] = await Promise.all([fetchTeams(), fetchProjects()]);
        setTeams(t);
        setProjects(p);
        setSelectedProjectId((prev) => prev || p[0]?.id || "");
        setCreateForm((prev) => ({ ...prev, team_id: prev.team_id || user.teamId || t[0]?.id || "" }));
      } catch (e) {
        // Fallbacks internos já cobrem demo
      }
    })();
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    const teamId = createForm.team_id || user?.teamId || teams[0]?.id || "";
    if (!teamId) return;
    setLoading(true);
    try {
      const created = await createProject({
        team_id: teamId,
        name: createForm.name.trim(),
        description: createForm.description || null,
        color: createForm.color || "#6366f1",
      });
      if (created) {
        setProjects((prev) => [...prev, created]);
        setSelectedProjectId(created.id);
        setCreatingOpen(false);
        setCreateForm({ team_id: teamId, name: "", description: "", color: "#6366f1" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Painel" className="p-4 overflow-x-hidden w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 w-full">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Interativo</h2>
          <p className="text-gray-500 text-sm">Alterne entre visualizações de projetos e teams. Duplo clique cria notas.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto min-w-0 justify-start sm:justify-end">
          <Link href="/dashboard/projects" className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">Gerenciar Projects</Link>
          <Link href="/dashboard/teams" className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">Gerenciar Teams</Link>
          <div className="min-w-0 w-full sm:w-auto sm:ml-2">
            <label className="sr-only">Projetos</label>
            <select
              className="w-full sm:w-56 min-w-0 rounded-md bg-white text-neutral-900 border border-neutral-300 px-3 py-2 text-sm"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {view === "projects" ? (
        <ProjectsView teamId={user.teamId} />
      ) : (
        <TeamsView />
      )}

      <Dialog open={creatingOpen} onOpenChange={setCreatingOpen}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo projeto</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleCreateProject}>
            <div>
              <Label>Equipe</Label>
              <select
                className="mt-1 w-full rounded-md bg-white text-neutral-900 border border-neutral-300 px-3 py-2 text-sm"
                value={createForm.team_id}
                onChange={(e) => setCreateForm({ ...createForm, team_id: e.target.value })}
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Nome</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" placeholder="Nome do projeto" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" placeholder="Descrição (opcional)" />
            </div>
            <div>
              <Label>Cor</Label>
              <Input value={createForm.color} onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })} className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" placeholder="#6366f1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreatingOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}