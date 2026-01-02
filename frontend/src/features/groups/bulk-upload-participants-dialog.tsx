import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import ExcelJS from "exceljs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ParticipantApi from "@/lib/api/participant.api";
import UserApi from "@/lib/api/user.api";

type Participant = {
  name: string;
  email: string;
};

interface BulkUploadParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export const BulkUploadParticipantsDialog = ({
  open,
  onOpenChange,
  groupId,
}: BulkUploadParticipantsDialogProps) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: addParticipants, isPending: isUploading } = useMutation({
    mutationFn: async (participantsList: Participant[]) => {
      const results = [];
      const errors: string[] = [];

      for (const participant of participantsList) {
        try {
          // Add as participant
          const result = await ParticipantApi.create({
            group_id: groupId,
            email: participant.email,
            name: participant.name,
          });

          if (result && typeof result === "object" && "success" in result) {
            if (!result.success) {
              errors.push(
                `${participant.email}: ${result.message || "Erro ao adicionar participante"}`
              );
              continue;
            }
          }

          results.push({ participant, success: true });
        } catch (error: any) {
          errors.push(
            `${participant.email}: ${error?.message || "Erro desconhecido"}`
          );
        }
      }

      return { results, errors };
    },
    onSuccess: (data) => {
      const { results, errors } = data;
      if (results.length > 0) {
        toast.success(
          `${results.length} participante(s) adicionado(s) com sucesso!`
        );
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
        queryClient.invalidateQueries({ queryKey: ["groups"] });
      }
      if (errors.length > 0) {
        toast.warning(
          `${errors.length} erro(s) encontrado(s) ao adicionar participantes`
        );
        setErrors(errors);
      } else {
        // Reset form on complete success
        handleReset();
        onOpenChange(false);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Erro desconhecido";
      console.error("Bulk upload error:", error);
      toast.error("Erro ao adicionar participantes: " + errorMessage);
    },
  });

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

  // Handle upload to database
  const handleUpload = () => {
    if (participants.length === 0) {
      toast.error("Nenhum participante para enviar");
      return;
    }

    addParticipants(participants);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload em Massa de Participantes
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo Excel (.xlsx ou .xls) com os
            participantes. O arquivo deve conter duas colunas:{" "}
            <strong>Nome</strong> e <strong>Email</strong>. Usuários não
            existentes serão criados automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                      Adicionando participantes...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Adicionar {participants.length} Participante(s)
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={isProcessing || isUploading}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
