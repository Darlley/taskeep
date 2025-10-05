"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const LoginSchema = z.object({
  email: z.string().email({ message: "Informe um email válido" }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function SignInPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (values: LoginForm) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error("Falha ao entrar", {
        description: error.message,
      });
      return;
    }

    if (data.session) {
      toast.success("Login realizado", {
        description: "Redirecionando para o dashboard...",
      });
      router.push("/dashboard");
    }
  };

  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Faça login em sua conta para continuar">
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-neutral-800">E-mail</Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400"
                {...field}
              />
            )}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-neutral-800">Senha</Label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400"
                {...field}
              />
            )}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="text-center text-sm space-y-2">
        <div>
          <span className="text-muted-foreground">Não tem uma conta? </span>
          <a href="/register" className="font-medium text-primary hover:underline">
            Criar conta
          </a>
        </div>
        <div>
          <a href="/dashboard" className="text-muted-foreground hover:text-primary">
            Ir para Dashboard
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}