"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface ProfileData {
  plan: string;
  creditsRemaining: number;
  creditsTotal: number;
  canScan: boolean;
  subscriptionStatus: string;
  customerId: string | null;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile();
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile();
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) setProfile(await res.json());
    } catch {
      // silent
    }
  }

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.reload();
  }

  function handleManage() {
    if (!profile?.customerId) return;
    window.location.href = `/portal?customerId=${profile.customerId}`;
  }

  function handleUpgrade() {
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  if (isLoading) return null;

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={handleSignIn}>
        <GoogleIcon />
        Sign in
      </Button>
    );
  }

  const name =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "User";
  const avatar = user.user_metadata?.avatar_url;
  const isPro = profile?.plan === "pro";

  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-7 w-7 rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {name[0]?.toUpperCase()}
        </div>
      )}

      <div className="hidden items-center gap-1.5 sm:flex">
        <span className="text-sm font-medium text-foreground">{name}</span>
        {isPro ? (
          <Badge
            variant="default"
            className="h-5 px-1.5 text-[10px] font-semibold"
          >
            <Sparkles size={10} className="mr-0.5" />
            PRO
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] font-semibold"
          >
            FREE
          </Badge>
        )}
      </div>

      {profile && (
        <span className="hidden text-xs tabular-nums text-muted-foreground lg:inline">
          {profile.creditsRemaining}/{profile.creditsTotal}
        </span>
      )}

      {isPro ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManage}
          className="h-7 w-7 p-0"
          title="Manage subscription"
        >
          <Settings size={14} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUpgrade}
          className="hidden h-7 gap-0.5 px-2 text-xs text-primary sm:flex"
        >
          Upgrade
          <ArrowUpRight size={12} />
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="h-7 w-7 p-0"
        title="Sign out"
      >
        <LogOut size={14} />
      </Button>
    </div>
  );
}
