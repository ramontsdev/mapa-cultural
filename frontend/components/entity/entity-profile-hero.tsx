"use client";

import { cn } from "@/lib/utils";

export type EntityProfileHeroProps = {
  coverUrl?: string | null;
  avatarUrl?: string | null;
  avatarFallback?: React.ReactNode;
  titleSlot: React.ReactNode;
  actionsSlot?: React.ReactNode;
  className?: string;
};

export function EntityProfileHero({
  coverUrl,
  avatarUrl,
  avatarFallback,
  titleSlot,
  actionsSlot,
  className,
}: EntityProfileHeroProps) {
  return (
    <div className={cn("border-b border-border bg-card", className)}>
      <div className="relative h-40 w-full overflow-hidden bg-muted md:h-48">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 pb-6 md:px-6">
        <div className="-mt-14 flex flex-col gap-4 md:-mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md md:h-32 md:w-32">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  {avatarFallback}
                </div>
              )}
            </div>
            <div className="min-w-0 space-y-1 pb-0 sm:pb-2">{titleSlot}</div>
          </div>
          {actionsSlot ? (
            <div className="flex flex-wrap gap-2 sm:justify-end">{actionsSlot}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
