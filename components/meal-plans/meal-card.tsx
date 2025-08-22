"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Heart, ChefHat } from "lucide-react"
import { useState } from "react"
import { MealDetailDialog } from "./meal-detail-dialog"

interface MealCardProps {
  meal: any
}

export function MealCard({ meal }: MealCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800"
      case "lunch":
        return "bg-green-100 text-green-800"
      case "dinner":
        return "bg-blue-100 text-blue-800"
      case "snack":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Badge className={getMealTypeColor(meal.meal_type)} variant="secondary">
              {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          <CardTitle className="text-lg leading-tight">{meal.recipe_name}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">{meal.recipe_description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(meal.prep_time || 0) + (meal.cook_time || 0)}m
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {meal.servings}
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="w-3 h-3" />
                {meal.calories_per_serving} cal
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MealDetailDialog meal={meal} open={showDetails} onOpenChange={setShowDetails} />
    </>
  )
}
