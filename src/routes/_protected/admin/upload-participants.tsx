import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { supabase } from "@/lib/supabase/client";
import { resend } from "@/lib/resend";
import {
  RESEND_SUPABASE_URL,
  RESEND_SUPABASE_ANON_KEY,
} from "@/config/secrets";

// Type for participant data
type Participant = {
  name: string;
  email: string;
};

export const Route = createFileRoute("/_protected/admin/upload-participants")({
  component: UploadParticipantsComponent,
});

function UploadParticipantsComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast.error("Por favor, selecione um arquivo Excel (.xlsx ou .xls)");
      return;
    }

    setFile(selectedFile);
    setParticipants([]);
    setErrors([]);
  };

  // Parse Excel file
  const handleParseFile = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo primeiro");
      return;
    }
    // console.log("handleParseFile", file);

    setIsProcessing(true);
    setErrors([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // Get first worksheet
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        toast.error("O arquivo Excel não contém planilhas");
        setIsProcessing(false);
        return;
      }

      // Convert to array of arrays
      const data: any[][] = [];
      worksheet.eachRow((row) => {
        const rowData: any[] = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Use cell.text for formatted text value, or cell.value for raw value
          // cell.text handles rich text, formulas, hyperlinks, etc. automatically
          const cellValue = cell.text || (cell.value ? String(cell.value) : "");
          rowData[colNumber - 1] = cellValue;
        });
        data.push(rowData);
      });

      if (data.length < 2) {
        toast.error("O arquivo Excel está vazio ou não contém dados");
        setIsProcessing(false);
        return;
      }

      // Get headers (first row)
      const headers = data[0].map((h) => String(h).toLowerCase().trim());

      // Find name and email column indices
      const nameIndex = headers.findIndex(
        (h) => h.includes("nome") || h.includes("name")
      );
      const emailIndex = headers.findIndex(
        (h) =>
          h.includes("email") || h.includes("e-mail") || h.includes("correio")
      );

      if (nameIndex === -1 || emailIndex === -1) {
        toast.error(
          "O arquivo deve conter colunas 'Nome' e 'Email' (ou 'Name' e 'Email')"
        );
        setIsProcessing(false);
        return;
      }

      // Parse participants from data rows (skip header)
      const parsedParticipants: Participant[] = [];
      const newErrors: string[] = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const name = String(row[nameIndex] || "").trim();
        const email = String(row[emailIndex] || "").trim();

        if (!name) {
          newErrors.push(`Linha ${i + 1}: Nome está vazio`);
          continue;
        }

        if (!email) {
          newErrors.push(`Linha ${i + 1}: Email está vazio`);
          continue;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors.push(`Linha ${i + 1}: Email inválido (${email})`);
          continue;
        }

        parsedParticipants.push({ name, email });
      }

      if (parsedParticipants.length === 0) {
        toast.error("Nenhum participante válido foi encontrado no arquivo");
        setIsProcessing(false);
        return;
      }

      setParticipants(parsedParticipants);
      setErrors(newErrors);

      if (newErrors.length > 0) {
        toast.warning(
          `${parsedParticipants.length} participantes válidos encontrados, mas ${newErrors.length} erros foram detectados`
        );
      } else {
        console.log(
          "Participantes carregados com sucesso:",
          parsedParticipants
        );
        toast.success(
          `${parsedParticipants.length} participantes carregados com sucesso!`
        );
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error(
        "Erro ao processar o arquivo. Por favor, verifique o formato."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate unique 6-digit OTP code
  const generateUniqueOTP = async (
    existingOTPs: Set<string>
  ): Promise<string> => {
    let otp: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      // Generate random 6-digit OTP
      otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if OTP already exists in our batch
      if (!existingOTPs.has(otp)) {
        // Check if OTP exists in database
        const { data: existing, error } = await supabase
          .from("verifications")
          .select("otp")
          .eq("otp", otp)
          .maybeSingle();

        if (!existing && (!error || error.code === "PGRST116")) {
          // OTP doesn't exist, it's unique
          isUnique = true;
          existingOTPs.add(otp);
        }
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

  // Generate unique 8-digit code
  const generateUniqueCode = async (
    existingCodes: Set<string>
  ): Promise<string> => {
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      // Generate random 8-digit code
      code = Math.floor(10000000 + Math.random() * 90000000).toString();

      // Check if code already exists in our batch or database
      if (!existingCodes.has(code)) {
        // Check if code exists in database
        const { data: existing, error } = await supabase
          .from("participants")
          .select("code")
          .eq("code", code)
          .maybeSingle();

        if (!existing && (!error || error.code === "PGRST116")) {
          // Code doesn't exist, it's unique
          isUnique = true;
          existingCodes.add(code);
        }
      }

      attempts++;
    }

    if (!isUnique) {
      throw new Error(
        "Não foi possível gerar um código único após várias tentativas"
      );
    }

    return code!;
  };

  // Handle upload to database
  const handleUpload = async () => {
    if (participants.length === 0) {
      toast.error("Nenhum participante para enviar");
      return;
    }

    setIsUploading(true);

    try {
      // Check which emails already exist in the database
      const emails = participants.map((p) => p.email.toLowerCase().trim());
      const { data: existingParticipants, error: checkError } = await supabase
        .from("participants")
        .select("email")
        .in("email", emails);

      if (checkError) {
        console.error("Error checking existing participants:", checkError);
        // Continue anyway, will handle duplicates during insert
      }

      const existingEmails = new Set(
        (existingParticipants || []).map((p) => p.email.toLowerCase().trim())
      );

      // Filter out participants that already exist
      const newParticipants = participants.filter(
        (p) => !existingEmails.has(p.email.toLowerCase().trim())
      );

      const skippedEmails = participants.filter((p) =>
        existingEmails.has(p.email.toLowerCase().trim())
      );

      if (newParticipants.length === 0) {
        toast.error(
          `Todos os ${participants.length} participantes já existem no banco de dados.`
        );
        setIsUploading(false);
        return;
      }

      if (skippedEmails.length > 0) {
        toast.warning(
          `${skippedEmails.length} participante(s) já existem e serão ignorados: ${skippedEmails.map((p) => p.email).join(", ")}`
        );
      }

      // Generate unique codes for new participants only
      // Use a Set to track codes in the current batch to avoid duplicates
      const existingCodes = new Set<string>();
      const participantsWithCodes = await Promise.all(
        newParticipants.map(async (participant) => {
          const code = await generateUniqueCode(existingCodes);
          return {
            name: participant.name,
            email: participant.email,
            amount: "1000",
            code: code,
            is_verified: false,
            is_admin: false,
          };
        })
      );

      // Insert only new participants into database
      const { data: insertedParticipants, error } = await supabase
        .from("participants")
        .insert(participantsWithCodes)
        .select();

      if (error || !insertedParticipants || insertedParticipants.length === 0) {
        // Handle duplicate email error (shouldn't happen now, but just in case)
        if (error?.code === "23505") {
          // Unique constraint violation
          if (error.message.includes("email")) {
            toast.error(
              "Um ou mais emails já existem no banco de dados. Por favor, verifique o arquivo."
            );
          } else if (error.message.includes("code")) {
            toast.error(
              "Erro ao gerar códigos únicos. Por favor, tente novamente."
            );
          } else {
            toast.error(
              `Erro ao salvar participantes: ${error?.message || "Erro desconhecido"}`
            );
          }
        } else {
          toast.error(
            `Erro ao salvar participantes: ${error?.message || "Nenhum participante foi inserido"}`
          );
        }
        console.error("Error uploading participants:", error);
        setIsUploading(false);
        return;
      }

      // Create verification records for each participant
      const existingOTPs = new Set<string>();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now
      const expiresAtISO = expiresAt.toISOString();

      const verifications = await Promise.all(
        insertedParticipants.map(async (participant) => {
          const otp = await generateUniqueOTP(existingOTPs);
          return {
            otp: otp,
            expires_at: expiresAtISO,
            participant_id: participant.id,
          };
        })
      );

      // Insert verifications into database
      const { error: verificationError } = await supabase
        .from("verifications")
        .insert(verifications);

      if (verificationError) {
        console.error("Error creating verifications:", verificationError);
        toast.error(
          "Participantes salvos, mas houve erro ao criar códigos de verificação. Por favor, tente novamente."
        );
        setIsUploading(false);
        return;
      }

      // Send emails to participants with their OTP codes using Resend-Supabase integration
      // Note: This runs asynchronously and won't block the upload process
      const loginUrl = `${window.location.origin}/login`;

      // Send emails in background (non-blocking)
      Promise.allSettled(
        verifications.map(async (verification, index) => {
          const participant = insertedParticipants[index];

          try {
            // Call Resend Edge Function via Supabase to send email
            const { error } = await resend.functions.invoke("send-otp-email", {
              body: {
                to: participant.email,
                subject: "Seu código de acesso - Amigos Ocultos IAM, IP",
                participantName: participant.name,
                otp: verification.otp,
                loginUrl: loginUrl,
              },
            });

            if (error) {
              console.error(
                `Error sending email to ${participant.email}:`,
                error
              );
              throw error;
            }

            return { email: participant.email, success: true };
          } catch (error: any) {
            // Handle CORS or other errors gracefully
            console.error(
              `Failed to send email to ${participant.email}:`,
              error
            );

            // If it's a CORS error, try using fetch directly as fallback
            if (
              error?.message?.includes("CORS") ||
              error?.name === "TypeError"
            ) {
              try {
                const response = await fetch(
                  `${RESEND_SUPABASE_URL}/functions/v1/send-otp-email`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${RESEND_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                      to: participant.email,
                      subject: "Seu código de acesso - Amigos Ocultos IAM, IP",
                      participantName: participant.name,
                      otp: verification.otp,
                      loginUrl: loginUrl,
                    }),
                  }
                );

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                return { email: participant.email, success: true };
              } catch (fetchError) {
                console.error(
                  `Fallback email send also failed for ${participant.email}:`,
                  fetchError
                );
                throw fetchError;
              }
            }
            throw error;
          }
        })
      ).then((emailResults) => {
        // Count successful and failed emails
        const successfulEmails = emailResults.filter(
          (result) => result.status === "fulfilled"
        ).length;
        const failedEmails = emailResults.filter(
          (result) => result.status === "rejected"
        ).length;

        if (failedEmails > 0) {
          toast.warning(
            `${insertedParticipants.length} participantes salvos. ${successfulEmails} emails enviados, ${failedEmails} falharam (verifique a configuração CORS do Edge Function).`
          );
        } else {
          toast.success(
            `${insertedParticipants.length} participantes salvos! Códigos de verificação gerados e emails enviados com sucesso.`
          );
        }
      });

      // Show immediate success message (emails are sent in background)
      toast.success(
        `${insertedParticipants.length} participantes foram salvos com sucesso! Códigos de verificação foram gerados. Enviando emails...`
      );

      // Reset form
      setFile(null);
      setParticipants([]);
      setErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error("Erro ao salvar participantes. Por favor, tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setParticipants([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            Upload de Participantes
          </CardTitle>
          <CardDescription>
            Faça upload de um arquivo Excel (.xlsx ou .xls) com os participantes
            do Amigo Secreto. O arquivo deve conter duas colunas:{" "}
            <strong>Nome</strong> e <strong>Email</strong>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Clique para selecionar ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Apenas arquivos Excel (.xlsx, .xls)
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isProcessing || isUploading}
                >
                  Remover
                </Button>
              </div>
            )}

            {file && participants.length === 0 && (
              <Button
                onClick={handleParseFile}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando arquivo...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Processar Arquivo
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Errors Display */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Erros encontrados ({errors.length}):
                </h3>
              </div>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 max-h-32 overflow-y-auto">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Participants Preview */}
          {participants.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {participants.length} Participante(s) Encontrado(s)
                  </h3>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                          #
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                          Nome
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        >
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                            {participant.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {participant.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || participants.length === 0}
                  className="flex-1"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando no banco de dados...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Salvar {participants.length} Participante(s) no Banco de
                      Dados
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isUploading}
                  size="lg"
                >
                  Limpar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
