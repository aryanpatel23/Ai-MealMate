import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MealPlanGenerator } from "@/components/dashboard/meal-plan-generator"
import { RecentMealPlans } from "@/components/dashboard/recent-meal-plans"
import { QuickStats } from "@/components/dashboard/quick-stats"

export default async function DashboardPage() {
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
        <div className="grid gap-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || data.user.email}!</h1>
            <p className="text-muted-foreground">Ready to create your next personalized meal plan?</p>
          </div>

          {/* Quick Stats */}
          <QuickStats userId={data.user.id} />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Meal Plan Generator */}
            <div className="lg:col-span-2">
              <MealPlanGenerator userId={data.user.id} profile={profile} />
            </div>

            {/* Recent Meal Plans */}
            <div className="lg:col-span-1">
              <RecentMealPlans userId={data.user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
