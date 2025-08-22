"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, ChefHat, Heart, Share, BookOpen } from "lucide-react"

interface MealDetailDialogProps {
  meal: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MealDetailDialog({ meal, open, onOpenChange }: MealDetailDialogProps) {
  const ingredients = typeof meal.ingredients === "string" ? JSON.parse(meal.ingredients) : meal.ingredients
  const nutrition = typeof meal.nutrition_info === "string" ? JSON.parse(meal.nutrition_info) : meal.nutrition_info

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge className={getMealTypeColor(meal.meal_type)} variant="secondary">
                {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
              </Badge>
              <DialogTitle className="text-2xl">{meal.recipe_name}</DialogTitle>
              <DialogDescription>{meal.recipe_description}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Info */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Prep: {meal.prep_time}m</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-muted-foreground" />
              <span>Cook: {meal.cook_time}m</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>Serves: {meal.servings}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{meal.calories_per_serving} cal/serving</span>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Ingredients</h3>
            <div className="grid gap-2">
              {ingredients?.map((ingredient: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
                  <span>{ingredient.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Instructions</h3>
            <div className="space-y-3">
              {meal.instructions?.map((instruction: string, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          {nutrition && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Nutrition (per serving)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-md">
                    <div className="text-lg font-semibold">{meal.calories_per_serving}</div>
                    <div className="text-xs text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-md">
                    <div className="text-lg font-semibold">{nutrition.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-md">
                    <div className="text-lg font-semibold">{nutrition.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-md">
                    <div className="text-lg font-semibold">{nutrition.fat}g</div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
