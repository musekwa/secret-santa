import { Loader} from "lucide-react";
import { cn } from "@/lib/utils";
import { Main } from "../layouts/main";

export default function CustomLoader({ className }: { className?: string }) {
    return (
        <Main fluid>
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] w-full">
        <Loader className={cn("size-4 animate-spin", className)} />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    </Main>
  );
}