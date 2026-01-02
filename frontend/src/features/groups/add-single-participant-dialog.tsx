import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldErrorMessage } from "@/components/custom-ui/form-elements";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ParticipantApi from "@/lib/api/participant.api";
import UserApi from "@/lib/api/user.api";

// Zod schema for participant creation validation
const participantSchema = z.object({
  email: z.string().email("O email é inválido"),
  name: z.string().optional(),
  gift_value: z.string().optional(),
});

type ParticipantFormData = {
  email: string;
  name?: string;
  gift_value?: string;
};

interface AddSingleParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export const AddSingleParticipantDialog = ({
  open,
  onOpenChange,
  groupId,
}: AddSingleParticipantDialogProps) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      email,
      name,
    }: {
      email: string;
      name?: string;
    }) => {

      const participantObject = {
        group_id: groupId,
        email,
        name: name || email.split("@")[0],
      };

      // Create participant
      const result = await ParticipantApi.create(participantObject);

      if (result && typeof result === "object" && "success" in result) {
        if (!result.success) {
          throw new Error(result.message || "Erro ao criar participante");
        }
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Participante adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        error?.message ||
        "Erro desconhecido";
      console.error(
        "Participant creation error:",
        error?.response?.data || error
      );
      toast.error("Erro ao adicionar participante: " + errorMessage);
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      gift_value: "",
    } as ParticipantFormData,
    validators: {
      onChange: ({ value: formValue }) => {
        const result = participantSchema.safeParse(formValue);
        return result.success ? undefined : result.error;
      },
    },
    onSubmit: async ({ value: formValue }) => {
      mutate({
        email: formValue.email as string,
        name: formValue.name as string | undefined,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Participante</DialogTitle>
          <DialogDescription>
            Adicione um participante ao grupo usando o email do usuário.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
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
                  Email do Usuário *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`h-12 text-base ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isPending}
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

          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 block"
                >
                  Nome (opcional - será extraído do email se não fornecido)
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nome do participante"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="h-12 text-base"
                  disabled={isPending}
                />
              </div>
            )}
          </form.Field>
{/* 
          <form.Field
            name="gift_value"
            validators={{
              onChange: ({ value }) => {
                if (!value || value === "") return undefined;
                const num = parseFloat(String(value));
                if (isNaN(num) || num < 0) {
                  return "O valor deve ser um número positivo";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor="gift_value"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 block"
                >
                  Valor do Presente (opcional)
                </label>
                <Input
                  id="gift_value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`h-12 text-base ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isPending}
                />
                {field.state.meta.errors.length > 0 ? (
                  <FieldErrorMessage
                    message={
                      typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : String(field.state.meta.errors[0])
                    }
                  />
                ) : null}
              </div>
            )}
          </form.Field> */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <form.Subscribe
              selector={(state) => ({
                email: state.values.email as string,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ email, isSubmitting }) => {
                const isDisabled =
                  !email || email.trim() === "" || isSubmitting || isPending;
                return (
                  <Button type="submit" disabled={isDisabled}>
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      "Adicionar Participante"
                    )}
                  </Button>
                );
              }}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
