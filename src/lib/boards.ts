import { supabase } from "@/lib/supabase";

export type Team = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Project = {
  id: string;
  team_id: string | null;
  name: string;
  description?: string | null;
  color?: string | null;
  position_x?: number | null;
  position_y?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  content?: string | null;
  position_x: number;
  position_y: number;
  width?: number | null;
  height?: number | null;
  color?: string | null;
  z_index?: number | null;
  created_at?: string;
  updated_at?: string;
};

// Utilitário simples para validar UUID (formato v4 comum)
function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// Helper para garantir usuário autenticado em operações de escrita
async function ensureAuth() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    throw new Error("Acesso negado: usuário não autenticado");
  }
  return data.user;
}

// Teams
export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from("teams").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function createTeam(payload: { name: string; description?: string | null }): Promise<Team | null> {
  await ensureAuth();
  const { data, error } = await supabase
    .from("teams")
    .insert({ name: payload.name, description: payload.description ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data ?? null;
}

export async function updateTeam(id: string, updates: Partial<Omit<Team, "id">>): Promise<Team | null> {
  await ensureAuth();
  const { data, error } = await supabase
    .from("teams")
    .update({ ...updates })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data ?? null;
}

export async function deleteTeam(id: string): Promise<boolean> {
  await ensureAuth();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Projects
export async function fetchProjects(teamId?: string): Promise<Project[]> {
  const query = supabase.from("projects").select("*");
  // Evita erro 22P02 quando teamId não é UUID, retornando vazio
  if (teamId && !isValidUUID(teamId)) {
    return [];
  }
  const { data, error } = teamId ? await query.eq("team_id", teamId) : await query;
  if (error) throw error;
  return data ?? [];
}

export async function createProject(payload: {
  team_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  position_x?: number;
  position_y?: number;
}): Promise<Project | null> {
  await ensureAuth();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      team_id: payload.team_id,
      name: payload.name,
      description: payload.description ?? null,
      color: payload.color ?? "#6366f1",
      position_x: payload.position_x ?? 0,
      position_y: payload.position_y ?? 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data ?? null;
}

export async function updateProject(
  id: string,
  updates: Partial<{
    team_id: string | null;
    name: string;
    description: string | null;
    color: string | null;
    position_x: number | null;
    position_y: number | null;
  }>,
): Promise<Project | null> {
  await ensureAuth();
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data ?? null;
}

export async function deleteProject(id: string): Promise<boolean> {
  await ensureAuth();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Tasks
export async function fetchTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);
  if (error) throw error;
  return data ?? [];
}

export async function createTask(
  input: Omit<Task, "id" | "created_at" | "updated_at">
): Promise<Task | null> {
  await ensureAuth();
  const { data, error } = await supabase
    .from("tasks")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data ?? null;
}

export async function deleteTask(id: string): Promise<void> {
  await ensureAuth();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function updateTaskPosition(
  id: string,
  patch: Pick<Task, "position_x" | "position_y" | "z_index" | "width" | "height">
) {
  await ensureAuth();
  const { error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function updateTask(
  id: string,
  updates: Partial<{
    title: string;
    content: string | null;
    color: string | null;
    width: number | null;
    height: number | null;
    z_index: number | null;
  }>
): Promise<Task | null> {
  await ensureAuth();
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data ?? null;
}

export async function updateProjectPosition(
  id: string,
  patch: Pick<Project, "position_x" | "position_y">
) {
  await ensureAuth();
  const { error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}