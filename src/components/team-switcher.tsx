"use client";

import * as React from "react";
import { ChevronDown, Plus, Building } from "lucide-react";
import { useCompanyStore } from "@/stores/company-store";
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
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, use } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores";

export function TeamSwitcher() {

  const { user } = useAuthStore()
  const { companies, currentCompany, setCurrentCompany, fetchCompanies } = useCompanyStore();

  useEffect(() => {
    if (user?.teamId) {
      fetchCompanies(user?.teamId);
    }
  }, [user]);

  const handleTeamChange = (team: any) => {
    setCurrentCompany(team);
  };

  if (!currentCompany) {
    return null;
  }

  if (companies.length <= 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-1">
            <div className="bg-sidebar-primary data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-md">
              <Building className="size-4" />
            </div>
            <span className="truncate font-medium">{currentCompany.name}</span>
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
              <span className="truncate font-medium">{currentCompany.name}</span>
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
              Empresas
            </DropdownMenuLabel>
            {companies.map((team) => (
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
              onClick={() => toast.success('Adicionar empresa')}
            >
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Adicionar empresa
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
