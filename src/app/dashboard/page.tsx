"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace("/signin");
        return;
      }
      setEmail(session.user.email ?? null);
      setReady(true);
    };
    checkSession();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-dvh grid place-items-center">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="text-sm text-white/80">Dashboard</div>
          <button
            className="text-xs text-white/70 hover:text-white"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/signin");
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-semibold tracking-tight text-white">Bem-vindo{email ? `, ${email}` : ""}</h1>
        <p className="mt-2 text-sm text-neutral-300">Este é um dashboard protegido. Personalize conforme necessário.</p>
      </main>
    </div>
  );
}