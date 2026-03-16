"use client";

import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: string;
  onUpgrade: () => void;
  onSignIn?: () => void;
  isLoggedIn: boolean;
}

export function UpgradeModal({
  open,
  onOpenChange,
  plan,
  onUpgrade,
  onSignIn,
  isLoggedIn,
}: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLoggedIn
              ? "You've used all your scans"
              : "Free trials used up"}
          </DialogTitle>
          <DialogDescription>
            {isLoggedIn && plan === "free"
              ? "Upgrade to Pro for 300 scans/month and unlimited history."
              : isLoggedIn && plan === "pro"
                ? "Your credits will reset at the start of your next billing cycle."
                : "Sign in for 5 free scans per month, or upgrade to Pro."}
          </DialogDescription>
        </DialogHeader>

        {(!isLoggedIn || plan === "free") && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="font-semibold text-foreground">
                Pro — $9.9/month
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {[
                "300 scans per month",
                "Unlimited scan history",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check size={14} className="text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {plan === "pro" ? "Got it" : "Maybe later"}
          </Button>
          {!isLoggedIn && onSignIn ? (
            <Button onClick={onSignIn}>Sign in</Button>
          ) : plan === "free" ? (
            <Button onClick={onUpgrade}>Upgrade to Pro</Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
