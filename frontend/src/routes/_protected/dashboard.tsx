import { createFileRoute } from "@tanstack/react-router"
// import { createFileRoute } from "@tanstack/react-router";
// import { useEffect, useState } from "react";
// // import { supabase } from "@/lib/supabase/client";
// import { useUser } from "@/hooks/use-user";
// import {
//   Card,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   ChevronRight,
//   MousePointerClick,
//   MoreVertical,
//   RotateCcw,
//   DollarSign,
//   LogOut,
// } from "lucide-react";
// import { toast } from "sonner";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useNavigate } from "@tanstack/react-router";
// import { clearUserFromStorage } from "@/hooks/use-user";
// import { Input } from "@/components/ui/input";

// type Participant = {
//   id: string;
//   name: string;
//   email: string;
//   amount: string;
//   code: string;
//   is_verified: boolean;
//   is_admin?: boolean;
// };

// type AmountRange = {
//   label: string;
//   min: number;
//   max: number | null; // null means no upper limit
//   participants: Participant[];
// };

// type HiddenFriendship = {
//   id: string;
//   participant_id: string;
//   friend_id: string;
// };

// type ParticipantWithStatus = Participant & {
//   escolheu: boolean; // has chosen someone
//   escolhido: boolean; // has been chosen by someone
// };

export const Route = createFileRoute("/_protected/dashboard")({
  component: () => <div>Dashboard</div>,
});

// function RouteComponent() {
//   const user = useUser();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [ranges, setRanges] = useState<AmountRange[]>([]);
//   const [selectedRange, setSelectedRange] = useState<AmountRange | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedParticipantId, setSelectedParticipantId] = useState<
//     string | null
//   >(null);
//   const [participantsWithStatus, setParticipantsWithStatus] = useState<
//     ParticipantWithStatus[]
//   >([]);
//   const [isSaving, setIsSaving] = useState(false);

//   // Dialog states for actions
//   const [isResetChoiceDialogOpen, setIsResetChoiceDialogOpen] = useState(false);
//   const [isChangeAmountDialogOpen, setIsChangeAmountDialogOpen] =
//     useState(false);
//   const [isQuitDialogOpen, setIsQuitDialogOpen] = useState(false);
//   const [isResetting, setIsResetting] = useState(false);
//   const [isQuitting, setIsQuitting] = useState(false);

//   // Parse amount from text format
//   // Handles: "3500.00" (dot as decimal), "3500,00" (comma as decimal), "3.500,00" (thousands + comma decimal), "3500"
//   const parseAmount = (amountStr: string): number => {
//     if (!amountStr) return 0;

//     let cleaned = amountStr.trim();

//     // If it contains both comma and dot
//     if (cleaned.includes(",") && cleaned.includes(".")) {
//       const lastComma = cleaned.lastIndexOf(",");
//       const lastDot = cleaned.lastIndexOf(".");

//       // The one that appears last is the decimal separator
//       if (lastComma > lastDot) {
//         // Format: "3.500,00" - comma is decimal, dot is thousands
//         cleaned = cleaned.replace(/\./g, "").replace(",", ".");
//       } else {
//         // Format: "3,500.00" - dot is decimal, comma is thousands
//         cleaned = cleaned.replace(/,/g, "");
//       }
//     } else if (cleaned.includes(",")) {
//       // Only comma - treat as decimal separator (Portuguese format: "3500,00")
//       // Remove any dots (thousands separators) first, then replace comma with dot
//       cleaned = cleaned.replace(/\./g, "").replace(",", ".");
//     } else if (cleaned.includes(".")) {
//       // Only dot - need to determine if it's decimal or thousands separator
//       const parts = cleaned.split(".");
//       const lastPart = parts[parts.length - 1];

//       // If last part has 1-2 digits, dot is decimal separator (e.g., "3500.00")
//       // If last part has 3+ digits, dots are thousands separators (e.g., "3.500")
//       if (lastPart.length <= 2 && parts.length === 2) {
//         // Decimal separator: "3500.00" -> "3500.00" (keep as is for parseFloat)
//         // No change needed, parseFloat will handle it
//       } else {
//         // Thousands separator: "3.500" -> "3500"
//         cleaned = cleaned.replace(/\./g, "");
//       }
//     }

//     const parsed = parseFloat(cleaned);
//     return isNaN(parsed) ? 0 : parsed;
//   };

//   // Group participants by amount ranges
//   const groupByRanges = (participants: Participant[]): AmountRange[] => {
//     const rangeDefinitions: Omit<AmountRange, "participants">[] = [
//       { label: "1.000 - 2.000 MZN", min: 1000, max: 2000 },
//       { label: "2.001 - 3.000 MZN", min: 2001, max: 3000 },
//       { label: "3.001 - 3.999 MZN", min: 3001, max: 3999 },
//       { label: "4.000+ MZN", min: 4000, max: null },
//     ];

//     const grouped: AmountRange[] = rangeDefinitions.map((def) => ({
//       ...def,
//       participants: participants.filter((p) => {
//         const amount = parseAmount(p.amount);
//         if (def.max === null) {
//           return amount >= def.min;
//         }
//         return amount >= def.min && amount <= def.max;
//       }),
//     }));

//     return grouped;
//   };

//   const fetchData = async () => {
//     // try {
//     //   setLoading(true);

//     //   // Fetch participants
//     //   const { data: participantsData, error: participantsError } =
//     //     await supabase
//     //       .from("participants")
//     //       .select("*")
//     //       .order("name", { ascending: true });

//     //   if (participantsError) {
//     //     console.error("Error fetching participants:", participantsError);
//     //     toast.error("Erro ao carregar participantes");
//     //     return;
//     //   }

//     //   // Fetch hidden friendships
//     //   const { data: friendshipsData, error: friendshipsError } = await supabase
//     //     .from("hidden_friendships")
//     //     .select("*");

//     //   if (friendshipsError) {
//     //     console.error("Error fetching friendships:", friendshipsError);
//     //     toast.error("Erro ao carregar relacionamentos");
//     //     return;
//     //   }

//     //   if (participantsData) {
//     //     // Filter out admin users from participants list
//     //     const nonAdminParticipants = (participantsData as Participant[]).filter(
//     //       (p) => !p.is_admin && p.email !== "musekwa2011@gmail.com"
//     //     );

//     //     const grouped = groupByRanges(nonAdminParticipants);
//     //     setRanges(grouped);

//     //     // Map participants with status (excluding admin)
//     //     const friendships = (friendshipsData as HiddenFriendship[]) || [];
//     //     const participantsWithStatus: ParticipantWithStatus[] =
//     //       nonAdminParticipants
//     //         .map((participant) => {
//     //           const escolheu = friendships.some(
//     //             (f) => f.participant_id === participant.id
//     //           );
//     //           const escolhido = friendships.some(
//     //             (f) => f.friend_id === participant.id
//     //           );

//     //           return {
//     //             ...participant,
//     //             escolheu,
//     //             escolhido,
//     //           };
//     //         })
//     //         .sort((a, b) => a.name.localeCompare(b.name));

//     //     setParticipantsWithStatus(participantsWithStatus);
//     //   }
//     // } catch (error) {
//     //   console.error("Error fetching data:", error);
//     //   toast.error("Erro ao carregar dados");
//     // } finally {
//     //   setLoading(false);
//     // }
//   };

//   // Handler for resetting choice
//   const handleResetChoice = async () => {
//     if (!user?.id) {
//       toast.error("Usuário não autenticado");
//       return;
//     }

//     setIsResetting(true);
//     try {
//       // Delete the friendship record where participant_id = user.id
//       const { error } = await supabase
//         .from("hidden_friendships")
//         .delete()
//         .eq("participant_id", user.id);

//       if (error) {
//         console.error("Error resetting choice:", error);
//         toast.error("Erro ao resetar escolha. Tente novamente.");
//         return;
//       }

//       toast.success("Escolha resetada com sucesso!");
//       setIsResetChoiceDialogOpen(false);
//       await fetchData();
//     } catch (error) {
//       console.error("Error resetting choice:", error);
//       toast.error("Erro ao resetar escolha. Tente novamente.");
//     } finally {
//       setIsResetting(false);
//     }
//   };

//   // Handler for changing amount
//   const handleChangeAmount = async (newAmount: string) => {
//     // if (!user?.id) {
//     //   toast.error("Usuário não autenticado");
//     //   return;
//     // }

//     // try {
//     //   const { error } = await supabase
//     //     .from("participants")
//     //     .update({ amount: newAmount })
//     //     .eq("id", user.id);

//     //   if (error) {
//     //     console.error("Error updating amount:", error);
//     //     toast.error("Erro ao atualizar valor. Tente novamente.");
//     //     return;
//     //   }

//     //   toast.success("Valor atualizado com sucesso!");
//     //   setIsChangeAmountDialogOpen(false);
//     //   await fetchData();
//     // } catch (error) {
//     //   console.error("Error updating amount:", error);
//     //   toast.error("Erro ao atualizar valor. Tente novamente.");
//     // }
//   };

//   // Handler for quitting participation
//   const handleQuitParticipation = async () => {
//     if (!user?.id) {
//       toast.error("Usuário não autenticado");
//       return;
//     }

//     setIsQuitting(true);
//     try {
//       // Delete participant (cascade will handle verifications and hidden_friendships)
//       const { error } = await supabase
//         .from("participants")
//         .delete()
//         .eq("id", user.id);

//       if (error) {
//         console.error("Error deleting participant:", error);
//         toast.error("Erro ao remover participação. Tente novamente.");
//         return;
//       }

//       toast.success("Participação removida com sucesso!");
//       clearUserFromStorage();
//       setIsQuitDialogOpen(false);
//       navigate({ to: "/login", replace: true });
//     } catch (error) {
//       console.error("Error deleting participant:", error);
//       toast.error("Erro ao remover participação. Tente novamente.");
//     } finally {
//       setIsQuitting(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="container mx-auto p-6 space-y-6">
//         <div className="space-y-2">
//           <Skeleton className="h-8 w-64" />
//           <Skeleton className="h-4 w-96" />
//         </div>
//         <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//           {[1, 2, 3, 4].map((i) => (
//             <Card key={i}>
//               <CardHeader>
//                 <Skeleton className="h-6 w-32" />
//                 <Skeleton className="h-4 w-24" />
//               </CardHeader>
//             </Card>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <div className="space-y-2">
//         <h1 className="text-3xl font-bold">Códigos dos Participantes</h1>
//         <p className="text-muted-foreground">Organizados por faixa de valor</p>
//       </div>

//       <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//         {ranges.map((range) => (
//           <Card
//             key={range.label}
//             className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 relative ${
//               range.participants.length === 0
//                 ? "opacity-60 cursor-not-allowed"
//                 : ""
//             }`}
//             onClick={() => {
//               if (range.participants.length > 0) {
//                 setSelectedRange(range);
//                 setIsDialogOpen(true);
//               }
//             }}
//           >
//             {range.participants.length > 0 && (
//               <div className="absolute top-4 right-4 text-primary opacity-60 hover:opacity-100 transition-opacity">
//                 <ChevronRight className="h-5 w-5" />
//               </div>
//             )}
//             <CardHeader>
//               <CardTitle className="text-base font-semibold mb-2">
//                 {range.label}
//               </CardTitle>
//               <div className="flex items-baseline gap-2 mb-2">
//                 <span className="text-4xl font-bold text-primary">
//                   {range.participants.length}
//                 </span>
//                 <span className="text-sm text-muted-foreground">
//                   participante{range.participants.length !== 1 ? "s" : ""}
//                 </span>
//               </div>
//               <CardDescription>
//                 <p>
//                   {range.max === null
//                     ? "Participantes com valores acima de 4.000 MZN"
//                     : `Participantes com valores entre ${range.min.toLocaleString("pt-MZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} e ${range.max.toLocaleString("pt-MZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MZN`}
//                 </p>
//                 {range.participants.length > 0 && (
//                   <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
//                     <MousePointerClick className="h-3 w-3" />
//                     Clique para ver códigos
//                   </p>
//                 )}
//               </CardDescription>
//             </CardHeader>
//           </Card>
//         ))}
//       </div>

//       <Dialog
//         open={isDialogOpen}
//         onOpenChange={(open) => {
//           setIsDialogOpen(open);
//           if (!open) {
//             // Reset selection when dialog closes
//             setSelectedParticipantId(null);
//           }
//         }}
//       >
//         <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{selectedRange?.label} - Participantes</DialogTitle>
//             <DialogDescription>
//               {user &&
//               participantsWithStatus.find((p) => p.id === user.id)?.escolheu ? (
//                 <span className="text-amber-600 dark:text-amber-400 font-medium">
//                   Você já fez uma escolha. Por favor, resetar sua escolha antes
//                   de escolher novamente.
//                 </span>
//               ) : (
//                 <>
//                   {selectedRange?.participants.length} participante
//                   {selectedRange?.participants.length !== 1 ? "s" : ""} nesta
//                   faixa de valor. Clique em um código para selecioná-lo.
//                 </>
//               )}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-3 mt-4">
//             {selectedRange?.participants.map((participant) => {
//               const isSelected = selectedParticipantId === participant.id;
//               const hasAlreadyChosen =
//                 user &&
//                 participantsWithStatus.find((p) => p.id === user.id)?.escolheu;
//               return (
//                 <div
//                   key={participant.id}
//                   onClick={() => {
//                     // Prevent selection if user has already chosen someone
//                     if (hasAlreadyChosen) {
//                       toast.error(
//                         "Você já fez uma escolha. Por favor, resetar sua escolha antes de escolher novamente."
//                       );
//                       return;
//                     }
//                     // Toggle selection: if clicking the same item, deselect; otherwise select the new one
//                     if (isSelected) {
//                       setSelectedParticipantId(null);
//                     } else {
//                       setSelectedParticipantId(participant.id);
//                     }
//                   }}
//                   className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
//                     hasAlreadyChosen
//                       ? "opacity-50 cursor-not-allowed bg-muted/20"
//                       : isSelected
//                         ? "bg-primary/10 border-primary border-2 cursor-pointer"
//                         : "bg-muted/30 hover:bg-muted/50 border cursor-pointer"
//                   }`}
//                 >
//                   <Avatar className="h-12 w-12">
//                     <AvatarImage src="" alt={participant.code} />
//                     <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
//                       {participant.code.slice(0, 2)}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="flex items-center gap-2 flex-1">
//                     <span className="font-mono text-lg font-bold text-primary">
//                       {participant.code}
//                     </span>
//                     {participant.is_verified && (
//                       <Badge variant="default" className="text-xs">
//                         Verificado
//                       </Badge>
//                     )}
//                   </div>
//                   {isSelected && (
//                     <div className="text-primary">
//                       <ChevronRight className="h-5 w-5" />
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//           <DialogFooter>
//             {selectedParticipantId &&
//               !(
//                 user &&
//                 participantsWithStatus.find((p) => p.id === user.id)?.escolheu
//               ) && (
//                 <Button
//                   onClick={async () => {
//                     if (!user) {
//                       toast.error("Usuário não autenticado");
//                       return;
//                     }

//                     const selectedParticipant =
//                       selectedRange?.participants.find(
//                         (p) => p.id === selectedParticipantId
//                       );

//                     if (!selectedParticipant) {
//                       toast.error("Participante não encontrado");
//                       return;
//                     }

//                     // Verify that the user exists in the participants table
//                     const { data: userParticipant, error: userCheckError } =
//                       await supabase
//                         .from("participants")
//                         .select("id")
//                         .eq("id", user.id)
//                         .maybeSingle();

//                     if (userCheckError || !userParticipant) {
//                       console.error(
//                         "User not found in participants:",
//                         userCheckError
//                       );
//                       toast.error(
//                         "Erro: Seu usuário não foi encontrado na lista de participantes. Por favor, faça login novamente."
//                       );
//                       return;
//                     }

//                     // Check if user has already chosen someone
//                     const { data: existingChoice } = await supabase
//                       .from("hidden_friendships")
//                       .select("*")
//                       .eq("participant_id", user.id)
//                       .maybeSingle();

//                     if (existingChoice) {
//                       toast.error(
//                         "Você já escolheu um participante. Não é possível escolher novamente."
//                       );
//                       return;
//                     }

//                     // Check if the selected participant has already been chosen by someone else
//                     const { data: alreadyChosen } = await supabase
//                       .from("hidden_friendships")
//                       .select("*")
//                       .eq("friend_id", selectedParticipantId)
//                       .maybeSingle();

//                     if (alreadyChosen) {
//                       toast.error(
//                         "Este participante já foi escolhido por outra pessoa."
//                       );
//                       return;
//                     }

//                     setIsSaving(true);

//                     try {
//                       // Save to database
//                       const { error: insertError } = await supabase
//                         .from("hidden_friendships")
//                         .insert({
//                           participant_id: user.id,
//                           friend_id: selectedParticipantId,
//                         });

//                       if (insertError) {
//                         console.error("Error saving selection:", insertError);

//                         // Provide more specific error messages
//                         if (insertError.code === "23503") {
//                           toast.error(
//                             "Erro: Seu usuário não foi encontrado na lista de participantes. Por favor, faça login novamente."
//                           );
//                         } else if (insertError.code === "23505") {
//                           toast.error(
//                             "Esta seleção já existe no banco de dados."
//                           );
//                         } else {
//                           toast.error(
//                             "Erro ao salvar seleção. Tente novamente."
//                           );
//                         }
//                         return;
//                       }

//                       toast.success(
//                         `Código ${selectedParticipant.code} selecionado com sucesso!`
//                       );

//                       // Refresh data to update the table
//                       await fetchData();

//                       setSelectedParticipantId(null);
//                       setIsDialogOpen(false);
//                     } catch (error) {
//                       console.error("Error saving selection:", error);
//                       toast.error("Erro ao salvar seleção. Tente novamente.");
//                     } finally {
//                       setIsSaving(false);
//                     }
//                   }}
//                   disabled={isSaving}
//                   className="w-full sm:w-auto"
//                 >
//                   {isSaving ? "Salvando..." : "Confirmar Seleção"}
//                 </Button>
//               )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Participants Table */}
//       <div className="space-y-4">
//         <div className="space-y-2">
//           <h2 className="text-2xl font-bold">Lista de Participantes</h2>
//           <p className="text-muted-foreground">
//             Todos os participantes e seu status de escolha
//           </p>
//         </div>
//         <div className="rounded-lg border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-12">#</TableHead>
//                 <TableHead>Participante</TableHead>
//                 <TableHead>Escolheu</TableHead>
//                 <TableHead className="w-24">Ação</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={4} className="text-center py-8">
//                     <Skeleton className="h-4 w-full" />
//                   </TableCell>
//                 </TableRow>
//               ) : participantsWithStatus.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={4}
//                     className="text-center py-8 text-muted-foreground"
//                   >
//                     Nenhum participante encontrado
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 participantsWithStatus.map((participant, index) => (
//                   <TableRow key={participant.id}>
//                     <TableCell className="text-muted-foreground font-medium">
//                       {index + 1}
//                     </TableCell>
//                     <TableCell className="font-medium">
//                       {participant.name}
//                     </TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={participant.escolheu ? "default" : "outline"}
//                         className={
//                           participant.escolheu
//                             ? "bg-green-500 text-white hover:bg-green-600"
//                             : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                         }
//                       >
//                         {participant.escolheu ? "Sim" : "Não"}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       {user?.id === participant.id ? (
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-8 w-8"
//                             >
//                               <MoreVertical className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem
//                               onClick={() => {
//                                 if (participant.escolheu) {
//                                   setIsResetChoiceDialogOpen(true);
//                                 } else {
//                                   toast.info("Você ainda não fez uma escolha.");
//                                 }
//                               }}
//                               disabled={!participant.escolheu}
//                             >
//                               <RotateCcw className="mr-2 h-4 w-4" />
//                               Recomeçar Escolha
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => {
//                                 setIsChangeAmountDialogOpen(true);
//                               }}
//                             >
//                               <DollarSign className="mr-2 h-4 w-4" />
//                               Alterar Valor
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => setIsQuitDialogOpen(true)}
//                               className="text-red-600 focus:text-red-600"
//                             >
//                               <LogOut className="mr-2 h-4 w-4" />
//                               Sair da Participação
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       ) : (
//                         <span className="text-muted-foreground text-sm">-</span>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       {/* Reset Choice Dialog */}
//       <Dialog
//         open={isResetChoiceDialogOpen}
//         onOpenChange={setIsResetChoiceDialogOpen}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Recomeçar Escolha</DialogTitle>
//             <DialogDescription>
//               Tem certeza que deseja resetar sua escolha? Você poderá escolher
//               novamente depois.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setIsResetChoiceDialogOpen(false)}
//               disabled={isResetting}
//             >
//               Cancelar
//             </Button>
//             <Button onClick={handleResetChoice} disabled={isResetting}>
//               {isResetting ? "Recomeçando..." : "Confirmar"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Change Amount Dialog */}
//       <Dialog
//         open={isChangeAmountDialogOpen}
//         onOpenChange={setIsChangeAmountDialogOpen}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Alterar Valor do Presente</DialogTitle>
//             <DialogDescription>
//               Digite o novo valor do presente (mínimo: 1.000 MZN)
//             </DialogDescription>
//           </DialogHeader>
//           <ChangeAmountForm
//             currentAmount={
//               typeof user?.amount === "string"
//                 ? user.amount
//                 : String(user?.amount || "1000")
//             }
//             onSubmit={(newAmount: string) => {
//               handleChangeAmount(newAmount);
//             }}
//             onCancel={() => setIsChangeAmountDialogOpen(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* Quit Participation Dialog */}
//       <Dialog open={isQuitDialogOpen} onOpenChange={setIsQuitDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Sair da Participação</DialogTitle>
//             <DialogDescription>
//               Tem certeza que deseja sair da participação? Esta ação não pode
//               ser desfeita. Todos os seus dados serão permanentemente removidos.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setIsQuitDialogOpen(false)}
//               disabled={isQuitting}
//             >
//               Cancelar
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleQuitParticipation}
//               disabled={isQuitting}
//             >
//               {isQuitting ? "Removendo..." : "Confirmar Saída"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // Change Amount Form Component
// function ChangeAmountForm({
//   currentAmount,
//   onSubmit,
//   onCancel,
// }: {
//   currentAmount: string;
//   onSubmit: (amount: string) => void;
//   onCancel: () => void;
// }) {
//   const [amountValue, setAmountValue] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     // Parse current amount for display (handle both "3500" and "3500.00" formats)
//     let num: number;

//     // If it contains a dot, check if it's decimal or thousands separator
//     if (currentAmount.includes(".")) {
//       const parts = currentAmount.split(".");
//       const lastPart = parts[parts.length - 1];

//       // If last part has 1-2 digits, dot is decimal separator (e.g., "3500.00")
//       if (lastPart.length <= 2 && parts.length === 2) {
//         // Decimal separator: parse as float then floor
//         num = Math.floor(parseFloat(currentAmount));
//       } else {
//         // Thousands separator: remove dots and parse
//         num = parseInt(currentAmount.replace(/\./g, ""), 10);
//       }
//     } else if (currentAmount.includes(",")) {
//       // Comma as decimal separator: remove dots, replace comma with dot, parse
//       num = Math.floor(
//         parseFloat(currentAmount.replace(/\./g, "").replace(",", "."))
//       );
//     } else {
//       // No separators: parse directly
//       num = parseInt(currentAmount, 10);
//     }

//     if (!isNaN(num) && num > 0) {
//       setAmountValue(num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
//     } else {
//       setAmountValue("1000");
//     }
//   }, [currentAmount]);

//   const formatAmount = (value: string): string => {
//     // Remove all non-digit characters
//     const cleaned = value.replace(/\D/g, "");
//     if (!cleaned) return "";
//     // Format with thousands separators (no decimals)
//     return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
//   };

//   const parseAmount = (formatted: string): number => {
//     // Remove all non-digit characters
//     return parseInt(formatted.replace(/\D/g, ""), 10) || 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const parsed = parseAmount(amountValue);
//     if (isNaN(parsed) || parsed < 1000) {
//       toast.error("O valor mínimo é 1.000 MZN");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       // Format amount as string for database (whole number)
//       const amountString = parsed.toString();
//       onSubmit(amountString);
//     } catch (error) {
//       console.error("Error submitting amount:", error);
//       toast.error("Erro ao atualizar valor. Tente novamente.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <label
//           htmlFor="amount"
//           className="text-sm font-medium text-slate-700 dark:text-slate-300 block"
//         >
//           Valor (MZN)
//         </label>
//         <Input
//           id="amount"
//           type="text"
//           placeholder="1.000"
//           value={amountValue}
//           onChange={(e) => {
//             const formatted = formatAmount(e.target.value);
//             setAmountValue(formatted);
//           }}
//           className="h-12 text-base"
//           disabled={isSubmitting}
//           autoFocus
//         />
//         <p className="text-xs text-muted-foreground">Valor mínimo: 1.000 MZN</p>
//       </div>
//       <DialogFooter>
//         <Button
//           type="button"
//           variant="outline"
//           onClick={onCancel}
//           disabled={isSubmitting}
//         >
//           Cancelar
//         </Button>
//         <Button
//           type="submit"
//           disabled={
//             isSubmitting || !amountValue || parseAmount(amountValue) < 1000
//           }
//         >
//           {isSubmitting ? "Atualizando..." : "Atualizar Valor"}
//         </Button>
//       </DialogFooter>
//     </form>
//   );
// }


export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}