"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Loader2, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { EntityMediaManager } from "@/components/media/entity-media-manager";
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
  useDeleteProject,
  useProject,
  useUpdateProject,
} from "@/hooks/api/use-projects";
import { ApiError } from "@/lib/api/http";
import type { ProjectDTO } from "@/lib/api/types";
import { formatMetadata, mapProjectToProjeto } from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  TIPO_PROJETO_LABELS,
  type AreaAtuacao,
} from "@/lib/types";
import {
  meuProjetoEdicaoSchema,
  type MeuProjetoEdicaoFormData,
} from "@/lib/validations";

function projectToFormValues(project: ProjectDTO): MeuProjetoEdicaoFormData {
  const projeto = mapProjectToProjeto(project);
  return {
    nome: projeto.nome,
    tipo: projeto.tipo,
    descricao: projeto.descricao,
    responsavel: projeto.responsavel,
    areasAtuacao: [...projeto.areasAtuacao],
    dataInicio: projeto.dataInicio ?? "",
    dataFim: projeto.dataFim ?? "",
    parceiros: projeto.parceiros?.length ? projeto.parceiros.join(", ") : "",
    imagem: projeto.imagem ?? "",
    avatarUrl: projeto.avatarUrl ?? "",
  };
}

function formToPayload(data: MeuProjetoEdicaoFormData) {
  const parceirosStr = data.parceiros?.trim();
  const parceiros = parceirosStr
    ? parceirosStr
        .split(/[,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const shortDescription = formatMetadata(data.descricao, {
    tipo: data.tipo,
    responsavel: data.responsavel,
    areas: data.areasAtuacao.join(","),
    parceiros: parceiros.join(","),
    imagem: data.imagem?.trim() || undefined,
  });
  const emptyToNull = (s: string | undefined) => {
    const t = s?.trim();
    return t === "" || t === undefined ? null : t;
  };

  return {
    name: data.nome,
    shortDescription,
    avatarUrl: emptyToNull(data.avatarUrl),
    coverUrl: emptyToNull(data.imagem),
  };
}

function EditarProjetoForm({ project }: { project: ProjectDTO }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateMutation = useUpdateProject(project.id);
  const deleteMutation = useDeleteProject();

  const form = useForm<MeuProjetoEdicaoFormData>({
    resolver: zodResolver(meuProjetoEdicaoSchema),
    defaultValues: projectToFormValues(project),
  });

  const areas = form.watch("areasAtuacao");

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

  const salvar = form.handleSubmit(async (data) => {
    try {
      await updateMutation.mutateAsync(formToPayload(data));
      toast.success("Projeto atualizado.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar o projeto.",
      );
    }
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(project.id);
      toast.success("Projeto excluído.");
      router.push("/projetos/meus");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível excluir.",
      );
    }
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-5" onSubmit={salvar}>
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
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
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
                          {Object.entries(TIPO_PROJETO_LABELS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
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
                <FormField
                  control={form.control}
                  name="responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <FormLabel>Início (opcional)</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="dataFim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Término (opcional)</FormLabel>
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
                <FormField
                  control={form.control}
                  name="parceiros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parceiros (separados por vírgula)</FormLabel>
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
                      <FormLabel>URL da imagem de capa (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da foto de perfil (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://"
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
              <Button
                type="button"
                onClick={salvar}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Salvar
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/projetos/${project.id}`}>Cancelar</Link>
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

            <div className="mt-8">
              <EntityMediaManager
                ownerType="PROJECT"
                ownerId={project.id}
                media={project.mediaAssets}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
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

export default function EditarMeuProjetoPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const projectQuery = useProject(id);
  const meQuery = useMyAgent();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, isAuthLoading, router]);

  const canEdit = useMemo(() => {
    if (!projectQuery.data || !meQuery.data) return false;
    return projectQuery.data.agentId === meQuery.data.id;
  }, [projectQuery.data, meQuery.data]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

  if (projectQuery.isLoading || meQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <QueryState isLoading={true}>{null}</QueryState>
      </div>
    );
  }

  if (projectQuery.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <QueryState
          isLoading={false}
          error={projectQuery.error}
          onRetry={() => projectQuery.refetch()}
        >
          {null}
        </QueryState>
      </div>
    );
  }

  if (!projectQuery.data) notFound();

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Você não tem permissão para editar este projeto.
          </p>
        </div>
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
            <Link href="/projetos/meus" className="hover:text-foreground">
              Meus projetos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Editar</span>
          </nav>
        </div>
      </div>
      <EditarProjetoForm
        key={`${projectQuery.data.id}-${projectQuery.data.updateTimestamp ?? projectQuery.data.createTimestamp}`}
        project={projectQuery.data}
      />
    </div>
  );
}
