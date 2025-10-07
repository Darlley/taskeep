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
  try {
    const { data, error } = await supabase.from("teams").select("*");
    if (error) throw error;
    return data ?? [];
  } catch {
    // Fallback de demonstração
    return [
      { id: "demo-team-1", name: "Development Team", description: "Main development team" },
      { id: "demo-team-2", name: "Marketing Team", description: "Marketing and outreach" },
    ];
  }
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
  try {
    const query = supabase.from("projects").select("*");
    const { data, error } = teamId ? await query.eq("team_id", teamId) : await query;
    if (error) throw error;
    return data ?? [];
  } catch {
    // Fallback de demonstração
    const base: Project[] = [
      { id: "demo-prj-1", team_id: "demo-team-1", name: "Website Redesign", color: "#3b82f6", position_x: 100, position_y: 100 },
      { id: "demo-prj-2", team_id: "demo-team-1", name: "Mobile App", color: "#10b981", position_x: 760, position_y: 100 },
      { id: "demo-prj-3", team_id: "demo-team-2", name: "Q4 Campaign", color: "#f59e0b", position_x: 100, position_y: 560 },
    ];
    return teamId ? base.filter((p) => p.team_id === teamId) : base;
  }
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
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId);
    if (error) throw error;
    return data ?? [];
  } catch {
    // Fallback com algumas notas
    const demo: Record<string, Task[]> = {
      "demo-prj-1": [
        { id: "t1", project_id: "demo-prj-1", title: "Planejar layout", content: "Wireframes", position_x: 40, position_y: 40, width: 200, height: 150, color: "#fde68a" },
        { id: "t2", project_id: "demo-prj-1", title: "Revisar conteúdo", content: "SEO", position_x: 280, position_y: 120, width: 200, height: 150, color: "#fef3c7" },
      ],
      "demo-prj-2": [
        { id: "t3", project_id: "demo-prj-2", title: "Protótipo", content: "Tela de login", position_x: 60, position_y: 70, width: 200, height: 150, color: "#e0f2fe" },
      ],
      "demo-prj-3": [
        { id: "t4", project_id: "demo-prj-3", title: "Brief", content: "Público-alvo", position_x: 100, position_y: 50, width: 200, height: 150, color: "#ffedd5" },
      ],
    };
    return demo[projectId] ?? [];
  }
}

export async function createTask(
  input: Omit<Task, "id" | "created_at" | "updated_at">
): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert(input)
      .select("*")
      .single();
    if (error) throw error;
    return data ?? null;
  } catch {
    // Fallback: retorna o objeto com id fake
    return { id: "local-" + Math.random().toString(36).slice(2), ...input } as Task;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);
    if (error) throw error;
  } catch {
    // Fallback local: sem persistência necessária
  }
}

export async function updateTaskPosition(
  id: string,
  patch: Pick<Task, "position_x" | "position_y" | "z_index" | "width" | "height">
) {
  try {
    const { error } = await supabase
      .from("tasks")
      .update(patch)
      .eq("id", id);
    if (error) throw error;
  } catch {
    // Sem persistência em fallback
  }
}

export async function updateProjectPosition(
  id: string,
  patch: Pick<Project, "position_x" | "position_y">
) {
  const { error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}