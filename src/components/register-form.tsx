"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const RegisterSchema = z
  .object({
    email: z.string().email({ message: "Informe um e-mail válido" }),
    password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Confirme sua senha" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

type RegisterFormData = z.infer<typeof RegisterSchema>;

export interface RegisterFormProps {
  prefilledEmail?: string;
}

export function RegisterForm({ prefilledEmail }: RegisterFormProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: prefilledEmail || "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (prefilledEmail) setValue("email", prefilledEmail);
  }, [prefilledEmail, setValue]);

  const handleRegister = async (values: RegisterFormData) => {
    const { email, password } = values;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error("Erro ao criar conta", { description: error.message });
      return;
    }

    if (data.session) {
      toast.success("Conta criada", { description: "Redirecionando para o dashboard..." });
      router.push("/dashboard");
    } else {
      toast.success("Verifique seu e-mail", {
        description: "Enviamos um link de confirmação para ativar sua conta.",
      });
      router.push("/signin");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
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
              disabled={!!prefilledEmail}
              {...field}
            />
          )}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          {prefilledEmail && (
            <p className="text-xs text-neutral-600">Usando o e-mail do checkout do Stripe.</p>
          )}
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
              placeholder="Crie uma senha"
              className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400"
              {...field}
            />
          )}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-neutral-800">Confirmar senha</Label>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              className="bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-neutral-400"
              {...field}
            />
          )}
        />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Registrando..." : "Registrar"}
      </Button>
    </form>
  );
}