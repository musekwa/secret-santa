import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { setUserInStorage } from "@/hooks/use-user";

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
      { message: "O valor mínimo é 1.000,00 MZN" }
    ),
});

// TypeScript type inferred from the Zod schema
type AmountFormData = z.infer<typeof amountSchema>;

export const Route = createFileRoute("/_auth/enter-amount")({
  component: EnterAmountRouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
});

function EnterAmountRouteComponent() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const giftAmountInputRef = useRef<HTMLInputElement>(null);

  // Helper function to format number with thousands separators
  // Shows 2 decimal places only when comma is present or when forceDecimals is true
  const formatAmount = (
    value: string,
    forceDecimals: boolean = false
  ): string => {
    if (!value || value.trim() === "") return "";

    // Remove all non-digit characters except comma
    const cleaned = value.replace(/[^\d,]/g, "");

    // Split by comma to separate integer and decimal parts
    const parts = cleaned.split(",");
    const integerPart = parts[0] || "";
    let decimalPart = parts[1] || "";

    // Add thousands separators (dots) to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Show 2 decimal places if comma exists or if forceDecimals is true
    if (forceDecimals || value.includes(",") || decimalPart) {
      const paddedDecimal = decimalPart.slice(0, 2).padEnd(2, "0");
      return `${formattedInteger},${paddedDecimal}`;
    }

    // If no comma, show without decimals (user is still typing)
    return formattedInteger;
  };

  // Helper function to parse formatted amount back to number
  const parseAmount = (value: string): number => {
    // Remove all dots (thousands separators) and replace comma with dot for decimal
    const cleaned = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleaned);
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
      giftAmount: "1000,00",
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
        const amountString = amount.toFixed(2); // Convert to string with 2 decimal places

        // Get current user from localStorage
        const stored = localStorage.getItem("secret_santa_participant");
        if (!stored) {
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          navigate({ to: "/login", replace: true });
          return;
        }

        const currentUser = JSON.parse(stored);

        // Update participant amount in database
        const { error } = await supabase
          .from("participants")
          .update({ amount: amountString })
          .eq("id", currentUser.id);

        if (error) {
          console.error("Error updating amount:", error);
          toast.error("Erro ao salvar valor. Por favor, tente novamente.");
          return;
        }

        // Update user in localStorage with new amount
        setUserInStorage({
          ...currentUser,
          amount: amount,
        });

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
                    return "O valor mínimo é 1.000,00 MZN";
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
                      placeholder="1.000,00"
                      value={formatAmount(field.state.value, false)}
                      onChange={(e) => {
                        // Get the raw input value from the event
                        const inputValue = e.target.value;

                        // Remove all formatting characters (dots for thousands separators)
                        // but preserve digits and comma for decimal separator
                        let rawValue = inputValue.replace(/\./g, ""); // Remove thousands separators
                        rawValue = rawValue.replace(/[^\d,]/g, ""); // Keep only digits and comma

                        // Prevent multiple commas
                        const commaIndex = rawValue.indexOf(",");
                        if (commaIndex !== -1) {
                          rawValue =
                            rawValue.slice(0, commaIndex + 1) +
                            rawValue.slice(commaIndex + 1).replace(/,/g, "");
                        }

                        // Store raw value in form state (e.g., "1000" or "1000,5")
                        field.handleChange(rawValue);
                      }}
                      onBlur={() => {
                        // On blur, ensure 2 decimal places are shown
                        const currentValue = field.state.value;
                        if (currentValue && currentValue.trim() !== "") {
                          // Ensure value has 2 decimal places
                          const parts = currentValue.split(",");
                          const integerPart = parts[0] || "";
                          const decimalPart = (parts[1] || "")
                            .padEnd(2, "0")
                            .slice(0, 2);
                          // Update with formatted value that includes ,00
                          field.handleChange(`${integerPart},${decimalPart}`);
                        }
                        field.handleBlur();
                      }}
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
                    <FieldDescription description="O valor do presente deve ser pelo menos 1.000,00 MZN" />
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
