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
  getMeuAgenteById,
  removeMeuAgente,
  subscribeMeusAgentesChanged,
  upsertMeuAgente,
} from "@/lib/meus-agentes-storage";
import {
  AREA_ATUACAO_LABELS,
  type AreaAtuacao,
  type MeuAgenteRecord,
  type User,
} from "@/lib/types";
import {
  meuAgenteEdicaoSchema,
  type MeuAgenteEdicaoFormData,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

function recordToFormValues(rec: MeuAgenteRecord): MeuAgenteEdicaoFormData {
  const a = rec.agente;
  const email =
    a.email.endsWith("@cadastro-local.mapa-cultural.invalid") ? "" : a.email;
  return {
    nome: a.nome,
    tipoAtuacao: a.tipoAtuacao,
    email,
    biografia: a.biografia ?? "",
    areasAtuacao: [...a.areasAtuacao],
    cidade: a.cidade ?? "",
    estado: a.estado ?? "",
    oQueFaz: a.oQueFaz ?? "",
  };
}

function formToAgente(data: MeuAgenteEdicaoFormData, base: User): User {
  const idEmail =
    data.email?.trim() ||
    base.email ||
    `agente-${base.id}@cadastro-local.mapa-cultural.invalid`;
  return {
    ...base,
    nome: data.nome,
    tipoAtuacao: data.tipoAtuacao,
    email: idEmail,
    biografia: data.biografia?.trim() || undefined,
    areasAtuacao: data.areasAtuacao,
    cidade: data.cidade?.trim() || undefined,
    estado: data.estado?.trim().toUpperCase().slice(0, 2) || undefined,
    oQueFaz: data.oQueFaz?.trim() || undefined,
  };
}

function EditarMeuAgenteForm({
  record,
  id,
}: {
  record: MeuAgenteRecord;
  id: string;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<MeuAgenteEdicaoFormData>({
    resolver: zodResolver(meuAgenteEdicaoSchema),
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
      upsertMeuAgente({
        ...record,
        status,
        agente: formToAgente(data, record.agente),
      });
      if (status === "published") router.push(`/usuarios/${id}`);
    })();
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar agente</CardTitle>
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
                      <FormLabel>E-mail (opcional)</FormLabel>
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
                <Link href={`/usuarios/${id}`}>Cancelar</Link>
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
            <AlertDialogTitle>Excluir agente?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove o perfil deste dispositivo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                removeMeuAgente(id);
                router.push("/usuarios/meus");
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

export default function EditarMeuAgentePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [tick, setTick] = useState(0);

  useEffect(
    () => subscribeMeusAgentesChanged(() => setTick((t) => t + 1)),
    []
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, router]);

  const record = useMemo(() => {
    void tick;
    return getMeuAgenteById(id);
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
            <Link href="/usuarios/meus" className="hover:text-foreground">
              Meus agentes
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Editar</span>
          </nav>
        </div>
      </div>
      <EditarMeuAgenteForm record={record} id={id} />
    </div>
  );
}
