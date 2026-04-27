"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MiniMapWrapper } from "@/app/lugares/[id]/mini-map-wrapper";
import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { EntityMediaManager } from "@/components/media/entity-media-manager";
import { StaticMapPlaceholder } from "@/components/mini-map";
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
import { useMyAgent } from "@/hooks/api/use-agents";
import {
  useDeleteSpace,
  useSpace,
  useUpdateSpace,
} from "@/hooks/api/use-spaces";
import { ApiError } from "@/lib/api/http";
import type { SpaceDTO } from "@/lib/api/types";
import { formatMetadata, mapSpaceToLugar } from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  TIPO_LUGAR_LABELS,
  type AreaAtuacao,
} from "@/lib/types";
import {
  espacoEdicaoFormSchema,
  type EspacoEdicaoFormData,
} from "@/lib/validations";

function spaceToFormValues(space: SpaceDTO): EspacoEdicaoFormData {
  const lugar = mapSpaceToLugar(space);
  return {
    nome: lugar.nome,
    tipo: lugar.tipo,
    descricao: lugar.descricao,
    areasAtuacao: [...lugar.areasAtuacao],
    website: lugar.website ?? "",
    logradouro: lugar.endereco.logradouro,
    numero: lugar.endereco.numero,
    bairro: lugar.endereco.bairro,
    cidade: lugar.endereco.cidade,
    estado: lugar.endereco.estado,
    cep: lugar.endereco.cep,
    acessibilidade: lugar.acessibilidade,
    telefone: lugar.telefone ?? "",
    email: lugar.email ?? "",
    horarioFuncionamento: lugar.horarioFuncionamento ?? "",
    lat: lugar.coordenadas ? String(lugar.coordenadas.lat) : "",
    lng: lugar.coordenadas ? String(lugar.coordenadas.lng) : "",
    instagram: lugar.redesSociais?.instagram ?? "",
    facebook: lugar.redesSociais?.facebook ?? "",
    twitter: lugar.redesSociais?.twitter ?? "",
    youtube: lugar.redesSociais?.youtube ?? "",
    avatarUrl: space.avatarUrl ?? "",
    coverUrl: space.coverUrl ?? "",
  };
}

function formToPayload(data: EspacoEdicaoFormData) {
  const latStr = (data.lat ?? "").trim().replace(",", ".");
  const lngStr = (data.lng ?? "").trim().replace(",", ".");
  const latNum = parseFloat(latStr);
  const lngNum = parseFloat(lngStr);
  const coordsValid =
    !Number.isNaN(latNum) && !Number.isNaN(lngNum) && latStr !== "" && lngStr !== "";

  const shortDescription = formatMetadata(data.descricao, {
    tipo: data.tipo,
    areas: data.areasAtuacao.join(","),
    logradouro: data.logradouro,
    numero: data.numero,
    bairro: data.bairro,
    cidade: data.cidade,
    estado: data.estado.toUpperCase().slice(0, 2),
    cep: data.cep,
    acessibilidade: data.acessibilidade ? "true" : "false",
    telefone: data.telefone?.trim(),
    email: data.email?.trim(),
    website: data.website?.trim(),
    horario: data.horarioFuncionamento?.trim(),
    lat: coordsValid ? String(latNum) : undefined,
    lng: coordsValid ? String(lngNum) : undefined,
    instagram: data.instagram,
    facebook: data.facebook,
    twitter: data.twitter,
    youtube: data.youtube,
  });

  const emptyToNull = (s: string | undefined) => {
    const t = s?.trim();
    return t === "" || t === undefined ? null : t;
  };

  return {
    name: data.nome,
    shortDescription,
    longDescription: data.descricao.trim(),
    avatarUrl: emptyToNull(data.avatarUrl),
    coverUrl: emptyToNull(data.coverUrl),
  };
}

function EditarEspacoForm({ space }: { space: SpaceDTO }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateMutation = useUpdateSpace(space.id);
  const deleteMutation = useDeleteSpace();

  const form = useForm<EspacoEdicaoFormData>({
    resolver: zodResolver(espacoEdicaoFormSchema),
    defaultValues: spaceToFormValues(space),
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
      { shouldValidate: true },
    );
  };

  const areasDisponiveis = (
    Object.entries(AREA_ATUACAO_LABELS) as [AreaAtuacao, string][]
  ).filter(([k]) => !areas.includes(k));

  const persist = form.handleSubmit(async (data) => {
    try {
      await updateMutation.mutateAsync(formToPayload(data));
      toast.success("Espaço atualizado.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar o espaço.",
      );
    }
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(space.id);
      toast.success("Espaço excluído.");
      router.push("/lugares/meus");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível excluir.",
      );
    }
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
            <Link href={`/lugares/${space.id}`} className="hover:text-foreground">
              {space.name}
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
        <Form {...form}>
          <form className="grid gap-8 lg:grid-cols-3" onSubmit={persist}>
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
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da foto de perfil (opcional)</FormLabel>
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
                    name="coverUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da imagem de capa (opcional)</FormLabel>
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

              <EntityMediaManager
                ownerType="SPACE"
                ownerId={space.id}
                media={space.mediaAssets}
              />
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
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteMutation.isPending}
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
              onClick={() => router.push(`/lugares/${space.id}`)}
            >
              Sair
            </Button>
            <Button
              type="button"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={persist}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Salvar
            </Button>
          </div>
        </div>
      </footer>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir espaço?</AlertDialogTitle>
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
    </div>
  );
}

export default function EditarEspacoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const spaceQuery = useSpace(id);
  const meQuery = useMyAgent();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, isAuthLoading, router]);

  const canEdit = useMemo(() => {
    if (!spaceQuery.data || !meQuery.data) return false;
    return spaceQuery.data.agentId === meQuery.data.id;
  }, [spaceQuery.data, meQuery.data]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

  if (spaceQuery.isLoading || meQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <QueryState isLoading={true}>{null}</QueryState>
      </div>
    );
  }

  if (spaceQuery.error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <QueryState
          isLoading={false}
          error={spaceQuery.error}
          onRetry={() => spaceQuery.refetch()}
        >
          {null}
        </QueryState>
      </div>
    );
  }

  if (!spaceQuery.data) {
    notFound();
  }

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Você não tem permissão para editar este espaço.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EditarEspacoForm
      key={`${spaceQuery.data.id}-${spaceQuery.data.updateTimestamp ?? spaceQuery.data.createTimestamp}`}
      space={spaceQuery.data}
    />
  );
}
