import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PricingPlans } from "@/components/pricing/pricing-plans"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function PricingPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={data.user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <PricingPlans user={data.user} profile={profile} />
      </main>
    </div>
  )
}
