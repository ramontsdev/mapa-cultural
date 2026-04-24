"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMyAgent, useUpdateMyAgent } from "@/hooks/api/use-agents";
import { formatMetadata, mapAgentToUser } from "@/lib/api/types";
import { ApiError } from "@/lib/api/http";
import { AREA_ATUACAO_LABELS, type AreaAtuacao } from "@/lib/types";
import {
  meuAgenteEdicaoSchema,
  type MeuAgenteEdicaoFormData,
} from "@/lib/validations";

export default function EditarMeuAgentePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, isAuthLoading, router]);

  const myAgentQuery = useMyAgent({ enabled: isAuthenticated });
  const updateMutation = useUpdateMyAgent();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

  if (myAgentQuery.data && myAgentQuery.data.id !== id) {
    notFound();
  }

  const user = myAgentQuery.data ? mapAgentToUser(myAgentQuery.data) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/usuarios/meus" className="hover:text-foreground">
              Meu perfil
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Editar</span>
          </nav>
        </div>
      </div>

      <QueryState
        isLoading={myAgentQuery.isLoading}
        error={myAgentQuery.error}
        onRetry={() => myAgentQuery.refetch()}
        isEmpty={!user}
      >
        {user && myAgentQuery.data ? (
          <EditForm
            initialUser={user}
            onSubmit={async (values) => {
              const shortDescription = formatMetadata(values.oQueFaz?.trim() ?? "", {
                tipoAtuacao: values.tipoAtuacao,
                email: values.email?.trim(),
                cidade: values.cidade?.trim(),
                estado: values.estado?.trim().slice(0, 2).toUpperCase(),
                areas: values.areasAtuacao.join(","),
              });
              try {
                await updateMutation.mutateAsync({
                  name: values.nome,
                  shortDescription,
                  longDescription: values.biografia,
                });
                toast.success("Perfil atualizado com sucesso!");
                router.push(`/usuarios/${id}`);
              } catch (error) {
                if (error instanceof ApiError) {
                  toast.error(error.message);
                } else {
                  toast.error("Não foi possível atualizar o perfil.");
                }
              }
            }}
            isSaving={updateMutation.isPending}
            cancelHref={`/usuarios/${id}`}
          />
        ) : null}
      </QueryState>
    </div>
  );
}

type EditFormProps = {
  initialUser: ReturnType<typeof mapAgentToUser>;
  onSubmit: (values: MeuAgenteEdicaoFormData) => Promise<void> | void;
  isSaving: boolean;
  cancelHref: string;
};

function EditForm({ initialUser, onSubmit, isSaving, cancelHref }: EditFormProps) {
  const form = useForm<MeuAgenteEdicaoFormData>({
    resolver: zodResolver(meuAgenteEdicaoSchema),
    defaultValues: {
      nome: initialUser.nome,
      tipoAtuacao: initialUser.tipoAtuacao,
      email: initialUser.email ?? "",
      biografia: initialUser.biografia ?? "",
      areasAtuacao: [...initialUser.areasAtuacao],
      cidade: initialUser.cidade ?? "",
      estado: initialUser.estado ?? "",
      oQueFaz: initialUser.oQueFaz ?? "",
    },
  });

  const areas = form.watch("areasAtuacao");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addArea = (a: AreaAtuacao) => {
    const cur = form.getValues("areasAtuacao");
    if (cur.includes(a)) return;
    form.setValue("areasAtuacao", [...cur, a], { shouldValidate: true });
  };

  const removeArea = (a: AreaAtuacao) => {
    const cur = form.getValues("areasAtuacao");
    form.setValue(
      "areasAtuacao",
      cur.filter((x) => x !== a),
      { shouldValidate: true },
    );
  };

  const areasDisponiveis = (
    Object.entries(AREA_ATUACAO_LABELS) as [AreaAtuacao, string][]
  ).filter(([k]) => !areas.includes(k));

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  });

  const saving = isSaving || isSubmitting;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipoAtuacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de atuação</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="coletivo">Coletivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail de contato (opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF (opcional)</FormLabel>
                      <FormControl>
                        <Input maxLength={2} {...field} placeholder="PI" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="oQueFaz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>O que faz (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="biografia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areasAtuacao"
                render={() => (
                  <FormItem>
                    <FormLabel>Áreas de atuação</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {areas.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                        >
                          {AREA_ATUACAO_LABELS[a]}
                          <button
                            type="button"
                            className="rounded p-0.5 hover:bg-primary/20"
                            onClick={() => removeArea(a)}
                            aria-label="Remover"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {areasDisponiveis.map(([k, label]) => (
                        <Button
                          key={k}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => addArea(k)}
                        >
                          <Plus className="h-3 w-3" />
                          {label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Salvar alterações
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={cancelHref}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
