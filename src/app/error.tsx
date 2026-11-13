"use client";

import { useEffect } from "react";
import { DatabaseIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Empty className="max-w-md border bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <DatabaseIcon />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load contacts</EmptyTitle>
          <EmptyDescription>
            The database didn&apos;t respond. Check that your Supabase keys are
            set in .env.local and the contacts table exists.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => retry()}>Try again</Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
