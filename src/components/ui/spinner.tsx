import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] w-full">
      <Loader2Icon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  );
}

export { Spinner };
