import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MealPlanView } from "@/components/meal-plans/meal-plan-view"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface MealPlanPageProps {
  params: {
    id: string
  }
}

export default async function MealPlanPage({ params }: MealPlanPageProps) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get meal plan with meals
  const { data: mealPlan, error: mealPlanError } = await supabase
    .from("meal_plans")
    .select(`
      *,
      meals (*)
    `)
    .eq("id", params.id)
    .eq("user_id", data.user.id)
    .single()

  if (mealPlanError || !mealPlan) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={data.user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <MealPlanView mealPlan={mealPlan} userId={data.user.id} />
      </main>
    </div>
  )
}
