import { createFileRoute } from "@tanstack/react-router";
import GroupPage from "@/features/groups/group";

export const Route = createFileRoute("/_protected/groups/$id")({
  component: GroupPage,
});
