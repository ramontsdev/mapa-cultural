"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  Camera,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  USER_ROLE_LABELS,
  AREA_ATUACAO_LABELS,
  type UserRole,
  type AreaAtuacao,
} from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
import { perfilSchema, type PerfilFormData } from "@/lib/validations";

export default function PerfilPage() {
  // Simular usuário logado (primeiro usuário mockado)
  const currentUser = mockUsers[0];
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const form = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: currentUser.nome,
      email: currentUser.email,
      telefone: currentUser.telefone || "",
      website: currentUser.website || "",
      cidade: currentUser.cidade || "",
      estado: currentUser.estado || "",
      biografia: currentUser.biografia || "",
      oQueFaz: currentUser.oQueFaz || "",
      tipoAtuacao: currentUser.tipoAtuacao,
      roles: currentUser.roles,
      areasAtuacao: currentUser.areasAtuacao,
      instagram: currentUser.redesSociais?.instagram || "",
      facebook: currentUser.redesSociais?.facebook || "",
      twitter: currentUser.redesSociais?.twitter || "",
    },
  });

  const onSubmit = async (data: PerfilFormData) => {
    setIsSaving(true);
    console.log("Perfil data:", data);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const watchRoles = form.watch("roles");
  const watchAreas = form.watch("areasAtuacao");

  const toggleRole = (role: string) => {
    const current = form.getValues("roles");
    if (current.includes(role)) {
      form.setValue(
        "roles",
        current.filter((r) => r !== role),
        { shouldValidate: true }
      );
    } else {
      form.setValue("roles", [...current, role], { shouldValidate: true });
    }
  };

  const toggleArea = (area: string) => {
    const current = form.getValues("areasAtuacao");
    if (current.includes(area)) {
      form.setValue(
        "areasAtuacao",
        current.filter((a) => a !== area),
        { shouldValidate: true }
      );
    } else {
      form.setValue("areasAtuacao", [...current, area], { shouldValidate: true });
    }
  };

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
            <span className="font-medium text-foreground">Meu Perfil</span>
          </nav>
        </div>
      </div>

      {/* Header com Avatar */}
      <div className="border-b border-border bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Avatar */}
            <div className="relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg">
                <Image
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt={currentUser.nome}
                  fill
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                {form.watch("nome")}
              </h1>
              <p className="mt-1 text-muted-foreground">{form.watch("email")}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
                {watchRoles.slice(0, 3).map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {USER_ROLE_LABELS[role as UserRole]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="dados" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:inline-flex">
                <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
                <TabsTrigger value="areas">Áreas de Atuação</TabsTrigger>
              </TabsList>

              {/* Dados Pessoais */}
              <TabsContent value="dados">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Informações Básicas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-primary" />
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input type="email" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  placeholder="(00) 00000-0000"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  placeholder="https://seusite.com.br"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
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
                          control={form.control}
                          name="estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="UF" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[
                                    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
                                    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
                                    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
                                  ].map((uf) => (
                                    <SelectItem key={uf} value={uf}>
                                      {uf}
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
                        control={form.control}
                        name="tipoAtuacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Atuação</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="individual" id="individual" />
                                  <label htmlFor="individual" className="text-sm">
                                    Individual
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="coletivo" id="coletivo" />
                                  <label htmlFor="coletivo" className="text-sm">
                                    Coletivo
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Sobre Você */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-secondary" />
                        Sobre Você
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="biografia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biografia</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Conte um pouco sobre você, sua trajetória e experiência..."
                                rows={5}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="oQueFaz"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>O que você faz?</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descreva suas atividades, projetos e trabalhos..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 pt-4">
                        <h4 className="font-medium">Redes Sociais</h4>

                        <FormField
                          control={form.control}
                          name="instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instagram</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="@seuinstagram"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
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
                                <div className="relative">
                                  <Facebook className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="seufacebook"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
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
                                <div className="relative">
                                  <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="@seutwitter"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Atribuições */}
              <TabsContent value="atribuicoes">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Suas Atribuições
                      <p className="mt-1 text-sm font-normal text-muted-foreground">
                        Selecione todas as atribuições que se aplicam a você
                      </p>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="roles"
                      render={() => (
                        <FormItem>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                              <div
                                key={value}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                                  watchRoles.includes(value)
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => toggleRole(value)}
                              >
                                <Checkbox
                                  checked={watchRoles.includes(value)}
                                  onCheckedChange={() => toggleRole(value)}
                                />
                                <span className="font-medium">{label}</span>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Áreas de Atuação */}
              <TabsContent value="areas">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Áreas de Atuação
                      <p className="mt-1 text-sm font-normal text-muted-foreground">
                        Selecione as áreas culturais em que você atua
                      </p>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="areasAtuacao"
                      render={() => (
                        <FormItem>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(AREA_ATUACAO_LABELS).map(
                              ([value, label]) => (
                                <div
                                  key={value}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                                    watchAreas.includes(value)
                                      ? "border-secondary bg-secondary/5"
                                      : "border-border hover:border-secondary/50"
                                  }`}
                                  onClick={() => toggleArea(value)}
                                >
                                  <Checkbox
                                    checked={watchAreas.includes(value)}
                                    onCheckedChange={() => toggleArea(value)}
                                  />
                                  <span className="font-medium">{label}</span>
                                </div>
                              )
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="sticky bottom-4 mt-8 flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSaving}
                className="shadow-lg"
              >
                {isSaving ? (
                  <>Salvando...</>
                ) : saved ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
