"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { confirmEmail, resendVerificationCode } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/http";
import {
  confirmarEmailSchema,
  type ConfirmarEmailFormData,
} from "@/lib/validations";

export default function ConfirmarEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          Carregando…
        </div>
      }
    >
      <ConfirmarEmailContent />
    </Suspense>
  );
}

function ConfirmarEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ConfirmarEmailFormData>({
    resolver: zodResolver(confirmarEmailSchema),
    defaultValues: { email: initialEmail, codigo: "" },
  });

  useEffect(() => {
    if (initialEmail) {
      form.setValue("email", initialEmail);
    }
  }, [initialEmail, form]);

  const onSubmit = async (data: ConfirmarEmailFormData) => {
    setIsSubmitting(true);
    try {
      await confirmEmail({ email: data.email, code: data.codigo });
      setSuccess(true);
      toast.success("E-mail confirmado! Entre com suas credenciais.");
      setTimeout(() => {
        router.push("/cadastro");
      }, 1500);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Não foi possível confirmar o e-mail.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast.error("Informe um e-mail para reenviar o código.");
      return;
    }
    setIsResending(true);
    try {
      await resendVerificationCode({ email });
      toast.success("Novo código enviado para seu e-mail.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.info("Este e-mail já está verificado.");
      } else if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Não foi possível reenviar o código.");
      }
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              E-mail confirmado!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Você será redirecionado para a tela de login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Confirme seu e-mail
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enviamos um código para o seu e-mail. Insira-o abaixo para ativar
            sua conta.
          </p>
        </div>
        <Card>
          <CardHeader />
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            autoComplete="email"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de verificação</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="000000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Confirmar e-mail
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    {isResending ? "Reenviando..." : "Reenviar código"}
                  </button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/cadastro" className="hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
