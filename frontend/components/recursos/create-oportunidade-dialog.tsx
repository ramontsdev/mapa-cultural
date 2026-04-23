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
  buildNewMeuOportunidadeRecord,
  upsertMeuOportunidade,
} from "@/lib/meus-oportunidades-storage";
import {
  AREA_ATUACAO_LABELS,
  TIPO_OPORTUNIDADE_LABELS,
  type AreaAtuacao,
  type TipoOportunidade,
} from "@/lib/types";
import {
  criarOportunidadeRapidoSchema,
  type CriarOportunidadeRapidoFormData,
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

export function CreateOportunidadeDialog({
  open,
  onOpenChange,
  onCriadoRascunho,
  onCriadoPublicado,
}: Props) {
  const form = useForm<CriarOportunidadeRapidoFormData>({
    resolver: zodResolver(criarOportunidadeRapidoSchema),
    defaultValues: {
      nome: "",
      tipo: "edital",
      descricao: "",
      dataInscricaoInicio: "",
      dataInscricaoFim: "",
      areasInteresse: [],
    },
  });

  const areas = form.watch("areasInteresse");
  const descricao = form.watch("descricao");

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

  const submit = (status: "draft" | "published") => {
    void form.handleSubmit((data) => {
      const record = buildNewMeuOportunidadeRecord(
        {
          nome: data.nome,
          tipo: data.tipo as TipoOportunidade,
          descricao: data.descricao,
          dataInscricaoInicio: data.dataInscricaoInicio,
          dataInscricaoFim: data.dataInscricaoFim,
          areasInteresse: data.areasInteresse,
        },
        status
      );
      upsertMeuOportunidade(record);
      form.reset({
        nome: "",
        tipo: "edital",
        descricao: "",
        dataInscricaoInicio: "",
        dataInscricaoFim: "",
        areasInteresse: [],
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
            <DialogTitle>Criar oportunidade</DialogTitle>
            <DialogDescription>
              Cadastro rápido. Edite depois para requisitos, prêmio e link.
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

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dataInscricaoInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início inscrições</FormLabel>
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
                      <FormLabel>Fim inscrições</FormLabel>
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
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => submit("draft")}
            >
              Criar em rascunho
            </Button>
            <Button type="button" onClick={() => submit("published")}>
              Criar e publicar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
