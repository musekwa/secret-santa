import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import {
  SubmitButton,
  FieldErrorMessage,
} from "@/components/custom-ui/form-elements";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logoImage from "@/assets/images/logo.png";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AuthApi from "@/lib/api/auth.api";

// Zod schema for login validation
const loginSchema = z.object({
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  email: z.email("O email é inválido"),
});

// TypeScript type inferred from the Zod schema for type safety
type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthApi.login(email, password),
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      // Invalidate user query so navbar refetches user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate({ to: "/", replace: true });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        error?.message ||
        "Erro desconhecido";
      console.error("Login error:", error?.response?.data || error);
      toast.error("Erro ao fazer login: " + errorMessage);
    },
  });

  // TanStack Form setup with Zod validation
  const form = useForm({
    defaultValues: {
      password: "",
      email: "",
    } as LoginFormData,
    validators: {
      onChange: ({ value: formValue }) => {
        const result = loginSchema.safeParse(formValue);
        return result.success ? undefined : result.error;
      },
    },
    onSubmit: async ({ value: formValue }) => {
      console.log("Form submitted:", formValue);
      mutate({
        email: formValue.email as string,
        password: formValue.password as string,
      });
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logoImage}
              alt="tecmoza"
              className="w-12 h-12 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-primary dark:text-primary-foreground mb-2">
            AMICULTO
          </CardTitle>
          <CardDescription className="text-center text-sm text-slate-600 dark:text-slate-400">
            Sistema de Gestão de Amigos Ocultos
          </CardDescription>
          <CardDescription className="text-center text-sm text-slate-600 dark:text-slate-400">
            Digite seu email e o código de 6 dígitos enviado para seu email
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="email"
              validators={{
                onChange: z.email("O email é inválido"),
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 block"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`h-12 text-base ${
                      field.state.meta.errors.length > 0
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    disabled={form.state.isSubmitting}
                    autoFocus
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldErrorMessage
                      message={
                        typeof field.state.meta.errors[0] === "string"
                          ? field.state.meta.errors[0]
                          : field.state.meta.errors[0]?.message || ""
                      }
                    />
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: z
                  .string()
                  .min(8, "A senha deve ter pelo menos 8 caracteres"),
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 block"
                  >
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`h-12 text-base ${
                      field.state.meta.errors.length > 0
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    disabled={form.state.isSubmitting}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldErrorMessage
                      message={
                        typeof field.state.meta.errors[0] === "string"
                          ? field.state.meta.errors[0]
                          : field.state.meta.errors[0]?.message || ""
                      }
                    />
                  ) : null}
                </div>
              )}
            </form.Field>

            {/* 
                <form.Field
                  name="otp"
                  validators={{
                    onChange: z.string().length(6, "O código deve ter 6 dígitos"),
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col items-center space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block w-full text-center mb-2">
                        Código de 6 dígitos
                      </label>
                      <InputOTP
                        maxLength={6}
                        value={field.state.value}
                        onChange={(value) => {
                          field.handleChange(value);
                          setOtpValue(value);
                        }}
                        disabled={form.state.isSubmitting}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSeparator />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
    
                      {field.state.meta.errors.length > 0 && (
                        <FieldErrorMessage
                          message={
                            typeof field.state.meta.errors[0] === "string"
                              ? field.state.meta.errors[0]
                              : field.state.meta.errors[0]?.message || ""
                          }
                        />
                      )}
                    </div>
                  )}
                </form.Field> */}

            {/* Submit button */}
            <form.Subscribe
              selector={(state) => ({
                email: state.values.email as string,
                password: state.values.password as string,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ email, password, isSubmitting }) => {
                const isDisabled =
                  !password ||
                  password.trim() === "" ||
                  !email ||
                  email.trim() === "" ||
                  isSubmitting;
                return (
                  <div className="flex justify-center">
                    <SubmitButton
                      buttonType="submit"
                      disabled={isDisabled}
                      submitting={isSubmitting}
                      submittingText="Entrando..."
                      text="Entrar"
                    />
                  </div>
                );
              }}
            </form.Subscribe>

            <div className="text-center pt-4">
              <Link
                to="/register"
                className="text-sm text-primary hover:underline"
              >
                Ainda não tem uma conta? Crie uma agora
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
