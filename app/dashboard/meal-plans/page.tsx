import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MealPlansGrid } from "@/components/meal-plans/meal-plans-grid"

export default async function MealPlansPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get all meal plans for the user
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={data.user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <MealPlansGrid mealPlans={mealPlans || []} userId={data.user.id} />
      </main>
    </div>
  )
}
