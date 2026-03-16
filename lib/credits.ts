import { createAdminClient } from "@/lib/supabase/admin";

const PLAN_CREDITS: Record<string, number> = { free: 5, pro: 300 };
const FREE_RESET_DAYS = 30;

export interface CreditStatus {
  plan: string;
  creditsRemaining: number;
  creditsTotal: number;
  canScan: boolean;
  subscriptionStatus: string;
}

export async function checkCredits(userId: string): Promise<CreditStatus> {
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("plan, credits_remaining, credits_total, billing_cycle_start, subscription_status")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    const { data: created } = await supabase
      .from("user_profiles")
      .upsert({
        id: userId,
        plan: "free",
        credits_remaining: PLAN_CREDITS.free,
        credits_total: PLAN_CREDITS.free,
        billing_cycle_start: new Date().toISOString(),
      })
      .select("plan, credits_remaining, credits_total, subscription_status")
      .single();

    return {
      plan: "free",
      creditsRemaining: created?.credits_remaining ?? PLAN_CREDITS.free,
      creditsTotal: created?.credits_total ?? PLAN_CREDITS.free,
      canScan: true,
      subscriptionStatus: "none",
    };
  }

  if (profile.plan === "free" && profile.billing_cycle_start) {
    const cycleStart = new Date(profile.billing_cycle_start);
    const daysPassed =
      (Date.now() - cycleStart.getTime()) / (1000 * 60 * 60 * 24);

    if (daysPassed >= FREE_RESET_DAYS) {
      await supabase
        .from("user_profiles")
        .update({
          credits_remaining: PLAN_CREDITS.free,
          credits_total: PLAN_CREDITS.free,
          billing_cycle_start: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      return {
        plan: "free",
        creditsRemaining: PLAN_CREDITS.free,
        creditsTotal: PLAN_CREDITS.free,
        canScan: true,
        subscriptionStatus: profile.subscription_status ?? "none",
      };
    }
  }

  return {
    plan: profile.plan,
    creditsRemaining: profile.credits_remaining,
    creditsTotal: profile.credits_total,
    canScan: profile.credits_remaining > 0,
    subscriptionStatus: profile.subscription_status ?? "none",
  };
}

export async function deductCredit(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("credits_remaining, total_scans")
    .eq("id", userId)
    .single();

  if (!profile || profile.credits_remaining <= 0) return false;

  const { error } = await supabase
    .from("user_profiles")
    .update({
      credits_remaining: profile.credits_remaining - 1,
      total_scans: (profile.total_scans ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("credits_remaining", profile.credits_remaining);

  return !error;
}
