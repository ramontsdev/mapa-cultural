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
  getMeuOportunidadeById,
  removeMeuOportunidade,
  subscribeMeusOportunidadesChanged,
  upsertMeuOportunidade,
} from "@/lib/meus-oportunidades-storage";
import {
  AREA_ATUACAO_LABELS,
  TIPO_OPORTUNIDADE_LABELS,
  type AreaAtuacao,
  type MeuOportunidadeRecord,
  type Oportunidade,
  type TipoOportunidade,
} from "@/lib/types";
import {
  meuOportunidadeEdicaoSchema,
  type MeuOportunidadeEdicaoFormData,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

function recordToFormValues(
  rec: MeuOportunidadeRecord
): MeuOportunidadeEdicaoFormData {
  const o = rec.oportunidade;
  return {
    nome: o.nome,
    tipo: o.tipo,
    descricao: o.descricao,
    dataInscricaoInicio: o.dataInscricaoInicio,
    dataInscricaoFim: o.dataInscricaoFim,
    areasInteresse: [...o.areasInteresse],
    requisitos: o.requisitos ?? "",
    valorPremio:
      o.valorPremio != null ? String(o.valorPremio) : "",
    link: o.link ?? "",
  };
}

function formToOportunidade(
  data: MeuOportunidadeEdicaoFormData,
  base: Oportunidade
): Oportunidade {
  const vp = data.valorPremio?.trim();
  const valorPremio =
    vp && !Number.isNaN(parseFloat(vp.replace(",", ".")))
      ? parseFloat(vp.replace(",", "."))
      : undefined;
  return {
    ...base,
    nome: data.nome,
    tipo: data.tipo as TipoOportunidade,
    descricao: data.descricao,
    dataInscricaoInicio: data.dataInscricaoInicio,
    dataInscricaoFim: data.dataInscricaoFim,
    areasInteresse: data.areasInteresse,
    requisitos: data.requisitos?.trim() || undefined,
    valorPremio,
    link: data.link?.trim() || undefined,
  };
}

function EditarMeuOportunidadeForm({
  record,
  id,
}: {
  record: MeuOportunidadeRecord;
  id: string;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<MeuOportunidadeEdicaoFormData>({
    resolver: zodResolver(meuOportunidadeEdicaoSchema),
    defaultValues: recordToFormValues(record),
  });

  const areas = form.watch("areasInteresse");

  const addArea = (a: AreaAtuacao) => {
    const cur = form.getValues("areasInteresse");
    if (cur.includes(a)) return;
    form.setValue("areasInteresse", [...cur, a], { shouldValidate: true });
  };

  const removeArea = (a: AreaAtuacao) => {
    const cur = form.getValues("areasInteresse");
    form.setValue(
      "areasInteresse",
      cur.filter((x) => x !== a),
      { shouldValidate: true }
    );
  };

  const areasDisponiveis = (
    Object.entries(AREA_ATUACAO_LABELS) as [AreaAtuacao, string][]
  ).filter(([k]) => !areas.includes(k));

  const salvar = (status: "draft" | "published") => {
    void form.handleSubmit((data) => {
      upsertMeuOportunidade({
        ...record,
        status,
        oportunidade: formToOportunidade(data, record.oportunidade),
      });
      if (status === "published") router.push(`/oportunidades/${id}`);
    })();
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar oportunidade</CardTitle>
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
                          {Object.entries(TIPO_OPORTUNIDADE_LABELS).map(
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dataInscricaoInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início das inscrições</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataInscricaoFim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fim das inscrições</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="areasInteresse"
                  render={() => (
                    <FormItem>
                      <FormLabel>Áreas de interesse</FormLabel>
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
                  name="requisitos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos (opcional)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valorPremio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do prêmio (R$, opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link oficial (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
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
                <Link href={`/oportunidades/${id}`}>Cancelar</Link>
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
            <AlertDialogTitle>Excluir oportunidade?</AlertDialogTitle>
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
                removeMeuOportunidade(id);
                router.push("/oportunidades/meus");
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

export default function EditarMeuOportunidadePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [tick, setTick] = useState(0);

  useEffect(
    () => subscribeMeusOportunidadesChanged(() => setTick((t) => t + 1)),
    []
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, router]);

  const record = useMemo(() => {
    void tick;
    return getMeuOportunidadeById(id);
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
            <Link href="/oportunidades/meus" className="hover:text-foreground">
              Minhas oportunidades
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Editar</span>
          </nav>
        </div>
      </div>
      <EditarMeuOportunidadeForm record={record} id={id} />
    </div>
  );
}
