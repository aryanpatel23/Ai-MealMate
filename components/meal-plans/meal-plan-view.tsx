"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Utensils, Download, Share } from "lucide-react"
import { MealCard } from "./meal-card"
import { ShoppingListGenerator } from "../shopping-lists/shopping-list-generator"

interface MealPlanViewProps {
  mealPlan: any
  userId: string
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function MealPlanView({ mealPlan, userId }: MealPlanViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

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
              {mealPlan.total_calories} total calories
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
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{mealPlan.total_calories}</div>
                  <div className="text-sm text-muted-foreground">Total Calories</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{Math.round(mealPlan.total_calories / 7)}</div>
                  <div className="text-sm text-muted-foreground">Avg Daily Calories</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{mealPlan.meals.length}</div>
                  <div className="text-sm text-muted-foreground">Total Meals</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{Math.round(mealPlan.meals.length / 7)}</div>
                  <div className="text-sm text-muted-foreground">Avg Meals/Day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
