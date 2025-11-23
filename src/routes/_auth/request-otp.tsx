import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createFileRoute,
  useNavigate,
  Link,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import {
  SubmitButton,
  FieldErrorMessage,
} from "@/components/custom-ui/form-elements";
import iamLogo from "@/assets/images/iam-logo.png";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/config/secrets";

// Zod schema for email validation
const requestOTPSchema = z.object({
  email: z.email("O email é inválido"),
});

// TypeScript type inferred from the Zod schema
type RequestOTPFormData = z.infer<typeof requestOTPSchema>;

export const Route = createFileRoute("/_auth/request-otp")({
  component: RequestOTPRouteComponent,
  beforeLoad: async () => {
    // Check if user is already logged in
    const userId = localStorage.getItem("secret_santa_participant");
    if (userId) {
      throw redirect({
        to: "/dashboard",
        replace: true,
      });
    }
  },
});

function RequestOTPRouteComponent() {
  const navigate = useNavigate();
  const [emailValue, setEmailValue] = useState("");

  // Generate unique 6-digit OTP code
  const generateUniqueOTP = async (): Promise<string> => {
    let otp: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      // Generate random 6-digit OTP
      otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if OTP exists in database
      const { data: existing, error } = await supabase
        .from("verifications")
        .select("otp")
        .eq("otp", otp)
        .maybeSingle();

      if (!existing && (!error || error.code === "PGRST116")) {
        // OTP doesn't exist, it's unique
        isUnique = true;
      }

      attempts++;
    }

    if (!isUnique) {
      throw new Error(
        "Não foi possível gerar um OTP único após várias tentativas"
      );
    }

    return otp!;
  };

  // TanStack Form setup with Zod validation
  const form = useForm({
    defaultValues: {
      email: "",
    } as RequestOTPFormData,
    validators: {
      onChange: ({ value: formValue }) => {
        const result = requestOTPSchema.safeParse(formValue);
        return result.success ? undefined : result.error;
      },
    },
    onSubmit: async ({ value: formValue }) => {
      try {
        const email = formValue.email.toLowerCase().trim();

        // Check if participant exists with this email
        const { data: participant, error: participantError } = await supabase
          .from("participants")
          .select("*")
          .eq("email", email)
          .single();

        if (participantError || !participant) {
          // Don't reveal if email exists or not for security
          toast.success(
            "Se o email estiver cadastrado, um novo código será enviado."
          );
          // Still navigate to login to prevent timing attacks
          setTimeout(() => {
            navigate({ to: "/login", replace: true });
          }, 1000);
          return;
        }

        // Delete any existing verification records for this participant
        await supabase
          .from("verifications")
          .delete()
          .eq("participant_id", participant.id);

        // Generate new unique OTP
        const otp = await generateUniqueOTP();

        // Calculate expiration time (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const expiresAtISO = expiresAt.toISOString();

        // Create new verification record
        const { error: verificationError } = await supabase
          .from("verifications")
          .insert({
            otp: otp,
            expires_at: expiresAtISO,
            participant_id: participant.id,
          });

        if (verificationError) {
          console.error("Error creating verification:", verificationError);
          toast.error("Erro ao criar código de verificação. Tente novamente.");
          return;
        }

        // Send email with new OTP using Supabase Edge Function
        const loginUrl = `${window.location.origin}/login`;

        try {
          // Call Supabase Edge Function to send email
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/send-otp-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                to: participant.email,
                subject: "Seu novo código de acesso - Amigos Ocultos IAM, IP",
                participantName: participant.name,
                otp: otp,
                loginUrl: loginUrl,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || data.error) {
            console.error("Error sending email:", data.error || data);
            toast.error(
              "Código criado, mas houve erro ao enviar email. Entre em contato com o administrador."
            );
            return;
          }
        } catch (error) {
          console.error("Error sending email:", error);
          toast.error(
            "Código criado, mas houve erro ao enviar email. Entre em contato com o administrador."
          );
        }

        toast.success(
          "Novo código enviado para seu email! Verifique sua caixa de entrada."
        );

        // Redirect to login page
        navigate({ to: "/login", replace: true });
      } catch (error) {
        console.error("Error requesting OTP:", error);
        toast.error("Erro ao solicitar novo código. Tente novamente.");
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
            Solicitar Novo Código
          </CardTitle>
          <CardDescription className="text-center text-sm text-slate-600 dark:text-slate-400">
            Digite seu email para receber um novo código de acesso
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
                    placeholder="seu.email@exemplo.com"
                    value={field.state.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmailValue(value);
                      field.handleChange(value);
                    }}
                    onBlur={field.handleBlur}
                    className={`h-12 text-base ${
                      field.state.meta.errors.length > 0
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    disabled={form.state.isSubmitting}
                    autoFocus
                  />
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
                !emailValue || !z.string().email().safeParse(emailValue).success
              }
              submitting={form.state.isSubmitting}
              submittingText="Enviando..."
              text="Enviar Novo Código"
            />

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
