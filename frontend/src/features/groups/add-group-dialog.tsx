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
import GroupApi from "@/lib/api/group.api";

// Zod schema for group creation validation
const groupSchema = z.object({
  name: z.string().min(1, "O nome do grupo é obrigatório"),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const AddGroupDialog = ({
  open,
  onOpenChange,
  userId,
}: AddGroupDialogProps) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ name }: { name: string }) => GroupApi.create(name, userId),
    onSuccess: () => {
      toast.success("Grupo criado com sucesso!");
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
      console.error("Group creation error:", error?.response?.data || error);
      toast.error("Erro ao criar grupo: " + errorMessage);
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
    } as GroupFormData,
    validators: {
      onChange: ({ value: formValue }) => {
        const result = groupSchema.safeParse(formValue);
        return result.success ? undefined : result.error;
      },
    },
    onSubmit: async ({ value: formValue }) => {
      mutate({ name: formValue.name as string });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Grupo</DialogTitle>
          <DialogDescription>
            Digite o nome do grupo que deseja criar.
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
            name="name"
            validators={{
              onChange: z.string().min(1, "O nome do grupo é obrigatório"),
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 block"
                >
                  Nome do Grupo
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Amigos do Trabalho"
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
                name: state.values.name as string,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ name, isSubmitting }) => {
                const isDisabled =
                  !name || name.trim() === "" || isSubmitting || isPending;
                return (
                  <Button type="submit" disabled={isDisabled}>
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Grupo"
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
