"use client";

import { useAuth } from "@/components/auth-provider";
import { MiniMapWrapper } from "@/app/lugares/[id]/mini-map-wrapper";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { StaticMapPlaceholder } from "@/components/mini-map";
import {
  getMeuEspacoById,
  removeMeuEspaco,
  subscribeMeusEspacosChanged,
  upsertMeuEspaco,
} from "@/lib/meus-espacos-storage";
import {
  AREA_ATUACAO_LABELS,
  TIPO_LUGAR_LABELS,
  type AreaAtuacao,
  type Lugar,
  type MeuEspacoRecord,
} from "@/lib/types";
import {
  espacoEdicaoFormSchema,
  validateEspacoForPublish,
  type EspacoEdicaoFormData,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

function recordToFormValues(rec: MeuEspacoRecord): EspacoEdicaoFormData {
  const l = rec.lugar;
  return {
    nome: l.nome,
    tipo: l.tipo,
    descricao: l.descricao,
    areasAtuacao: [...l.areasAtuacao],
    website: l.website ?? "",
    logradouro: l.endereco.logradouro,
    numero: l.endereco.numero,
    bairro: l.endereco.bairro,
    cidade: l.endereco.cidade,
    estado: l.endereco.estado,
    cep: l.endereco.cep,
    acessibilidade: l.acessibilidade,
    telefone: l.telefone ?? "",
    email: l.email ?? "",
    horarioFuncionamento: l.horarioFuncionamento ?? "",
    lat: l.coordenadas != null ? String(l.coordenadas.lat) : "",
    lng: l.coordenadas != null ? String(l.coordenadas.lng) : "",
    instagram: l.redesSociais?.instagram ?? "",
    facebook: l.redesSociais?.facebook ?? "",
    twitter: l.redesSociais?.twitter ?? "",
    youtube: l.redesSociais?.youtube ?? "",
  };
}

function formToLugar(
  data: EspacoEdicaoFormData,
  rec: MeuEspacoRecord
): Lugar {
  const latStr = (data.lat ?? "").trim().replace(",", ".");
  const lngStr = (data.lng ?? "").trim().replace(",", ".");
  const latNum = parseFloat(latStr);
  const lngNum = parseFloat(lngStr);
  const redes =
    data.instagram ||
    data.facebook ||
    data.twitter ||
    data.youtube
      ? {
          instagram: data.instagram || undefined,
          facebook: data.facebook || undefined,
          twitter: data.twitter || undefined,
          youtube: data.youtube || undefined,
        }
      : undefined;

  return {
    ...rec.lugar,
    nome: data.nome,
    tipo: data.tipo,
    descricao: data.descricao,
    areasAtuacao: data.areasAtuacao,
    website: (data.website ?? "").trim() || undefined,
    endereco: {
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado.toUpperCase().slice(0, 2),
      cep: data.cep,
    },
    acessibilidade: data.acessibilidade,
    telefone: data.telefone?.trim() || undefined,
    email: data.email?.trim() || undefined,
    horarioFuncionamento: data.horarioFuncionamento?.trim() || undefined,
    coordenadas:
      !Number.isNaN(latNum) &&
      !Number.isNaN(lngNum) &&
      latStr !== "" &&
      lngStr !== ""
        ? { lat: latNum, lng: lngNum }
        : undefined,
    redesSociais: redes,
  };
}

function EditarEspacoForm({
  record,
  id,
}: {
  record: MeuEspacoRecord;
  id: string;
}) {
  const router = useRouter();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<EspacoEdicaoFormData>({
    resolver: zodResolver(espacoEdicaoFormSchema),
    defaultValues: recordToFormValues(record),
  });

  const areas = form.watch("areasAtuacao");
  const descricaoLen = form.watch("descricao")?.length ?? 0;
  const latVal = form.watch("lat");
  const lngVal = form.watch("lng");

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

  const persist = (status: MeuEspacoRecord["status"]) => {
    void form.handleSubmit((data) => {
      if (status === "published") {
        const err = validateEspacoForPublish(data);
        if (err) {
          setPublishError(err);
          return;
        }
      }
      setPublishError(null);
      const lugar = formToLugar(data, record);
      upsertMeuEspaco({
        ...record,
        status,
        lugar,
      });
    })();
  };

  const latNum = parseFloat(String(latVal).replace(",", "."));
  const lngNum = parseFloat(String(lngVal).replace(",", "."));
  const showMap =
    !Number.isNaN(latNum) &&
    !Number.isNaN(lngNum) &&
    String(latVal).trim() !== "" &&
    String(lngVal).trim() !== "";

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/lugares" className="hover:text-foreground">
              Espaços
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/lugares/${id}`} className="hover:text-foreground">
              {record.lugar.nome}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Editar</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Edição do espaço
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Informações de apresentação, endereço e acessibilidade.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {record.status === "draft" && (
          <div
            className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
            role="status"
          >
            Este espaço está em rascunho. Publique para exibi-lo no catálogo
            público.
          </div>
        )}

        {publishError && (
          <div
            className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {publishError}
          </div>
        )}

        <Form {...form}>
          <form className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de apresentação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do espaço</FormLabel>
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
                        <FormLabel>Tipo do espaço</FormLabel>
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
                            {Object.entries(TIPO_LUGAR_LABELS).map(
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
                          <Textarea className="min-h-[140px]" {...field} />
                        </FormControl>
                        <p
                          className="text-muted-foreground text-right text-xs"
                          aria-live="polite"
                        >
                          {descricaoLen}/2000
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site ou página do espaço</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://"
                            {...field}
                          />
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
                                className="rounded-full p-0.5 hover:bg-primary/20"
                                onClick={() => removeArea(a)}
                                aria-label={`Remover ${AREA_ATUACAO_LABELS[a]}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                        {areasDisponiveis.length > 0 ? (
                          <Select
                            key={areas.join(",")}
                            onValueChange={(v) => addArea(v as AreaAtuacao)}
                          >
                            <SelectTrigger className="mt-2 border-dashed">
                              <Plus className="mr-2 h-4 w-4" />
                              <SelectValue placeholder="Adicionar área" />
                            </SelectTrigger>
                            <SelectContent>
                              {areasDisponiveis.map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : null}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Collapsible className="rounded-lg border border-border">
                    <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50">
                      Redes sociais (opcional)
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 border-t border-border px-4 py-4">
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="@usuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter / X</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube</FormLabel>
                            <FormControl>
                              <Input placeholder="Canal ou URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endereço do espaço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
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
                          <FormLabel>UF</FormLabel>
                          <FormControl>
                            <Input maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logradouro</FormLabel>
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
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Município</FormLabel>
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
                      name="lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="-5.0892" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="-42.8019" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Informe latitude e longitude para exibir o mapa na página
                    pública.
                  </p>
                  <div className="overflow-hidden rounded-lg border border-border">
                    {showMap ? (
                      <MiniMapWrapper
                        lat={latNum}
                        lng={lngNum}
                        nome={form.watch("nome") || "Local"}
                        className="h-[220px]"
                      />
                    ) : (
                      <StaticMapPlaceholder nome="Defina coordenadas para o mapa" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contato e horário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="horarioFuncionamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de funcionamento</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Acessibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="acessibilidade"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div>
                          <FormLabel className="font-normal">
                            Espaço com recursos de acessibilidade
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>

      <footer className="border-border bg-primary text-primary-foreground fixed bottom-0 left-0 right-0 z-40 border-t shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="gap-2 bg-orange-500/90 text-white hover:bg-orange-500"
              disabled
              title="Em breve"
            >
              Arquivar
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => router.push(`/lugares/${id}`)}
            >
              Sair
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => persist(record.status)}
            >
              Salvar
            </Button>
            <Button
              type="button"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => persist("published")}
            >
              Salvar e publicar
            </Button>
          </div>
        </div>
      </footer>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir espaço?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O espaço será removido deste
              dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                removeMeuEspaco(id);
                router.push("/lugares/meus");
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function EditarEspacoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeMeusEspacosChanged(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, router]);

  const record = useMemo(() => {
    void tick;
    return getMeuEspacoById(id);
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
    <EditarEspacoForm
      key={`${record.id}-${record.updatedAt}`}
      record={record}
      id={id}
    />
  );
}
