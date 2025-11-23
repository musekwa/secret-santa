import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  createFileRoute,
  redirect,
  useNavigate,
  Link,
} from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import {
  SubmitButton,
  FieldErrorMessage,
  FieldDescription,
} from "@/components/custom-ui/form-elements";
import { Input } from "@/components/ui/input";
import iamLogo from "@/assets/images/iam-logo.png";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { setUserInStorage } from "@/hooks/use-user";

// Zod schema for login validation
const loginSchema = z.object({
  otp: z.string().length(6, "O código deve ter 6 dígitos"),
  email: z.email("O email é inválido"),
});

// TypeScript type inferred from the Zod schema for type safety
type LoginFormData = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/_auth/login")({
  component: LoginRouteComponent,
  validateSearch: z.object({
    email: z.email("O email é inválido").optional(),
    redirect: z.string().default("/dashboard"),
  }),
  beforeLoad: async ({ search }) => {
    // Check if user is already logged in (stored in localStorage)
    try {
      const stored = localStorage.getItem("secret_santa_participant");
      if (stored) {
        throw redirect({
          to: search.redirect || "/dashboard",
          replace: true,
        });
      }
    } catch (error) {
      // If redirect was thrown, re-throw it
      if (error && typeof error === "object" && "to" in error) {
        throw error;
      }
    }
  },
});

/**
 * Login Form Component using TanStack Form
 *
 * Features:
 * - OTP-based authentication (6 digits)
 * - TanStack Form with Zod validation
 * - Type-safe form state management
 * - Responsive design with dark mode support
 * - Portuguese language support
 * - Automatic redirect for authenticated users
 * - Redirects to enter-amount page after OTP verification
 */
function LoginRouteComponent() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [otpValue, setOtpValue] = useState("");

  // TanStack Form setup with Zod validation
  const form = useForm({
    defaultValues: {
      otp: "",
      email: "",
    } as LoginFormData,
    validators: {
      onChange: ({ value: formValue }) => {
        const result = loginSchema.safeParse(formValue);
        return result.success ? undefined : result.error;
      },
    },
    onSubmit: async ({ value: formValue }) => {
      try {
        const email = formValue.email.toLowerCase().trim();
        const otp = formValue.otp;

        // Find verification record by OTP
        const { data: verification, error: verificationError } = await supabase
          .from("verifications")
          .select("id, participant_id, expires_at")
          .eq("otp", otp)
          .single();

        if (verificationError || !verification) {
          toast.error(
            "Código inválido. Por favor, verifique e tente novamente."
          );
          return;
        }

        // Check if OTP has expired
        const expiresAt = new Date(verification.expires_at);
        if (expiresAt < new Date()) {
          toast.error(
            "Este código expirou. Por favor, solicite um novo código."
          );
          return;
        }

        // Fetch participant from participants table and verify email matches
        const { data: participant, error: participantError } = await supabase
          .from("participants")
          .select("*, is_admin")
          .eq("id", verification.participant_id)
          .eq("email", email)
          .single();

        if (participantError || !participant) {
          toast.error(
            "Código ou email inválidos. Por favor, verifique e tente novamente."
          );
          return;
        }

        // Update participant is_verified to true
        const { error: updateError } = await supabase
          .from("participants")
          .update({ is_verified: true })
          .eq("id", participant.id);

        if (updateError) {
          console.error("Error updating participant:", updateError);
          toast.error(
            "Erro ao atualizar participante. Por favor, tente novamente."
          );
          return;
        }

        // Delete the verification record ONLY if user is not admin
        // Admin OTP should persist and be reusable
        if (!participant.is_admin) {
          const { error: deleteError } = await supabase
            .from("verifications")
            .delete()
            .eq("id", verification.id);

          if (deleteError) {
            console.error("Error deleting verification:", deleteError);
            // Don't fail the login if deletion fails, just log it
          }
        }

        // Store only participant ID in localStorage
        setUserInStorage(participant.id);

        toast.success("Login realizado com sucesso!");

        // Check if user needs to enter amount (if amount is still default "1000")
        // Parse amount to check if it's the default
        const amountNum = parseFloat(
          participant.amount.replace(/\./g, "").replace(",", ".")
        );
        const isDefaultAmount = !isNaN(amountNum) && amountNum === 1000;

        // Redirect to enter-amount if user hasn't set a custom amount yet
        // Otherwise redirect to dashboard
        if (isDefaultAmount && !participant.is_admin) {
          navigate({
            to: "/enter-amount",
            search: {
              redirect: redirect || "/dashboard",
            },
            replace: true,
          });
        } else {
          navigate({
            to: redirect || "/dashboard",
            replace: true,
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Erro ao fazer login. Por favor, tente novamente.");
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <img
              src={iamLogo}
              alt="IAM, IP"
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-primary dark:text-primary-foreground mb-2">
            IAM, IP
          </CardTitle>
          <CardDescription className="text-center text-sm text-slate-600 dark:text-slate-400">
            Amigos Ocultos para Funcionários e Agentes do Instituto de Amêndoas
            de Moçambique, IP - Sede
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
              console.log("Form submitted:", form.state.values);
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="email"
              validators={{
                onChange: z.string().email("O email é inválido"),
              }}
            >
              {(field) => (
                <div className="space-y-2">
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
            </form.Field>

            {/* Submit button */}
            <SubmitButton
              buttonType="submit"
              disabled={
                otpValue.length !== 6 ||
                !form.state.values.email ||
                !z.string().email().safeParse(form.state.values.email).success
              }
              submitting={form.state.isSubmitting}
              submittingText="Entrando..."
              text="Entrar"
            />

            <div className="text-center pt-2">
              <Link
                to="/request-otp"
                className="text-sm text-primary hover:underline"
              >
                Não recebeu o código? Solicite um novo
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
