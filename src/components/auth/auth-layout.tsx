"use client";

import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthLayout({ title, subtitle, children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Coluna da esquerda - Formulário */}
      <div className="hidden lg:block relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black/20" />

        {/* Conteúdo da coluna direita */}
        <div className="relative h-full flex flex-col justify-center p-12 text-white">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">taskeep</h2>
              <p className="text-xl text-blue-100">
                Monitoramento tático, rondas, escoltas e vigilância patrimonial
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full" />
                <span className="text-blue-100">Controle total de operações</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full" />
                <span className="text-blue-100">Relatórios em tempo real</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full" />
                <span className="text-blue-100">Gestão de equipes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full" />
                <span className="text-blue-100">Segurança avançada</span>
              </div>
            </div>

            {/* Elemento decorativo */}
            <div className="mt-12">
              <div className="grid grid-cols-3 gap-4 opacity-30">
                <div className="h-16 bg-white/10 rounded-lg" />
                <div className="h-16 bg-white/20 rounded-lg" />
                <div className="h-16 bg-white/10 rounded-lg" />
                <div className="h-16 bg-white/20 rounded-lg" />
                <div className="h-16 bg-white/10 rounded-lg" />
                <div className="h-16 bg-white/20 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Logo/Marca no rodapé */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="flex items-center justify-between text-blue-200 text-sm">
              <span>© 2024 taskeep</span>
              <span>Segurança Profissional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna da direita - Imagem/Conteúdo */}
      <div className="flex items-center justify-center p-8">
        <div className={cn("w-full max-w-md space-y-6", className)}>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}