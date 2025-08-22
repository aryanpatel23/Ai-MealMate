"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface UpgradeSubscriptionParams {
  userId: string
  planId: string
  isYearly: boolean
}

export async function upgradeSubscription(params: UpgradeSubscriptionParams) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== params.userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Calculate subscription expiry date
    let expiresAt: Date | null = null
    if (params.planId !== "free") {
      expiresAt = new Date()
      if (params.isYearly) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      }
    }

    // Update user profile with new subscription
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_tier: params.planId,
        subscription_expires_at: expiresAt?.toISOString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.userId)

    if (updateError) {
      console.error("Error updating subscription:", updateError)
      return { success: false, error: "Failed to update subscription" }
    }

    // In a real application, you would:
    // 1. Process payment through Stripe, PayPal, etc.
    // 2. Create subscription record in payment processor
    // 3. Set up webhooks to handle subscription events
    // 4. Handle trial periods, proration, etc.

    // For demo purposes, we'll simulate a successful subscription
    console.log(`[v0] Simulated subscription upgrade to ${params.planId} for user ${params.userId}`)

    revalidatePath("/dashboard")
    revalidatePath("/pricing")
    return { success: true }
  } catch (error) {
    console.error("Error in upgradeSubscription:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function cancelSubscription(userId: string) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Update user profile to free tier
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_tier: "free",
        subscription_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error canceling subscription:", updateError)
      return { success: false, error: "Failed to cancel subscription" }
    }

    // In a real application, you would:
    // 1. Cancel subscription in payment processor
    // 2. Handle immediate vs end-of-period cancellation
    // 3. Send confirmation emails
    // 4. Update billing records

    console.log(`[v0] Simulated subscription cancellation for user ${userId}`)

    revalidatePath("/dashboard")
    revalidatePath("/pricing")
    return { success: true }
  } catch (error) {
    console.error("Error in cancelSubscription:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
