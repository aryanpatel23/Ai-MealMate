import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"

interface RecentMealPlansProps {
  userId: string
}

export async function RecentMealPlans({ userId }: RecentMealPlansProps) {
  const supabase = await createClient()

  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Meal Plans
          <Link href="/dashboard/meal-plans">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardTitle>
        <CardDescription>Your latest generated meal plans</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mealPlans && mealPlans.length > 0 ? (
          mealPlans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{plan.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(plan.week_start_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Link href={`/dashboard/meal-plans/${plan.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>

              {plan.dietary_preferences && plan.dietary_preferences.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {plan.dietary_preferences.slice(0, 3).map((pref: string) => (
                    <Badge key={pref} variant="secondary" className="text-xs">
                      {pref}
                    </Badge>
                  ))}
                  {plan.dietary_preferences.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{plan.dietary_preferences.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No meal plans yet</p>
            <p className="text-sm">Generate your first meal plan to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
