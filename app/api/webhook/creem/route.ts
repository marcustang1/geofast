import { Webhook } from "@creem_io/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";

const PRO_CREDITS = 300;
const FREE_CREDITS = 5;

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onGrantAccess: async ({ customer, metadata }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error("[webhook] onGrantAccess: missing referenceId");
      return;
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("user_profiles")
      .update({
        plan: "pro",
        credits_remaining: PRO_CREDITS,
        credits_total: PRO_CREDITS,
        subscription_status: "active",
        customer_id: customer?.id ?? null,
        billing_cycle_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[webhook] onGrantAccess DB error:", error.message);
    } else {
      console.log(`[webhook] Granted Pro access to user ${userId}`);
    }
  },

  onRevokeAccess: async ({ customer, metadata }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error("[webhook] onRevokeAccess: missing referenceId");
      return;
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (profile?.plan === "free") return;

    const { error } = await supabase
      .from("user_profiles")
      .update({
        plan: "free",
        credits_remaining: FREE_CREDITS,
        credits_total: FREE_CREDITS,
        subscription_status: "canceled",
        billing_cycle_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[webhook] onRevokeAccess DB error:", error.message);
    } else {
      console.log(`[webhook] Revoked Pro access for user ${userId}`);
    }
  },
});
