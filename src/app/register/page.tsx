import { stripe } from "@/lib/stripe";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/register-form";

interface RegisterPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { session_id } = await searchParams;
  let prefilledEmail: string | undefined;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      prefilledEmail = session.customer_details?.email || undefined;
    } catch (error) {
      console.error("Erro ao recuperar sessão do Stripe:", error);
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Preencha os dados abaixo para criar sua conta">
      <RegisterForm prefilledEmail={prefilledEmail} />

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Já tem uma conta? </span>
        <a href="/signin" className="font-medium text-primary hover:underline">
          Fazer login
        </a>
      </div>
    </AuthLayout>
  );
}