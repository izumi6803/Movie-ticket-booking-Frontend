"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="w-full mt-4 text-sm text-muted-foreground text-center">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="w-full mt-4 text-sm text-muted-foreground text-center">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  message = "No data found",
  action,
}: EmptyStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <p className="w-full text-sm text-muted-foreground text-center">{message}</p>
      {action && (
        <Button variant="outline" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
