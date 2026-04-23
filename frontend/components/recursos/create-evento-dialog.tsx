"use client";

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
import {
  buildNewMeuEventoRecord,
  upsertMeuEvento,
} from "@/lib/meus-eventos-storage";
import {
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  type AreaAtuacao,
} from "@/lib/types";
import {
  criarEventoRapidoSchema,
  type CriarEventoRapidoFormData,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriadoRascunho: (id: string) => void;
  onCriadoPublicado: (id: string) => void;
};

export function CreateEventoDialog({
  open,
  onOpenChange,
  onCriadoRascunho,
  onCriadoPublicado,
}: Props) {
  const form = useForm<CriarEventoRapidoFormData>({
    resolver: zodResolver(criarEventoRapidoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      dataInicio: "",
      horario: "",
      classificacao: "livre",
      entrada: "gratuito",
      preco: "",
      areasAtuacao: [],
    },
  });

  const areas = form.watch("areasAtuacao");
  const entrada = form.watch("entrada");
  const descricao = form.watch("descricao");

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

  const submit = (status: "draft" | "published") => {
    void form.handleSubmit((data) => {
      const preco =
        data.entrada === "pago" && data.preco?.trim()
          ? parseFloat(data.preco.replace(",", "."))
          : undefined;
      const record = buildNewMeuEventoRecord(
        {
          nome: data.nome,
          descricao: data.descricao,
          dataInicio: data.dataInicio,
          horario: data.horario,
          classificacao: data.classificacao,
          entrada: data.entrada,
          preco,
          areasAtuacao: data.areasAtuacao,
        },
        status
      );
      upsertMeuEvento(record);
      form.reset({
        nome: "",
        descricao: "",
        dataInicio: "",
        horario: "",
        classificacao: "livre",
        entrada: "gratuito",
        preco: "",
        areasAtuacao: [],
      });
      onOpenChange(false);
      if (status === "draft") onCriadoRascunho(record.id);
      else onCriadoPublicado(record.id);
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[100dvh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90vh] sm:max-w-lg sm:rounded-lg">
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
            </form>
          </Form>
        </div>

        <DialogFooter className="border-border bg-muted/30 gap-2 border-t p-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="order-last sm:order-first"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => submit("draft")}
            >
              Criar em rascunho
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => submit("published")}
            >
              Criar e publicar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
