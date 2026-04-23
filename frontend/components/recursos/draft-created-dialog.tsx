"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  /** Ex.: "Meus eventos" */
  nomeSecaoMeus: string;
  /** Ex.: "Ver evento" */
  verItemLabel: string;
  onVer: () => void;
  onCompletarDepois: () => void;
  onCompletarInformacoes: () => void;
};

export function DraftCreatedDialog({
  open,
  onOpenChange,
  titulo,
  nomeSecaoMeus,
  verItemLabel,
  onVer,
  onCompletarDepois,
  onCompletarInformacoes,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription className="text-left">
            Você pode completar as informações agora ou mais tarde. Os
            rascunhos ficam em{" "}
            <strong className="text-foreground">{nomeSecaoMeus}</strong>, na
            aba <strong className="text-foreground">Rascunhos</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                onVer();
                onOpenChange(false);
              }}
            >
              {verItemLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full bg-destructive/15 text-destructive hover:bg-destructive/25 sm:w-auto"
              onClick={() => {
                onCompletarDepois();
                onOpenChange(false);
              }}
            >
              Completar depois
            </Button>
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              onCompletarInformacoes();
              onOpenChange(false);
            }}
          >
            Completar informações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
