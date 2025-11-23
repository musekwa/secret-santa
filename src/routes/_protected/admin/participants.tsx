import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Participant = {
  id: string;
  name: string;
  email: string;
  amount: string;
  code: string;
  is_verified: boolean;
  is_admin?: boolean;
};

type HiddenFriendship = {
  id: string;
  participant_id: string;
  friend_id: string;
};

type ParticipantWithFriend = Participant & {
  friendName: string | null;
};

export const Route = createFileRoute("/_protected/admin/participants")({
  component: ParticipantsComponent,
});

function ParticipantsComponent() {
  const [participants, setParticipants] = useState<ParticipantWithFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] =
    useState<ParticipantWithFriend | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchParticipants = async () => {
    try {
      setLoading(true);

      // Fetch all participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("participants")
          .select("*")
          .order("name", { ascending: true });

      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        toast.error("Erro ao carregar participantes");
        return;
      }

      // Fetch all hidden friendships
      const { data: friendshipsData, error: friendshipsError } = await supabase
        .from("hidden_friendships")
        .select("*");

      if (friendshipsError) {
        console.error("Error fetching friendships:", friendshipsError);
        toast.error("Erro ao carregar relacionamentos");
        return;
      }

      // Map participants with their chosen friends
      const friendships = (friendshipsData as HiddenFriendship[]) || [];
      const participantsMap = new Map(
        (participantsData as Participant[]).map((p) => [p.id, p])
      );

      const participantsWithFriends: ParticipantWithFriend[] = (
        participantsData as Participant[]
      ).map((participant) => {
        const friendship = friendships.find(
          (f) => f.participant_id === participant.id
        );
        const friend = friendship
          ? participantsMap.get(friendship.friend_id)
          : null;

        return {
          ...participant,
          friendName: friend ? friend.name : null,
        };
      });

      setParticipants(participantsWithFriends);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleDeleteClick = (participant: ParticipantWithFriend) => {
    setParticipantToDelete(participant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!participantToDelete) return;

    setIsDeleting(true);
    try {
      // Delete participant (cascade will handle verifications and hidden_friendships)
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", participantToDelete.id);

      if (error) {
        console.error("Error deleting participant:", error);
        toast.error("Erro ao remover participante. Tente novamente.");
        return;
      }

      toast.success("Participante removido com sucesso!");
      setDeleteDialogOpen(false);
      setParticipantToDelete(null);
      await fetchParticipants();
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast.error("Erro ao remover participante. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAmount = (amount: string): string => {
    // Parse amount (handle both "3500" and "3500.00" formats)
    let num: number;
    if (amount.includes(".")) {
      const parts = amount.split(".");
      const lastPart = parts[parts.length - 1];
      // If last part has 1-2 digits, dot is decimal separator
      if (lastPart.length <= 2 && parts.length === 2) {
        num = Math.floor(parseFloat(amount));
      } else {
        // Thousands separator
        num = parseInt(amount.replace(/\./g, ""), 10);
      }
    } else if (amount.includes(",")) {
      num = Math.floor(parseFloat(amount.replace(/\./g, "").replace(",", ".")));
    } else {
      num = parseInt(amount, 10);
    }

    if (isNaN(num)) return amount;
    // Format as whole number with thousands separators
    return new Intl.NumberFormat("pt-MZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Gerenciar Participantes</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os participantes do Amigo Secreto
          </p>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Valor (MZN)</TableHead>
                <TableHead>Amigo Escolhido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ) : participants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum participante encontrado
                  </TableCell>
                </TableRow>
              ) : (
                participants.map((participant, index) => (
                  <TableRow key={participant.id}>
                    <TableCell className="text-muted-foreground font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {participant.name}
                      {participant.is_admin && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Admin
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {participant.email}
                    </TableCell>
                    <TableCell>
                      {formatAmount(participant.amount)} MZN
                    </TableCell>
                    <TableCell>
                      {participant.friendName ? (
                        <span className="font-medium text-primary">
                          {participant.friendName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.is_verified ? "default" : "outline"
                        }
                        className={
                          participant.is_verified
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }
                      >
                        {participant.is_verified
                          ? "Verificado"
                          : "Não Verificado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!participant.is_admin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(participant)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover Participante
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Participante</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{participantToDelete?.name}</strong>? Esta ação não pode
              ser desfeita. Todos os dados relacionados a este participante
              serão permanentemente removidos, incluindo:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Dados do participante</li>
                <li>Códigos de verificação</li>
                <li>Relacionamentos de amigo secreto</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setParticipantToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Removendo..." : "Confirmar Remoção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
