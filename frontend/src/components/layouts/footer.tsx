import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex flex-col items-center gap-1 md:flex-row md:gap-2">
          <p>© {currentYear} AMICULTO - Amigos Ocultos</p>
          <span className="hidden md:inline">•</span>
          <p>TECMOZA</p>
        </div>
        <p className="text-xs">Todos os direitos reservados</p>
      </div>
    </footer>
  );
}
