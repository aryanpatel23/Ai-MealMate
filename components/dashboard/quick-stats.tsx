import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ChefHat, ShoppingCart, Star } from "lucide-react"

interface QuickStatsProps {
  userId: string
}

export async function QuickStats({ userId }: QuickStatsProps) {
  const supabase = await createClient()

  // Get stats
  const [mealPlansResult, recipesResult, shoppingListsResult] = await Promise.all([
    supabase.from("meal_plans").select("id").eq("user_id", userId),
    supabase.from("saved_recipes").select("id").eq("user_id", userId),
    supabase.from("shopping_lists").select("id").eq("user_id", userId),
  ])

  const stats = [
    {
      title: "Meal Plans Created",
      value: mealPlansResult.data?.length || 0,
      icon: Calendar,
      description: "Total meal plans generated",
    },
    {
      title: "Saved Recipes",
      value: recipesResult.data?.length || 0,
      icon: ChefHat,
      description: "Recipes in your collection",
    },
    {
      title: "Shopping Lists",
      value: shoppingListsResult.data?.length || 0,
      icon: ShoppingCart,
      description: "Generated shopping lists",
    },
    {
      title: "Favorite Meals",
      value: recipesResult.data?.filter((r: any) => r.is_favorite)?.length || 0,
      icon: Star,
      description: "Your favorite recipes",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
