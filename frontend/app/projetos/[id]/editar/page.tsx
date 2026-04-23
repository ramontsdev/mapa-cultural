"use client";

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
import {
  getMeuProjetoById,
  removeMeuProjeto,
  subscribeMeusProjetosChanged,
  upsertMeuProjeto,
} from "@/lib/meus-projetos-storage";
import {
  AREA_ATUACAO_LABELS,
  TIPO_PROJETO_LABELS,
  type AreaAtuacao,
  type MeuProjetoRecord,
  type Projeto,
  type TipoProjeto,
} from "@/lib/types";
import {
  meuProjetoEdicaoSchema,
  type MeuProjetoEdicaoFormData,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

function recordToFormValues(rec: MeuProjetoRecord): MeuProjetoEdicaoFormData {
  const p = rec.projeto;
  return {
    nome: p.nome,
    tipo: p.tipo,
    descricao: p.descricao,
    responsavel: p.responsavel,
    areasAtuacao: [...p.areasAtuacao],
    dataInicio: p.dataInicio ?? "",
    dataFim: p.dataFim ?? "",
    parceiros: p.parceiros?.length ? p.parceiros.join(", ") : "",
    imagem: p.imagem ?? "",
  };
}

function formToProjeto(data: MeuProjetoEdicaoFormData, base: Projeto): Projeto {
  const parceirosStr = data.parceiros?.trim();
  const parceiros = parceirosStr
    ? parceirosStr.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
    : undefined;
  return {
    ...base,
    nome: data.nome,
    tipo: data.tipo as TipoProjeto,
    descricao: data.descricao,
    responsavel: data.responsavel,
    areasAtuacao: data.areasAtuacao,
    dataInicio: data.dataInicio?.trim() || undefined,
    dataFim: data.dataFim?.trim() || undefined,
    parceiros,
    imagem: data.imagem?.trim() || undefined,
  };
}

function EditarMeuProjetoForm({
  record,
  id,
}: {
  record: MeuProjetoRecord;
  id: string;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<MeuProjetoEdicaoFormData>({
    resolver: zodResolver(meuProjetoEdicaoSchema),
    defaultValues: recordToFormValues(record),
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
      { shouldValidate: true }
    );
  };

  const areasDisponiveis = (
    Object.entries(AREA_ATUACAO_LABELS) as [AreaAtuacao, string][]
  ).filter(([k]) => !areas.includes(k));

  const salvar = (status: "draft" | "published") => {
    void form.handleSubmit((data) => {
      upsertMeuProjeto({
        ...record,
        status,
        projeto: formToProjeto(data, record.projeto),
      });
      if (status === "published") router.push(`/projetos/${id}`);
    })();
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
                            )
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
                      <FormLabel>URL da imagem (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                variant="outline"
                onClick={() => salvar("draft")}
              >
                Salvar rascunho
              </Button>
              <Button type="button" onClick={() => salvar("published")}>
                Publicar
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/projetos/${id}`}>Cancelar</Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="sm:ml-auto"
                onClick={() => setDeleteOpen(true)}
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
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove o cadastro deste dispositivo. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                removeMeuProjeto(id);
                router.push("/projetos/meus");
              }}
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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [tick, setTick] = useState(0);

  useEffect(
    () => subscribeMeusProjetosChanged(() => setTick((t) => t + 1)),
    []
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, router]);

  const record = useMemo(() => {
    void tick;
    return getMeuProjetoById(id);
  }, [id, tick]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

  if (!record) {
    notFound();
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
      <EditarMeuProjetoForm record={record} id={id} />
    </div>
  );
}
