"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiError } from "@/lib/api/http";
import {
  cadastroSchema,
  loginSchema,
  type CadastroFormData,
  type LoginFormData,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  IdCard,
  Loader2,
  Lock,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CadastroPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showTermos, setShowTermos] = useState(false);
  const [showPrivacidade, setShowPrivacidade] = useState(false);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo!</h2>
            <p className="mt-2 text-muted-foreground">
              Você será redirecionado para seu perfil...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">
              {isLogin ? "Entrar" : "Cadastrar"}
            </span>
          </nav>
        </div>
      </div>

      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-primary via-secondary to-accent">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mapa Cultural</h1>
            <p className="mt-1 text-muted-foreground">
              {isLogin ? "Entre na sua conta" : "Crie sua conta e faça parte"}
            </p>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex gap-2">
                <Button
                  variant={isLogin ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setIsLogin(true)}
                  type="button"
                >
                  Entrar
                </Button>
                <Button
                  variant={!isLogin ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setIsLogin(false)}
                  type="button"
                >
                  Cadastrar
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {isLogin ? (
                <LoginForm onSuccess={() => setSuccess(true)} />
              ) : (
                <SignupForm
                  onShowTermos={() => setShowTermos(true)}
                  onShowPrivacidade={() => setShowPrivacidade(true)}
                />
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Não tem conta? " : "Já tem uma conta? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:underline"
              type="button"
            >
              {isLogin ? "Cadastre-se" : "Entre aqui"}
            </button>
          </p>
        </div>
      </div>

      <Dialog open={showTermos} onOpenChange={setShowTermos}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Termos de Uso</DialogTitle>
            <DialogDescription>
              Leia atentamente os termos de uso da plataforma
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Aceitação dos Termos</strong>
                <br />
                Ao acessar e usar a plataforma Mapa Cultural, você concorda em
                cumprir estes termos de serviço, todas as leis e regulamentos
                aplicáveis.
              </p>
              <p>
                <strong className="text-foreground">2. Uso da Plataforma</strong>
                <br />
                A plataforma é destinada ao mapeamento colaborativo de agentes
                culturais, espaços e eventos. Os usuários se comprometem a
                fornecer informações verdadeiras e atualizadas.
              </p>
              <p>
                <strong className="text-foreground">3. Cadastro de Conteúdo</strong>
                <br />
                Ao cadastrar lugares, eventos ou informações na plataforma, você
                declara que tem autorização para divulgar tais informações e que
                elas são verídicas.
              </p>
              <p>
                <strong className="text-foreground">4. Responsabilidades</strong>
                <br />
                Os usuários são responsáveis pelo conteúdo que publicam. A
                plataforma não se responsabiliza por informações incorretas ou
                desatualizadas cadastradas por terceiros.
              </p>
              <p>
                <strong className="text-foreground">5. Propriedade Intelectual</strong>
                <br />
                O conteúdo cadastrado na plataforma pode ser utilizado para fins
                de divulgação cultural, respeitando os direitos autorais dos
                criadores.
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacidade} onOpenChange={setShowPrivacidade}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Política de Privacidade</DialogTitle>
            <DialogDescription>
              Saiba como tratamos seus dados pessoais
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Coleta de Dados</strong>
                <br />
                Coletamos informações que você fornece diretamente, como nome,
                email, e dados de perfil cultural.
              </p>
              <p>
                <strong className="text-foreground">2. Uso dos Dados</strong>
                <br />
                Seus dados são utilizados para: identificação na plataforma,
                comunicação sobre eventos e atualizações, e melhoria dos
                serviços.
              </p>
              <p>
                <strong className="text-foreground">3. Compartilhamento</strong>
                <br />
                Informações públicas do seu perfil (nome, biografia, áreas de
                atuação) podem ser visualizadas por outros usuários. Dados
                sensíveis como email e telefone só são compartilhados com seu
                consentimento.
              </p>
              <p>
                <strong className="text-foreground">4. Segurança</strong>
                <br />
                Implementamos medidas de segurança para proteger suas
                informações contra acesso não autorizado.
              </p>
              <p>
                <strong className="text-foreground">5. Seus Direitos</strong>
                <br />
                Você pode solicitar acesso, correção ou exclusão dos seus dados
                a qualquer momento através das configurações do seu perfil ou
                entrando em contato conosco.
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { signIn } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await signIn({ email: data.email, password: data.senha });
      onSuccess();
      setTimeout(() => {
        router.push("/usuarios/meus");
      }, 800);
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          error.status === 401 &&
          error.message.toLowerCase().includes("verific")
        ) {
          toast.error("E-mail ainda não foi verificado. Enviamos um novo código.");
          router.push(
            `/cadastro/confirmar-email?email=${encodeURIComponent(data.email)}`,
          );
          return;
        }
        toast.error(error.message);
      } else {
        toast.error("Não foi possível entrar.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
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
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className="pl-10 pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Entrar
          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>

        <div className="text-center">
          <Link
            href="/cadastro/esqueci-senha"
            className="text-sm text-primary hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </form>
    </Form>
  );
}

function SignupForm({
  onShowTermos,
  onShowPrivacidade,
}: {
  onShowTermos: () => void;
  onShowPrivacidade: () => void;
}) {
  const { signUp } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      email: "",
      documento: "",
      senha: "",
      confirmarSenha: "",
      isBrasileiro: false,
      aceitouTermos: false,
    },
  });

  const onSubmit = async (data: CadastroFormData) => {
    setIsSubmitting(true);
    try {
      await signUp({
        name: data.nome,
        email: data.email,
        document: data.documento.replace(/\D/g, ""),
        password: data.senha,
        passwordConfirmation: data.confirmarSenha,
      });
      toast.success("Cadastro realizado! Confirme seu e-mail para entrar.");
      router.push(
        `/cadastro/confirmar-email?email=${encodeURIComponent(data.email)}`,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors();
        for (const [fieldName, message] of Object.entries(fieldErrors)) {
          const targetField = fieldName === "document" ? "documento" : fieldName;
          form.setError(targetField as keyof CadastroFormData, {
            type: "server",
            message,
          });
        }
        toast.error(error.message);
      } else {
        toast.error("Não foi possível concluir o cadastro.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
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
          name="documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <div className="relative">
                  <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    autoComplete="off"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
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
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className="pl-10 pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmarSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    autoComplete="new-password"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 pt-2">
          <FormField
            control={form.control}
            name="isBrasileiro"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-muted-foreground">
                    Declaro que sou brasileiro(a) ou resido no Brasil
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aceitouTermos"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-muted-foreground">
                    Li e aceito os{" "}
                    <button
                      type="button"
                      onClick={onShowTermos}
                      className="text-primary hover:underline"
                    >
                      Termos de Uso
                    </button>{" "}
                    e a{" "}
                    <button
                      type="button"
                      onClick={onShowPrivacidade}
                      className="text-primary hover:underline"
                    >
                      Política de Privacidade
                    </button>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Criar conta
          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>
    </Form>
  );
}
