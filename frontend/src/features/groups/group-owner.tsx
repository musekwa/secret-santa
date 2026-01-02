import { useQuery } from "@tanstack/react-query";
import { findByIdUserQueryOptions } from "@/lib/query-options/user.query-options";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GroupOwnerInfo({ owner_id }: { owner_id: string }) {
  const {
    data: owner,
    isLoading,
    error,
  } = useQuery(findByIdUserQueryOptions(owner_id));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="text-sm text-muted-foreground">
        Erro ao carregar informações do proprietário
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src="" alt={owner.name} />
        <AvatarFallback className="text-lg bg-primary/10">
          {getInitials(owner.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold">{owner.name}</h3>
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3 text-yellow-600" />
            Proprietário
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{owner.email}</span>
        </div>
        {owner.is_verified && (
          <Badge variant="default" className="mt-2">
            Verificado
          </Badge>
        )}
      </div>
    </div>
  );
}
