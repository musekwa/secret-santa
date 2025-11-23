import { Validators } from "@/lib/validators/common";
import z from "zod";

export const userAdditionalInfoSchema = z
  .object({
    phone1: z.string().min(1, "Telefone é obrigatório"),
    phone2: z.string().optional(),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
    department: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.phone1) return true;
      const result = Validators.phoneNumber(data.phone1);
      return result === true;
    },
    {
      message: "Telefone inválido",
      path: ["phone1"],
    }
  )
  .refine(
    (data) => {
      if (!data.phone2) return true;
      const result = Validators.phoneNumber(data.phone2);
      return result === true;
    },
    {
      message: "Telefone secundário inválido",
      path: ["phone2"],
    }
  )
  .superRefine((data, ctx) => {
    const result = Validators.dateDMY(data.startDate);
    if (result !== true) {
      ctx.addIssue({
        code: "custom",
        message: result as string,
        path: ["startDate"],
      });
    }
  });

export type UserAdditionalInfoSchema = z.infer<typeof userAdditionalInfoSchema>;
