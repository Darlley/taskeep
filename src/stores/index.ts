"use client";

type User = {
  teamId?: string;
};

export function useAuthStore() {
  const user: User = { teamId: "team-1" };
  return { user };
}