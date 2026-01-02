import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Group } from "@/types/auth.types";
import { UserCheck, Clock10Icon, Gift } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function GroupCard({
  group,
  index,
  total,
  accepted,
  pending,
}: {
  group: Group;
  index: number;
  total: number;
  accepted: number;
  pending: number;
}) {
  const navigate = useNavigate();
  return (
    <Card
      key={group.id || index}
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        navigate({
          to: "/groups/$id",
          params: { id: group.id },
        });
      }}
    >
      <CardHeader>
        <CardTitle className="text-xl">{group.name}</CardTitle>
        <CardDescription>
          {total === 0
            ? "Nenhum participante"
            : `${total} ${total === 1 ? "participante" : "participantes"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span>Confirmados</span>
            </div>
            <span className="font-semibold">{accepted}</span>
          </div>
          {pending > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock10Icon className="h-4 w-4 text-yellow-600" />
                <span>Pendentes</span>
              </div>
              <span className="font-semibold">{pending}</span>
            </div>
          )}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="h-4 w-4" />
              <span>
                {group.participants?.length > 0
                  ? `${group.participants.filter((p) => p.gift_value > 0).length} com valor definido`
                  : "Nenhum valor definido"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
