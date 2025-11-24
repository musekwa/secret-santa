import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import {
  SubmitButton,
  FieldErrorMessage,
  FieldDescription,
} from "@/components/custom-ui/form-elements";
import iamLogo from "@/assets/images/iam-logo.png";
import { toast } from "sonner";
import { useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

// Zod schema for gift amount validation
const amountSchema = z.object({
  giftAmount: z
    .string()
    .min(1, "O valor do presente é obrigatório")
    .refine(
      (val) => {
        const num = parseFloat(val.replace(/\./g, "").replace(",", "."));
        return !isNaN(num) && num >= 1000;
      },
      { message: "O valor mínimo é 1.000 MZN" }
    ),
});

// TypeScript type inferred from the Zod schema
type AmountFormData = z.infer<typeof amountSchema>;

export const Route = createFileRoute("/_auth/enter-amount")({
  component: EnterAmountRouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async () => {
    // Check if user ID exists in localStorage
    const userId = localStorage.getItem("secret_santa_participant");
    if (!userId) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
});

function EnterAmountRouteComponent() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const giftAmountInputRef = useRef<HTMLInputElement>(null);

  // Helper function to format number with thousands separators (no decimals)
  const formatAmount = (value: string): string => {
    if (!value || value.trim() === "") return "";

    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Add thousands separators (dots)
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Helper function to parse formatted amount back to number
  const parseAmount = (value: string): number => {
    // Remove all non-digit characters (thousands separators)
    const cleaned = value.replace(/\D/g, "");
    return parseInt(cleaned, 10) || 0;
  };

  // Helper function to validate gift amount
  const isValidGiftAmount = (value: string): boolean => {
    if (!value || value.trim() === "") return false;
    const num = parseAmount(value);
    return !isNaN(num) && num >= 1000;
  };

  // Auto-focus on mount
  useEffect(() => {
    if (giftAmountInputRef.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (giftAmountInputRef.current) {
            giftAmountInputRef.current.focus();
            giftAmountInputRef.current.select();
          }
        }, 150);
      });
    }
  }, []);

  // TanStack Form setup with Zod validation
  const form = useForm({
    defaultValues: {
      giftAmount: "1000",
    } as AmountFormData,
    validators: {
      onChange: ({ value }) => {
        const result = amountSchema.safeParse(value);
        return result.success ? undefined : result.error;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const amount = parseAmount(value.giftAmount);
        const amountString = amount.toString(); // Store as whole number

        // Get current user ID from localStorage
        const userId = localStorage.getItem("secret_santa_participant");
        if (!userId) {
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          navigate({ to: "/login", replace: true });
          return;
        }

        // Update participant amount in database
        const { error } = await supabase
          .from("participants")
          .update({ amount: amountString })
          .eq("id", userId);

        if (error) {
          console.error("Error updating amount:", error);
          toast.error("Erro ao salvar valor. Por favor, tente novamente.");
          return;
        }

        // User data will be automatically refreshed from database on next useUser call

        toast.success("Valor do presente salvo com sucesso!");
        navigate({ to: redirect || "/dashboard", replace: true });
      } catch (error) {
        console.error("Error submitting amount:", error);
        toast.error("Erro ao salvar valor. Por favor, tente novamente.");
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
            Digite o valor do presente que você oferecerá (em MZN)
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
              name="giftAmount"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === "") {
                    return "O valor do presente é obrigatório";
                  }
                  const num = parseAmount(value);
                  if (isNaN(num) || num < 1000) {
                    return "O valor mínimo é 1.000 MZN";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <label
                    htmlFor="giftAmount"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 block"
                  >
                    Valor do Presente (MZN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">
                      MZN
                    </span>
                    <Input
                      ref={giftAmountInputRef}
                      id="giftAmount"
                      type="text"
                      placeholder="1.000"
                      value={formatAmount(field.state.value)}
                      onChange={(e) => {
                        // Remove all non-digit characters
                        const cleaned = e.target.value.replace(/\D/g, "");
                        // Store raw value in form state (e.g., "1000")
                        field.handleChange(cleaned);
                      }}
                      onBlur={field.handleBlur}
                      className={`pl-12 h-12 text-base border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20 ${
                        field.state.meta.errors.length > 0
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={form.state.isSubmitting}
                      autoFocus
                    />
                  </div>
                  {field.state.meta.errors.length > 0 ? (
                    <FieldErrorMessage
                      message={
                        typeof field.state.meta.errors[0] === "string"
                          ? field.state.meta.errors[0]
                          : (
                              field.state.meta.errors[0] as unknown as {
                                message?: string;
                              }
                            )?.message || ""
                      }
                    />
                  ) : (
                    <FieldDescription description="O valor do presente deve ser pelo menos 1.000 MZN" />
                  )}
                </div>
              )}
            </form.Field>

            {/* Submit button */}
            <SubmitButton
              buttonType="submit"
              disabled={!isValidGiftAmount(form.state.values.giftAmount)}
              submitting={form.state.isSubmitting}
              submittingText="Salvando..."
              text="Confirmar e Entrar"
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
