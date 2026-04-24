"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCreateEvent } from "@/hooks/api/use-events";
import { useMySpaces } from "@/hooks/api/use-spaces";
import { createEventOccurrence } from "@/lib/api/events";
import { ApiError } from "@/lib/api/http";
import { formatMetadata } from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  type AreaAtuacao,
} from "@/lib/types";
import {
  criarEventoRapidoSchema,
  type CriarEventoRapidoFormData,
} from "@/lib/validations";
import { z } from "zod";

const criarEventoRapidoDialogSchema = criarEventoRapidoSchema.extend({
  imagem: z
    .string()
    .optional()
    .refine(
      (s) => !s?.trim() || /^https?:\/\//i.test(s.trim()),
      "URL da imagem inválida",
    ),
});

type CriarEventoRapidoDialogFormData = CriarEventoRapidoFormData & {
  spaceId?: string;
  imagem?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriado: (id: string) => void;
};

export function CreateEventoDialog({ open, onOpenChange, onCriado }: Props) {
  const createMutation = useCreateEvent();
  const mySpacesQuery = useMySpaces({ pageSize: 50 });

  const form = useForm<CriarEventoRapidoDialogFormData>({
    resolver: zodResolver(criarEventoRapidoDialogSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      dataInicio: "",
      horario: "",
      classificacao: "livre",
      entrada: "gratuito",
      preco: "",
      areasAtuacao: [],
      spaceId: "",
      imagem: "",
    },
  });

  const spaceId = form.watch("spaceId");

  const areas = form.watch("areasAtuacao");
  const entrada = form.watch("entrada");
  const descricao = form.watch("descricao");
  const dataInicio = form.watch("dataInicio");
  const horario = form.watch("horario");

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

  const submit = () => {
    void form.handleSubmit(async (data) => {
      try {
        const shortDescription = formatMetadata(data.descricao, {
          dataInicio: data.dataInicio,
          horario: data.horario,
          classificacao: data.classificacao,
          entrada: data.entrada,
          preco: data.entrada === "pago" ? data.preco : undefined,
          areas: data.areasAtuacao.join(","),
          imagem: data.imagem?.trim() || undefined,
        });

        const event = await createMutation.mutateAsync({
          name: data.nome,
          shortDescription,
        });

        if (data.spaceId) {
          try {
            const untilIso = data.dataInicio
              ? new Date(`${data.dataInicio}T23:59:59Z`).toISOString()
              : new Date().toISOString();
            await createEventOccurrence(event.id, {
              spaceId: data.spaceId,
              rule: JSON.stringify({
                frequency: "once",
                startsOn: data.dataInicio,
                startsAt: data.horario,
              }),
              startsOn: data.dataInicio || undefined,
              startsAt: data.horario || undefined,
              frequency: "once",
              separation: 1,
              until: untilIso,
              timezoneName: "America/Sao_Paulo",
            });
          } catch (error) {
            toast.warning(
              `Evento criado, mas não foi possível registrar a ocorrência: ${
                error instanceof ApiError ? error.message : "erro"
              }`,
            );
          }
        }

        toast.success("Evento criado.");
        form.reset({
          nome: "",
          descricao: "",
          dataInicio: "",
          horario: "",
          classificacao: "livre",
          entrada: "gratuito",
          preco: "",
          areasAtuacao: [],
          spaceId: "",
          imagem: "",
        });
        onOpenChange(false);
        onCriado(event.id);
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível criar o evento.",
        );
      }
    })();
  };

  const mySpaces = mySpacesQuery.data?.items ?? [];
  const canSubmitOccurrence = !spaceId || (dataInicio && horario);
  const isSubmitting = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-dvh w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90vh] sm:max-w-lg sm:rounded-lg">
        <div className="overflow-y-auto p-6 pb-4">
          <DialogHeader>
            <DialogTitle>Criar evento</DialogTitle>
            <DialogDescription>
              Informações básicas. Você poderá complementar depois na edição.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="mt-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do evento" {...field} />
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
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="spaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Espaço (opcional)</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? "" : v)
                      }
                      value={field.value ? field.value : "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um espaço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sem espaço</SelectItem>
                        {mySpaces.map((space) => (
                          <SelectItem key={space.id} value={space.id}>
                            {space.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Ao selecionar um espaço, será criada uma ocorrência
                      vinculando data/horário ao espaço.
                    </p>
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
                          {Object.entries(CLASSIFICACAO_LABELS).map(
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
                          <SelectItem value="gratuito">Gratuito</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
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
                        <Input placeholder="0,00" {...field} />
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

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição curta</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px]"
                        maxLength={400}
                        {...field}
                      />
                    </FormControl>
                    <p
                      className="text-muted-foreground text-right text-xs"
                      aria-live="polite"
                    >
                      {descricao.length}/400
                    </p>
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
        </div>

        <DialogFooter className="border-border bg-muted/30 gap-2 border-t p-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="order-last sm:order-first"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={isSubmitting || !canSubmitOccurrence}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando…
              </>
            ) : (
              "Criar evento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
