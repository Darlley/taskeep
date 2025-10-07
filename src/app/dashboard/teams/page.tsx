"use client";

import React, { useEffect, useState } from "react";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchTeams, createTeam, updateTeam, deleteTeam, type Team } from "@/lib/boards";
import { useAuthStore } from "@/stores";

export default function TeamsCrudPage() {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState<Team | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchTeams();
        setTeams(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <PageContainer className="p-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/80">Acesso restrito</div>
          <div className="text-xs text-white/60">Faça login para gerenciar equipes.</div>
          <div className="mt-3">
            <a href="/signin" className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition">Ir para login</a>
          </div>
        </div>
      </PageContainer>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const created = await createTeam({ name: form.name.trim(), description: form.description || null });
      if (created) {
        setTeams((prev) => [...prev, created]);
        setForm({ name: "", description: "" });
      }
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (team: Team) => {
    setEditing({ ...team });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const updated = await updateTeam(editing.id, { name: editing.name, description: editing.description ?? null });
      if (updated) {
        setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setEditOpen(false);
        setEditing(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Excluir equipe?");
    if (!ok) return;
    setLoading(true);
    try {
      await deleteTeam(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="p-4 overflow-x-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Equipes</h2>
          <p className="text-gray-500 text-sm">Gerencie as equipes (teams) da organização.</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="team-name">Nome</Label>
            <Input id="team-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da equipe" className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" />
          </div>
          <div>
            <Label htmlFor="team-desc">Descrição</Label>
            <Input id="team-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição (opcional)" className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400" />
          </div>
        </div>
        <div className="mt-3">
          <Button type="submit" disabled={loading}>Criar equipe</Button>
        </div>
      </form>

      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 border-b border-white/10 text-xs text-white/60">
          <div>Nome</div>
          <div className="hidden sm:block">Descrição</div>
          <div className="text-right">Ações</div>
        </div>
        <div>
          {loading && teams.length === 0 && (
            <div className="p-4 text-sm text-white/70">Carregando...</div>
          )}
          {teams.map((t) => (
            <div key={t.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 border-t border-white/10 items-center">
              <div className="text-sm text-white/90">{t.name}</div>
              <div className="hidden sm:block text-sm text-white/70">{t.description ?? ""}</div>
              <div className="flex sm:justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(t)}>Editar</Button>
                <Button size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => handleDelete(t.id)}>Excluir</Button>
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
            <DialogTitle>Editar equipe</DialogTitle>
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