import { Main } from "../layouts/main";
import { AlertCircle } from "lucide-react";

export default function CustomError({ resourceName }: { resourceName: string }) {

    return (
        <Main
        fluid
        className="flex-1 min-h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Erro ao carregar {resourceName}</h2>
          <p className="text-sm text-muted-foreground">
            Tente recarregar a página ou contate o suporte
          </p>
        </div>
      </Main>
    )
}