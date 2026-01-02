import { Main } from "@/components/layouts/main";
import { findManyGroupsQueryOptions } from "@/lib/query-options/group.query-options";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import GroupList from "@/features/groups/group-list";
import type { Group } from "@/types/auth.types";
import CustomError from "@/components/custom-ui/custom-error";
import GroupsSkeleton from "../groups/groups-skeleton";

export default function Home() {
  const {
    data: groups,
    isLoading,
    isError,
  } = useQuery(findManyGroupsQueryOptions());

  if (isLoading) {
    return <GroupsSkeleton />;
  }

  if (isError) {
    return <CustomError resourceName="grupos" />;
  }

  const groupsList: Group[] = Array.isArray(groups) ? groups : [];

  return (
    <Main fluid className="flex-1 min-h-screen">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Grupos</h1>
          <p className="text-muted-foreground">
            {groupsList.length === 0
              ? "Nenhum grupo encontrado"
              : `${groupsList.length} ${groupsList.length === 1 ? "grupo" : "grupos"} encontrados`}
          </p>
        </div>

        {groupsList.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Nenhum grupo disponível
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie um novo grupo usando o menu do usuário
            </p>
          </div>
        ) : (
          <GroupList groupsList={groupsList} />
        )}
      </div>
    </Main>
  );
}
