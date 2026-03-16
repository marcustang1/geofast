import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkCredits } from "@/lib/credits";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await checkCredits(user.id);

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("customer_id")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    plan: status.plan,
    creditsRemaining: status.creditsRemaining,
    creditsTotal: status.creditsTotal,
    canScan: status.canScan,
    subscriptionStatus: status.subscriptionStatus,
    customerId: profile?.customer_id ?? null,
  });
}
