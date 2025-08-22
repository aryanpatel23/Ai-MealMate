import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ShoppingListsGrid } from "@/components/shopping-lists/shopping-lists-grid"

export default async function ShoppingListsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get all shopping lists for the user
  const { data: shoppingLists } = await supabase
    .from("shopping_lists")
    .select(`
      *,
      meal_plans (title, week_start_date)
    `)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={data.user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <ShoppingListsGrid shoppingLists={shoppingLists || []} userId={data.user.id} />
      </main>
    </div>
  )
}
