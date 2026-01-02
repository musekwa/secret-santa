import type { Group, Participant } from "@/types/auth.types";
import GroupCard from "./group-card";
import { groupStatus } from "@/data";

export default function GroupList({ groupsList }: { groupsList: Group[] }) {
  const getParticipantCounts = (participants: Participant[]) => {
    const total = participants.length;
    const accepted = participants.filter(
      (p) => p.status === groupStatus.ACCEPTED
    ).length;
    const pending = participants.filter(
      (p) => p.status === groupStatus.PENDING
    ).length;
    return { total, accepted, pending };
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groupsList.map((group, index) => {
        const { total, accepted, pending } = getParticipantCounts(
          group.participants || []
        );
        return (
          <GroupCard
            key={index}
            group={group}
            index={index}
            total={total}
            accepted={accepted}
            pending={pending}
          />
        );
      })}
    </div>
  );
}
