"use client";

import React, { useEffect, useState } from "react";
import { BoardCanvas } from "./BoardCanvas";
import type { Team, Project } from "@/lib/boards";
import { fetchTeams, fetchProjects } from "@/lib/boards";

export function TeamsView() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [projectsByTeam, setProjectsByTeam] = useState<Record<string, Project[]>>({});

  useEffect(() => {
    (async () => {
      const t = await fetchTeams();
      setTeams(t);
      const map: Record<string, Project[]> = {};
      for (const team of t) {
        map[team.id] = await fetchProjects(team.id);
      }
      setProjectsByTeam(map);
    })();
  }, []);

  // Distribui em uma grade simples dentro do canvas
  const positions = teams.map((_, i) => ({
    x: 200 + (i % 3) * 520,
    y: 200 + Math.floor(i / 3) * 420,
  }));

  return (
    <BoardCanvas onDoubleCreate={() => {}}>
      {teams.map((team, i) => (
        <div
          key={team.id}
          className="absolute rounded-lg border bg-white shadow-sm"
          style={{ left: positions[i].x, top: positions[i].y, width: 480, minHeight: 320 }}
        >
          <div className="px-3 py-2 text-sm font-medium text-neutral-800 border-b">{team.name}</div>
          <div className="p-3 grid grid-cols-2 gap-3">
            {(projectsByTeam[team.id] ?? []).map((p) => (
              <div key={p.id} className="rounded-md border p-2">
                <div className="text-xs font-medium" style={{ color: p.color ?? "#6366f1" }}>{p.name}</div>
                <div className="text-[12px] text-neutral-600">{p.description ?? ""}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </BoardCanvas>
  );
}