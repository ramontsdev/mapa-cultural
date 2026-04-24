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
import { useMyEvents } from "@/hooks/api/use-events";
import { useCreateOpportunity } from "@/hooks/api/use-opportunities";
import { useMyProjects } from "@/hooks/api/use-projects";
import { ApiError } from "@/lib/api/http";
import { formatMetadata } from "@/lib/api/types";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriado: (id: string) => void;
};

type ExtendedFormData = CriarOportunidadeRapidoFormData & {
  objectType: "Event" | "Project";
  objectId: string;
};

export function CreateOportunidadeDialog({
  open,
  onOpenChange,
  onCriado,
}: Props) {
  const createMutation = useCreateOpportunity();
  const myEventsQuery = useMyEvents({ pageSize: 50 });
  const myProjectsQuery = useMyProjects({ pageSize: 50 });

  const form = useForm<ExtendedFormData>({
    resolver: zodResolver(criarOportunidadeRapidoSchema),
    defaultValues: {
      nome: "",
      tipo: "edital",
      descricao: "",
      dataInscricaoInicio: "",
      dataInscricaoFim: "",
      areasInteresse: [],
      objectType: "Event",
      objectId: "",
    },
  });

  const areas = form.watch("areasInteresse");
  const descricao = form.watch("descricao");
  const objectType = form.watch("objectType");
  const objectId = form.watch("objectId");

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
      { shouldValidate: true },
    );
  };

  const areasDisponiveis = (
    Object.entries(AREA_ATUACAO_LABELS) as [AreaAtuacao, string][]
  ).filter(([k]) => !areas.includes(k));

  const options =
    objectType === "Event"
      ? (myEventsQuery.data?.items ?? []).map((e) => ({ id: e.id, name: e.name }))
      : (myProjectsQuery.data?.items ?? []).map((p) => ({
          id: p.id,
          name: p.name,
        }));

  const submit = () => {
    if (!objectId) {
      form.setError("objectId", {
        type: "manual",
        message: "Selecione um evento ou projeto.",
      });
      return;
    }

    void form.handleSubmit(async (data) => {
      try {
        const shortDescription = formatMetadata(data.descricao, {
          tipo: data.tipo,
          areas: data.areasInteresse.join(","),
        });

        const registrationFrom = new Date(
          `${data.dataInscricaoInicio}T00:00:00Z`,
        ).toISOString();
        const registrationTo = new Date(
          `${data.dataInscricaoFim}T23:59:59Z`,
        ).toISOString();

        const opportunity = await createMutation.mutateAsync({
          name: data.nome,
          shortDescription,
          registrationFrom,
          registrationTo,
          objectType: data.objectType,
          objectId: data.objectId,
        });

        toast.success("Oportunidade criada.");
        form.reset({
          nome: "",
          tipo: "edital",
          descricao: "",
          dataInscricaoInicio: "",
          dataInscricaoFim: "",
          areasInteresse: [],
          objectType: "Event",
          objectId: "",
        });
        onOpenChange(false);
        onCriado(opportunity.id);
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível criar a oportunidade.",
        );
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-dvh w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90vh] sm:max-w-lg sm:rounded-lg">
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
                      onValueChange={(v) =>
                        field.onChange(v as TipoOportunidade)
                      }
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
                          ),
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
                  name="objectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vinculado a</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("objectId", "", {
                            shouldValidate: false,
                          });
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Event">Evento</SelectItem>
                          <SelectItem value="Project">Projeto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="objectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {objectType === "Event" ? "Evento" : "Projeto"}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.length === 0 && (
                            <SelectItem value="__empty__" disabled>
                              Nenhum disponível
                            </SelectItem>
                          )}
                          {options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando…
              </>
            ) : (
              "Criar oportunidade"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
