"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronRight,
  MapPin,
  CalendarDays,
  Lightbulb,
  FolderKanban,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TIPO_LUGAR_LABELS,
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  TIPO_OPORTUNIDADE_LABELS,
  TIPO_PROJETO_LABELS,
} from "@/lib/types";
import {
  lugarSchema,
  eventoSchema,
  oportunidadeSchema,
  projetoSchema,
  type LugarFormData,
  type EventoFormData,
  type OportunidadeFormData,
  type ProjetoFormData,
} from "@/lib/validations";
import { mockLugares } from "@/lib/mock-data";

export default function CadastrarPage() {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);

  // Lugar Form
  const lugarForm = useForm<LugarFormData>({
    resolver: zodResolver(lugarSchema),
    defaultValues: {
      nome: "",
      tipo: "",
      descricao: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      acessibilidade: false,
      areasAtuacao: [],
      telefone: "",
      email: "",
      website: "",
      horarioFuncionamento: "",
    },
  });

  // Evento Form
  const eventoForm = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      horario: "",
      lugarId: "",
      usarEnderecoCustom: false,
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      classificacao: "livre",
      entrada: "gratuito",
      preco: undefined,
      areasAtuacao: [],
      tags: "",
    },
  });

  // Oportunidade Form
  const oportunidadeForm = useForm<OportunidadeFormData>({
    resolver: zodResolver(oportunidadeSchema),
    defaultValues: {
      nome: "",
      tipo: "",
      descricao: "",
      dataInscricaoInicio: "",
      dataInscricaoFim: "",
      areasInteresse: [],
      requisitos: "",
      valorPremio: undefined,
      link: "",
    },
  });

  // Projeto Form
  const projetoForm = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      nome: "",
      tipo: "",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      areasAtuacao: [],
      responsavel: "",
      parceiros: "",
    },
  });

  const onLugarSubmit = (data: LugarFormData) => {
    console.log("Lugar:", data);
    setSuccess("lugar");
    setTimeout(() => router.push("/lugares"), 2000);
  };

  const onEventoSubmit = (data: EventoFormData) => {
    console.log("Evento:", data);
    setSuccess("evento");
    setTimeout(() => router.push("/eventos"), 2000);
  };

  const onOportunidadeSubmit = (data: OportunidadeFormData) => {
    console.log("Oportunidade:", data);
    setSuccess("oportunidade");
    setTimeout(() => router.push("/oportunidades"), 2000);
  };

  const onProjetoSubmit = (data: ProjetoFormData) => {
    console.log("Projeto:", data);
    setSuccess("projeto");
    setTimeout(() => router.push("/projetos"), 2000);
  };

  const watchUsarEnderecoCustom = eventoForm.watch("usarEnderecoCustom");
  const watchEntrada = eventoForm.watch("entrada");

  if (success) {
    const labels: Record<string, string> = {
      lugar: "Espaço",
      evento: "Evento",
      oportunidade: "Oportunidade",
      projeto: "Projeto",
    };
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {labels[success]} cadastrado!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Seu cadastro foi realizado com sucesso. Redirecionando...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Cadastrar</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Cadastrar Novo Conteúdo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Contribua com o mapeamento cultural da cidade
          </p>
        </div>

        <Tabs defaultValue="lugar" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="lugar" className="gap-2">
              <MapPin className="h-4 w-4" />
              Espaço
            </TabsTrigger>
            <TabsTrigger value="evento" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Evento
            </TabsTrigger>
            <TabsTrigger value="oportunidade" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Oportunidade
            </TabsTrigger>
            <TabsTrigger value="projeto" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Projeto
            </TabsTrigger>
          </TabsList>

          {/* Lugar/Espaço Form */}
          <TabsContent value="lugar">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Espaço Cultural</CardTitle>
                <CardDescription>
                  Cadastre um espaço cultural como praças, teatros, museus, centros culturais, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...lugarForm}>
                  <form onSubmit={lugarForm.handleSubmit(onLugarSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={lugarForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Espaço *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Praça da Bandeira" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={lugarForm.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TIPO_LUGAR_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={lugarForm.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o espaço, sua história, características..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h3 className="font-medium">Endereço</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <FormField
                            control={lugarForm.control}
                            name="logradouro"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logradouro *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Rua, Avenida, Praça..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={lugarForm.control}
                          name="numero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nº ou S/N" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-4">
                        <FormField
                          control={lugarForm.control}
                          name="bairro"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={lugarForm.control}
                          name="cidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={lugarForm.control}
                          name="estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado *</FormLabel>
                              <FormControl>
                                <Input placeholder="UF" maxLength={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={lugarForm.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP *</FormLabel>
                              <FormControl>
                                <Input placeholder="00000-000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={lugarForm.control}
                      name="acessibilidade"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Acessibilidade</FormLabel>
                            <FormDescription>
                              O espaço possui acessibilidade para pessoas com deficiência?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={lugarForm.control}
                      name="areasAtuacao"
                      render={() => (
                        <FormItem>
                          <FormLabel>Áreas de Atuação *</FormLabel>
                          <FormDescription>
                            Selecione as áreas culturais relacionadas ao espaço
                          </FormDescription>
                          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {Object.entries(AREA_ATUACAO_LABELS).map(([value, label]) => (
                              <FormField
                                key={value}
                                control={lugarForm.control}
                                name="areasAtuacao"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(value)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...field.value, value]);
                                          } else {
                                            field.onChange(
                                              field.value?.filter((v) => v !== value)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={lugarForm.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 0000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={lugarForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contato@espaco.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={lugarForm.control}
                      name="horarioFuncionamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Funcionamento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Seg-Sex: 9h às 18h" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Cadastrar Espaço
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evento Form */}
          <TabsContent value="evento">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Evento</CardTitle>
                <CardDescription>
                  Cadastre um evento cultural como shows, exposições, festivais, oficinas, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...eventoForm}>
                  <form onSubmit={eventoForm.handleSubmit(onEventoSubmit)} className="space-y-6">
                    <FormField
                      control={eventoForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Evento *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Festival de Inverno" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={eventoForm.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o evento, programação, atrações..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={eventoForm.control}
                        name="dataInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Início *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventoForm.control}
                        name="dataFim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Término</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventoForm.control}
                        name="horario"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={eventoForm.control}
                      name="usarEnderecoCustom"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Endereço Personalizado</FormLabel>
                            <FormDescription>
                              Use um endereço que não está cadastrado na plataforma
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!watchUsarEnderecoCustom ? (
                      <FormField
                        control={eventoForm.control}
                        name="lugarId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local do Evento</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um local cadastrado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockLugares.map((lugar) => (
                                  <SelectItem key={lugar.id} value={lugar.id}>
                                    {lugar.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="space-y-4 rounded-lg border p-4">
                        <h4 className="font-medium">Endereço do Evento</h4>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <FormField
                              control={eventoForm.control}
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
                          </div>
                          <FormField
                            control={eventoForm.control}
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
                        </div>
                        <div className="grid gap-4 md:grid-cols-4">
                          <FormField
                            control={eventoForm.control}
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
                          <FormField
                            control={eventoForm.control}
                            name="cidade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={eventoForm.control}
                            name="estado"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                  <Input maxLength={2} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={eventoForm.control}
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
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={eventoForm.control}
                        name="classificacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classificação Etária *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(CLASSIFICACAO_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventoForm.control}
                        name="entrada"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entrada *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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

                    {watchEntrada === "pago" && (
                      <FormField
                        control={eventoForm.control}
                        name="preco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0,00"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={eventoForm.control}
                      name="areasAtuacao"
                      render={() => (
                        <FormItem>
                          <FormLabel>Áreas de Atuação *</FormLabel>
                          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {Object.entries(AREA_ATUACAO_LABELS).map(([value, label]) => (
                              <FormField
                                key={value}
                                control={eventoForm.control}
                                name="areasAtuacao"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(value)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...field.value, value]);
                                          } else {
                                            field.onChange(
                                              field.value?.filter((v) => v !== value)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={eventoForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: música, festival, gratuito (separadas por vírgula)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Palavras-chave para facilitar a busca
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Cadastrar Evento
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Oportunidade Form */}
          <TabsContent value="oportunidade">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Oportunidade</CardTitle>
                <CardDescription>
                  Cadastre editais, concursos, prêmios, oficinas, residências e outras oportunidades.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...oportunidadeForm}>
                  <form onSubmit={oportunidadeForm.handleSubmit(onOportunidadeSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={oportunidadeForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Edital de Fomento 2026" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={oportunidadeForm.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TIPO_OPORTUNIDADE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={oportunidadeForm.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva a oportunidade, objetivos, público-alvo..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={oportunidadeForm.control}
                        name="dataInscricaoInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Início das Inscrições *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={oportunidadeForm.control}
                        name="dataInscricaoFim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fim das Inscrições *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={oportunidadeForm.control}
                      name="areasInteresse"
                      render={() => (
                        <FormItem>
                          <FormLabel>Áreas de Interesse *</FormLabel>
                          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {Object.entries(AREA_ATUACAO_LABELS).map(([value, label]) => (
                              <FormField
                                key={value}
                                control={oportunidadeForm.control}
                                name="areasInteresse"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(value)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...field.value, value]);
                                          } else {
                                            field.onChange(
                                              field.value?.filter((v) => v !== value)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={oportunidadeForm.control}
                      name="requisitos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requisitos</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva os requisitos para participação..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={oportunidadeForm.control}
                        name="valorPremio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor do Prêmio (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0,00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={oportunidadeForm.control}
                        name="link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link Oficial</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Cadastrar Oportunidade
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projeto Form */}
          <TabsContent value="projeto">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Projeto</CardTitle>
                <CardDescription>
                  Cadastre projetos culturais como intercâmbios, oficinas, festivais, pesquisas, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...projetoForm}>
                  <form onSubmit={projetoForm.handleSubmit(onProjetoSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={projetoForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Projeto *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Escola de Artes Cênicas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={projetoForm.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TIPO_PROJETO_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={projetoForm.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o projeto, seus objetivos, metodologia..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={projetoForm.control}
                      name="responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do responsável ou organização" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={projetoForm.control}
                        name="dataInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Início</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={projetoForm.control}
                        name="dataFim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Término</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={projetoForm.control}
                      name="areasAtuacao"
                      render={() => (
                        <FormItem>
                          <FormLabel>Áreas de Atuação *</FormLabel>
                          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {Object.entries(AREA_ATUACAO_LABELS).map(([value, label]) => (
                              <FormField
                                key={value}
                                control={projetoForm.control}
                                name="areasAtuacao"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(value)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...field.value, value]);
                                          } else {
                                            field.onChange(
                                              field.value?.filter((v) => v !== value)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={projetoForm.control}
                      name="parceiros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parceiros</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: UFPI, Secretaria de Cultura (separados por vírgula)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Liste os parceiros do projeto
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Cadastrar Projeto
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
