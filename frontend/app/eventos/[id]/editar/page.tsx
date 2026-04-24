"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Loader2, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useMyAgent } from "@/hooks/api/use-agents";
import {
  useDeleteEvent,
  useEvent,
  useUpdateEvent,
} from "@/hooks/api/use-events";
import { ApiError } from "@/lib/api/http";
import {
  formatMetadata,
  mapEventToEvento,
  type EventDTO,
} from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  type AreaAtuacao,
  type ClassificacaoEtaria,
} from "@/lib/types";
import {
  meuEventoEdicaoSchema,
  type MeuEventoEdicaoFormData,
} from "@/lib/validations";

function dtoToFormValues(dto: EventDTO): MeuEventoEdicaoFormData {
  const evento = mapEventToEvento(dto);
  return {
    nome: evento.nome,
    descricao: evento.descricao,
    dataInicio: evento.dataInicio,
    dataFim: evento.dataFim ?? "",
    horario: evento.horario,
    classificacao: evento.classificacao,
    entrada: evento.entrada,
    preco: evento.preco != null ? String(evento.preco) : "",
    areasAtuacao: [...evento.areasAtuacao],
    lugarId: "",
    tags: evento.tags.length ? evento.tags.join(", ") : "",
    imagem: evento.imagem ?? "",
  };
}

function EditarEventoForm({ dto, id }: { dto: EventDTO; id: string }) {
  const router = useRouter();
  const updateMutation = useUpdateEvent(id);
  const deleteMutation = useDeleteEvent();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<MeuEventoEdicaoFormData>({
    resolver: zodResolver(meuEventoEdicaoSchema),
    defaultValues: dtoToFormValues(dto),
  });

  const areas = form.watch("areasAtuacao");
  const entrada = form.watch("entrada");

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

  const salvar = () => {
    void form.handleSubmit(async (data) => {
      try {
        const tags = (data.tags ?? "")
          .split(/[,;]+/)
          .map((t) => t.trim())
          .filter(Boolean);

        const shortDescription = formatMetadata(data.descricao, {
          dataInicio: data.dataInicio,
          dataFim: data.dataFim?.trim() || undefined,
          horario: data.horario,
          classificacao: data.classificacao,
          entrada: data.entrada,
          preco: data.entrada === "pago" ? data.preco : undefined,
          areas: data.areasAtuacao.join(","),
          tags: tags.join(","),
          imagem: data.imagem?.trim() || undefined,
        });

        await updateMutation.mutateAsync({
          name: data.nome,
          shortDescription,
        });

        toast.success("Evento atualizado.");
        router.push(`/eventos/${id}`);
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível salvar.",
        );
      }
    })();
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Evento excluído.");
      router.push("/eventos/meus");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Não foi possível excluir.",
      );
    }
  };

  const isSaving = updateMutation.isPending;

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar evento</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dataInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de início</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataFim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de fim (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="horario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: 19h" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="classificacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classificação</FormLabel>
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
                            {(
                              Object.entries(
                                CLASSIFICACAO_LABELS,
                              ) as [ClassificacaoEtaria, string][]
                            ).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entrada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entrada</FormLabel>
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
                            <SelectItem value="gratuito">Gratuita</SelectItem>
                            <SelectItem value="pago">Paga</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {entrada === "pago" && (
                  <FormField
                    control={form.control}
                    name="preco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0,00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="areasAtuacao"
                  render={() => (
                    <FormItem>
                      <FormLabel>Linguagens / áreas</FormLabel>
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
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (separadas por vírgula)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da imagem (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://…"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap">
              <Button type="button" onClick={salvar} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando…
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/eventos/${id}`}>Cancelar</Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="sm:ml-auto"
                onClick={() => setDeleteOpen(true)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function EditarMeuEventoPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, isAuthLoading, router]);

  const eventQuery = useEvent(id);
  const meQuery = useMyAgent({ enabled: isAuthenticated });

  const canEdit = useMemo(() => {
    if (!eventQuery.data || !meQuery.data) return false;
    return eventQuery.data.agentId === meQuery.data.id;
  }, [eventQuery.data, meQuery.data]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/eventos/meus" className="hover:text-foreground">
              Meus eventos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Editar</span>
          </nav>
        </div>
      </div>
      <QueryState
        isLoading={eventQuery.isLoading || meQuery.isLoading}
        error={eventQuery.error ?? meQuery.error}
        onRetry={() => eventQuery.refetch()}
        isEmpty={!eventQuery.data}
        emptyMessage="Evento não encontrado"
      >
        {eventQuery.data && !canEdit && (
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Você não tem permissão para editar este evento.
              </CardContent>
            </Card>
          </div>
        )}
        {eventQuery.data && canEdit && (
          <EditarEventoForm dto={eventQuery.data} id={id} />
        )}
      </QueryState>
    </div>
  );
}
