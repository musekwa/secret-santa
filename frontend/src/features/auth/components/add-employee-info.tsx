import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Validators } from "@/lib/validators/common";
import {
  InputLabel,
  FieldErrorMessage,
  SubmitButton,
} from "@/components/custom-ui/form-elements";
import { Phone, Calendar, MapPin, Building2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
// import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  userAdditionalInfoSchema,
  type UserAdditionalInfoSchema,
} from "../validators/schema";
import { DatePicker } from "@/components/custom-ui/date-picker";
import { format } from "date-fns";

export const AddEmployeeInfo = () => {
  const form = useForm({
    defaultValues: {
      phone1: "",
      phone2: "",
      startDate: "",
      address: "",
      department: "",
    } as UserAdditionalInfoSchema,
    validators: {
      onChange: userAdditionalInfoSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Submitting additional info:", value);
      // TODO: Add API call to save additional information
      // await saveAdditionalUserInfo(email, value);
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Complete seu Cadastro
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Enquanto aguarda a aprovação, complete suas informações pessoais para
          facilitar o processo de autorização.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          {/* Phone Numbers */}
          <div className="space-y-4">
            {/* Primary Phone */}

            <form.Field
              name="phone1"
              validators={{
                onChange: ({ value }) => {
                  const result = Validators.phoneNumber(value);
                  if (result !== true) {
                    return result;
                  }
                  return undefined;
                },
              }}
            >
              {(phoneField) => {
                return (
                  <div className="space-y-1">
                    <InputLabel
                      label="Telefone principal"
                      Icon={Phone}
                      iconClassName="text-slate-500 dark:text-slate-400"
                    />
                    <PhoneInput
                      international
                      defaultCountry="MZ"
                      value={phoneField.state.value}
                      onChange={(value) => phoneField.handleChange(value || "")}
                      onBlur={phoneField.handleBlur}
                      placeholder="Telefone principal"
                      className={`phone-input-wrapper ${
                        !phoneField.state.meta.isValid &&
                        phoneField.state.meta.isTouched
                          ? "phone-input-invalid"
                          : ""
                      }`}
                    />
                    <style>{`
                    .phone-input-wrapper .PhoneInputInput {
                      height: 2.75rem;
                      padding: 0.5rem 0.75rem;
                      font-size: 1rem;
                      border-radius: 0.375rem;
                      border: 1px solid rgb(226 232 240);
                      background-color: transparent;
                      width: 100%;
                      transition: all 0.2s;
                      }
                      .dark .phone-input-wrapper .PhoneInputInput {
                        border-color: rgb(71 85 105);
                        background-color: rgba(255, 255, 255, 0.05);
                        }
                        .phone-input-wrapper .PhoneInputInput:focus {
                          outline: none;
                          border-color: hsl(var(--primary));
                          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
                          }
                          .phone-input-wrapper .PhoneInputCountry {
                            margin-right: 0.5rem;
                            }
                            .phone-input-wrapper .PhoneInputCountrySelect {
                              font-size: 1rem;
                              padding: 0.375rem;
                              border-radius: 0.375rem;
                              }
                              .phone-input-invalid .PhoneInputInput {
                                border-color: rgb(239 68 68);
                                }
                                .phone-input-invalid .PhoneInputInput:focus {
                                  border-color: rgb(239 68 68);
                                  box-shadow: 0 0 0 3px rgb(239 68 68 / 0.2);
                                  }
                                  `}</style>

                    {!phoneField.state.meta.isValid &&
                      phoneField.state.meta.isTouched && (
                        <FieldErrorMessage
                          message={
                            typeof phoneField.state.meta.errors[0] === "string"
                              ? phoneField.state.meta.errors[0]
                              : (phoneField.state.meta.errors[0]?.message ?? "")
                          }
                        />
                      )}
                  </div>
                );
              }}
            </form.Field>
          </div>

          {/* Secondary Phone */}
          <form.Field
            name="phone2"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined; // Optional field
                const result = Validators.phoneNumber(value);
                if (result !== true) {
                  return result;
                }
                return undefined;
              },
            }}
          >
            {(phoneField) => {
              return (
                <div className="space-y-1">
                  <InputLabel
                    label="Telefone secundário (opcional)"
                    Icon={Phone}
                    iconClassName="text-slate-500 dark:text-slate-400"
                  />
                  <PhoneInput
                    international
                    defaultCountry="MZ"
                    value={phoneField.state.value}
                    onChange={(value) => phoneField.handleChange(value || "")}
                    onBlur={phoneField.handleBlur}
                    placeholder="Telefone secundário (opcional)"
                    className={`phone-input-wrapper ${
                      !phoneField.state.meta.isValid &&
                      phoneField.state.meta.isTouched &&
                      phoneField.state.value
                        ? "phone-input-invalid"
                        : ""
                    }`}
                  />
                  {!phoneField.state.meta.isValid &&
                    phoneField.state.meta.isTouched &&
                    phoneField.state.value && (
                      <FieldErrorMessage
                        message={
                          typeof phoneField.state.meta.errors[0] === "string"
                            ? phoneField.state.meta.errors[0]
                            : (phoneField.state.meta.errors[0]?.message ?? "")
                        }
                      />
                    )}
                </div>
              );
            }}
          </form.Field>

          {/* Start Date */}
          <form.Field
            name="startDate"
            validators={{
              onChange: z.string().min(1, "Data de início é obrigatória"),
            }}
          >
            {(field) => {
              const parseDMY = (value: string): Date | undefined => {
                const m = value.match(
                  /^([0-2]\d|3[01])\/(0\d|1[0-2])\/(\d{4})$/
                );
                if (!m) return undefined;
                const d = parseInt(m[1], 10);
                const mo = parseInt(m[2], 10) - 1;
                const y = parseInt(m[3], 10);
                const date = new Date(y, mo, d);
                if (
                  date.getFullYear() !== y ||
                  date.getMonth() !== mo ||
                  date.getDate() !== d
                )
                  return undefined;
                return date;
              };

              const selected = parseDMY(field.state.value);

              return (
                <div className="space-y-1">
                  <InputLabel
                    label="Data de Início na Empresa"
                    Icon={Calendar}
                    iconClassName="text-slate-500 dark:text-slate-400"
                  />
                  <DatePicker
                    selected={selected}
                    onSelect={(date) => {
                      if (!date) {
                        field.handleChange("");
                        return;
                      }
                      // format to dd/mm/yyyy
                      const ddmmyyyy = format(date, "dd/MM/yyyy");
                      field.handleChange(ddmmyyyy);
                    }}
                    placeholder="dd/mm/aaaa"
                  />
                  {!field.state.meta.isValid && field.state.meta.isTouched && (
                    <FieldErrorMessage
                      message={field.state.meta.errors[0]?.message ?? ""}
                    />
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Address */}
          <form.Field
            name="address"
            validators={{
              onChange: z
                .string()
                .min(10, "Endereço deve ter pelo menos 10 caracteres"),
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <InputLabel
                  label="Endereço onde mora"
                  Icon={MapPin}
                  iconClassName="text-slate-500 dark:text-slate-400"
                />
                <Textarea
                  placeholder="Digite seu endereço completo"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={3}
                  className={`text-base border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20 focus:outline-none resize-none ${!field.state.meta.isValid && field.state.meta.isTouched ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                />
                {!field.state.meta.isValid && field.state.meta.isTouched && (
                  <FieldErrorMessage
                    message={field.state.meta.errors[0]?.message ?? ""}
                  />
                )}
              </div>
            )}
          </form.Field>

          {/* Department */}
          <form.Field name="department">
            {(field) => (
              <div className="space-y-1">
                <InputLabel
                  label="Departamento (Opcional)"
                  Icon={Building2}
                  iconClassName="text-slate-500 dark:text-slate-400"
                />
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger className="w-full h-11 text-base">
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="rh">Recursos Humanos</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operacoes">Operações</SelectItem>
                    <SelectItem value="administracao">Administração</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          {/* Submit Button */}
          <SubmitButton
            buttonType="submit"
            disabled={form.state.canSubmit === false}
            submitting={form.state.isSubmitting}
            submittingText="Salvando..."
            text="Salvar Informações"
          />
        </form>
      </div>
    </div>
  );
};
