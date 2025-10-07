"use client";

import * as React from "react";
import { ChevronDown, Plus, Building } from "lucide-react";
import { fetchTeams, type Team } from "@/lib/boards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores";

export function TeamSwitcher() {
  const { user } = useAuthStore();
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = React.useState<Team | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const list = await fetchTeams();
        setTeams(list);
        // Seleciona o primeiro time como padrão se não houver seleção
        setCurrentTeam((prev) => prev ?? list[0] ?? null);
      } catch (e) {
        // Fallback e erros já tratados em fetchTeams
      }
    })();
  }, [user]);

  const handleTeamChange = (team: Team) => {
    setCurrentTeam(team);
  };

  if (!currentTeam) {
    return null;
  }

  if (teams.length <= 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-1">
            <div className="bg-sidebar-primary data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-md">
              <Building className="size-4" />
            </div>
            <span className="truncate font-medium">{currentTeam.name}</span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full px-1.5">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-md">
                <Building className="size-4" />
              </div>
              <span className="truncate font-medium">{currentTeam.name}</span>
              <ChevronDown className="ml-auto opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Times
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => handleTeamChange(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-xs border">
                  <Building className="size-4 shrink-0" />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => toast.success('Adicionar time')}
            >
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Adicionar time
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
