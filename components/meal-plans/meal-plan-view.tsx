"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Utensils, Download, Share, FileText, Mail, Link2, Printer } from "lucide-react"
import { MealCard } from "./meal-card"
import { ShoppingListGenerator } from "../shopping-lists/shopping-list-generator"
import { exportMealPlan, shareMealPlan } from "@/lib/actions/meal-plan-export"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

interface MealPlanViewProps {
  mealPlan: any
  userId: string
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function MealPlanView({ mealPlan, userId }: MealPlanViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Group meals by day
  const mealsByDay = mealPlan.meals.reduce((acc: any, meal: any) => {
    if (!acc[meal.day_of_week]) {
      acc[meal.day_of_week] = []
    }
    acc[meal.day_of_week].push(meal)
    return acc
  }, {})

  // Sort meals by meal type
  const mealTypeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 }
  Object.keys(mealsByDay).forEach((day) => {
    mealsByDay[day].sort((a: any, b: any) => mealTypeOrder[a.meal_type] - mealTypeOrder[b.meal_type])
  })

  const nutritionSummary = mealPlan.meals.reduce(
    (acc: any, meal: any) => {
      const nutrition =
        typeof meal.nutrition_info === "string" ? JSON.parse(meal.nutrition_info) : meal.nutrition_info || {}

      acc.totalCalories += meal.calories_per_serving || 0
      acc.totalProtein += nutrition.protein || 0
      acc.totalCarbs += nutrition.carbs || 0
      acc.totalFat += nutrition.fat || 0
      acc.totalFiber += nutrition.fiber || 0
      acc.totalSodium += nutrition.sodium || 0

      return acc
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalSodium: 0,
    },
  )

  const handleExport = async (format: "pdf" | "csv" | "print") => {
    setIsExporting(true)
    try {
      const result = await exportMealPlan({
        mealPlanId: mealPlan.id,
        format,
        userId,
      })

      if (result.success) {
        if (format === "print") {
          window.print()
        } else {
          // Create download link
          const link = document.createElement("a")
          link.href = result.downloadUrl || "#"
          link.download = `meal-plan-${mealPlan.id}.${format}`
          link.click()
        }
        toast({
          title: "Export successful",
          description: `Your meal plan has been exported as ${format.toUpperCase()}.`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your meal plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async (method: "link" | "email") => {
    setIsSharing(true)
    try {
      const result = await shareMealPlan({
        mealPlanId: mealPlan.id,
        method,
        userId,
      })

      if (result.success) {
        if (method === "link") {
          await navigator.clipboard.writeText(result.shareUrl || "")
          toast({
            title: "Link copied",
            description: "Share link has been copied to your clipboard.",
          })
        } else {
          // Open email client
          window.location.href = `mailto:?subject=Check out my meal plan&body=I wanted to share my meal plan with you: ${result.shareUrl}`
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "There was an error sharing your meal plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{mealPlan.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Week of {new Date(mealPlan.week_start_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Utensils className="w-4 h-4" />
              {mealPlan.meals.length} meals
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {nutritionSummary.totalCalories} total calories
            </div>
          </div>
          {mealPlan.dietary_preferences && mealPlan.dietary_preferences.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mealPlan.dietary_preferences.map((pref: string) => (
                <Badge key={pref} variant="secondary">
                  {pref}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isSharing}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleShare("link")}>
                <Link2 className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("email")}>
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("print")}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Meal Plan</TabsTrigger>
          <TabsTrigger value="shopping">Shopping List</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Daily Meal Plans */}
          <div className="grid gap-6">
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const dayMeals = mealsByDay[dayIndex] || []
              return (
                <Card key={dayIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {dayName}
                      <Badge variant="outline">{dayMeals.length} meals</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dayMeals.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayMeals.map((meal: any) => (
                          <MealCard key={meal.id} meal={meal} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No meals planned for this day</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="space-y-6">
          <ShoppingListGenerator mealPlan={mealPlan} userId={userId} />
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Overview</CardTitle>
              <CardDescription>Weekly nutrition breakdown for your meal plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{Math.round(nutritionSummary.totalCalories)}</div>
                  <div className="text-sm text-muted-foreground">Total Calories</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(nutritionSummary.totalCalories / 7)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Daily Calories</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(nutritionSummary.totalProtein)}g</div>
                  <div className="text-sm text-muted-foreground">Total Protein</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{Math.round(nutritionSummary.totalFiber)}g</div>
                  <div className="text-sm text-muted-foreground">Total Fiber</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Macronutrients (Weekly)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalProtein)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbohydrates:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalCarbs)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalFat)}g</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Daily Averages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalProtein / 7)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbohydrates:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalCarbs / 7)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalFat / 7)}g</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Other Nutrients</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Fiber:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalFiber)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sodium:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalSodium)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Fiber/Day:</span>
                      <span className="font-medium">{Math.round(nutritionSummary.totalFiber / 7)}g</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
