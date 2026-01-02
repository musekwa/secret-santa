import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { findByIdGroupQueryOptions } from "@/lib/query-options/group.query-options";
import CustomLoader from "@/components/custom-ui/custom-loader";
import CustomError from "@/components/custom-ui/custom-error";
import { Main } from "@/components/layouts/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Users,
  Crown,
  Calendar,
  Gift,
  UserCheck,
  Clock,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import GroupOwnerInfo from "./group-owner";
import { AddSingleParticipantDialog } from "./add-single-participant-dialog";
import { BulkUploadParticipantsDialog } from "./bulk-upload-participants-dialog";
import useDialogState from "@/hooks/use-dialog-state";
import { UserPlus, Upload } from "lucide-react";

export default function GroupPage() {
  const { id } = useParams({ from: "/_protected/groups/$id" });
  const {
    data: group,
    isLoading,
    error,
  } = useQuery(findByIdGroupQueryOptions(id));
  const [openSingleDialog, setOpenSingleDialog] = useDialogState();
  const [openBulkDialog, setOpenBulkDialog] = useDialogState();

  if (isLoading) return <CustomLoader />;
  if (error) return <CustomError resourceName="grupo" />;
  if (!group) return <CustomError resourceName="grupo" />;

  const participants = group.participants || [];
  const acceptedCount = participants.filter(
    (p: any) => p.status === "ACCEPTED"
  ).length;
  const pendingCount = participants.filter(
    (p: any) => p.status === "PENDING"
  ).length;
  const rejectedCount = participants.filter(
    (p: any) => p.status === "REJECTED"
  ).length;

  return (
    <Main fluid className="min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Criado em{" "}
                    {format(
                      new Date(group.created_at),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </span>
                </div>
                {group.is_active !== undefined && (
                  <Badge variant={group.is_active ? "default" : "secondary"}>
                    {group.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Owner Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Proprietário do Grupo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GroupOwnerInfo owner_id={group.owner_id} />
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total de Participantes
                    </p>
                    <p className="text-2xl font-bold">{participants.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Confirmados
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {acceptedCount}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pendentes
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {pendingCount}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Rejeitados
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {rejectedCount}
                    </p>
                  </div>
                  <UserX className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Participants Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participantes ({participants.length})
              </CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenSingleDialog(true)}
                  className="flex-1 sm:flex-initial"
                >
                  <UserPlus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Adicionar Participante</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenBulkDialog(true)}
                  className="flex-1 sm:flex-initial"
                >
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Upload em Massa</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  Nenhum participante ainda
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione participantes ao grupo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {participants.map((participant: any, index: number) => (
                  <div key={participant.user_id || index}>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" alt="Participant" />
                          <AvatarFallback>
                            {participant.user_id?.slice(0, 2).toUpperCase() ||
                              "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              Código: {participant.code}
                            </p>
                            <Badge
                              variant={
                                participant.status === "ACCEPTED"
                                  ? "default"
                                  : participant.status === "PENDING"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {participant.status === "ACCEPTED"
                                ? "Confirmado"
                                : participant.status === "PENDING"
                                  ? "Pendente"
                                  : "Rejeitado"}
                            </Badge>
                            {participant.role === "ADMIN" && (
                              <Badge variant="outline" className="gap-1">
                                <Crown className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {participant.gift_value > 0 && (
                              <div className="flex items-center gap-1">
                                <Gift className="h-4 w-4" />
                                <span>
                                  {participant.gift_value.toLocaleString(
                                    "pt-BR",
                                    {
                                      style: "currency",
                                      currency: "BRL",
                                    }
                                  )}
                                </span>
                              </div>
                            )}
                            {participant.code && (
                              <span className="font-mono text-xs">
                                Código: {participant.code}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < participants.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddSingleParticipantDialog
          open={!!openSingleDialog}
          onOpenChange={setOpenSingleDialog}
          groupId={id}
        />
        <BulkUploadParticipantsDialog
          open={!!openBulkDialog}
          onOpenChange={setOpenBulkDialog}
          groupId={id}
        />
      </div>
    </Main>
  );
}
