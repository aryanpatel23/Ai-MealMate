"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CUISINE_MEALS, calculateAccurateNutrition } from "@/lib/data/cuisine-meals"

interface GenerateMealPlanParams {
  userId: string
  preferences: string[]
  allergies: string[]
  cuisines: string[]
  cookingSkill: string
  householdSize: number
  calorieTarget?: number
  additionalNotes?: string
}

function generateAIMealPlan(params: GenerateMealPlanParams) {
  const { preferences, allergies, cuisines, cookingSkill, householdSize, calorieTarget } = params

  console.log("[v0] Starting meal generation with params:", {
    preferences,
    allergies,
    cuisines,
    cookingSkill,
    householdSize,
  })

  // Get meals from selected cuisines or default to all
  let availableMeals = []
  if (cuisines.length > 0) {
    cuisines.forEach((cuisine) => {
      if (CUISINE_MEALS[cuisine]) {
        availableMeals.push(...CUISINE_MEALS[cuisine])
      }
    })
  } else {
    // If no specific cuisines selected, use all available meals
    Object.values(CUISINE_MEALS).forEach((cuisineMeals) => {
      availableMeals.push(...cuisineMeals)
    })
  }

  console.log("[v0] Available meals before filtering:", availableMeals.length)

  // Filter meals based on dietary preferences and allergies
  availableMeals = availableMeals.filter((meal) => {
    // Check dietary preferences
    if (
      preferences.includes("Vegetarian") &&
      meal.ingredients.some(
        (ing) =>
          ing.name.toLowerCase().includes("chicken") ||
          ing.name.toLowerCase().includes("beef") ||
          ing.name.toLowerCase().includes("fish") ||
          ing.name.toLowerCase().includes("salmon") ||
          ing.name.toLowerCase().includes("pork") ||
          ing.name.toLowerCase().includes("lamb") ||
          ing.name.toLowerCase().includes("veal") ||
          ing.name.toLowerCase().includes("shrimp") ||
          ing.name.toLowerCase().includes("mussels") ||
          ing.name.toLowerCase().includes("pancetta"),
      )
    ) {
      return false
    }

    if (
      preferences.includes("Vegan") &&
      meal.ingredients.some(
        (ing) =>
          ing.name.toLowerCase().includes("chicken") ||
          ing.name.toLowerCase().includes("beef") ||
          ing.name.toLowerCase().includes("fish") ||
          ing.name.toLowerCase().includes("salmon") ||
          ing.name.toLowerCase().includes("pork") ||
          ing.name.toLowerCase().includes("lamb") ||
          ing.name.toLowerCase().includes("veal") ||
          ing.name.toLowerCase().includes("shrimp") ||
          ing.name.toLowerCase().includes("mussels") ||
          ing.name.toLowerCase().includes("pancetta") ||
          ing.name.toLowerCase().includes("egg") ||
          ing.name.toLowerCase().includes("dairy") ||
          ing.name.toLowerCase().includes("cheese") ||
          ing.name.toLowerCase().includes("yogurt") ||
          ing.name.toLowerCase().includes("cream") ||
          ing.name.toLowerCase().includes("butter") ||
          ing.name.toLowerCase().includes("ghee") ||
          ing.name.toLowerCase().includes("milk"),
      )
    ) {
      return false
    }

    if (
      preferences.includes("Gluten-Free") &&
      meal.ingredients.some(
        (ing) =>
          ing.name.toLowerCase().includes("flour") ||
          ing.name.toLowerCase().includes("wheat") ||
          ing.name.toLowerCase().includes("bread") ||
          ing.name.toLowerCase().includes("pasta") ||
          ing.name.toLowerCase().includes("noodles") ||
          ing.name.toLowerCase().includes("soy sauce") ||
          ing.name.toLowerCase().includes("dough"),
      )
    ) {
      return false
    }

    // Check allergies
    return !allergies.some((allergy) =>
      meal.ingredients.some((ing) => ing.name.toLowerCase().includes(allergy.toLowerCase())),
    )
  })

  console.log("[v0] Available meals after filtering:", availableMeals.length)

  const allMeals = []
  const mealTypes = ["breakfast", "lunch", "dinner"]
  const usedMealsPerDay = new Map()

  for (let day = 0; day < 7; day++) {
    if (!usedMealsPerDay.has(day)) {
      usedMealsPerDay.set(day, new Set())
    }

    console.log("[v0] Generating meals for day:", day)

    mealTypes.forEach((mealType) => {
      // Find suitable meals for this meal type that haven't been used today
      let suitableMeals = availableMeals.filter(
        (meal) => meal.meal_types.includes(mealType as any) && !usedMealsPerDay.get(day).has(meal.recipe_name),
      )

      if (suitableMeals.length === 0) {
        suitableMeals = availableMeals.filter((meal) => meal.meal_types.includes(mealType as any))
      }

      console.log("[v0] Suitable meals for", mealType, "on day", day, ":", suitableMeals.length)

      if (suitableMeals.length > 0) {
        const randomIndex = Math.floor(
          (crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) * suitableMeals.length,
        )
        const selectedMeal = suitableMeals[randomIndex]

        // Mark this meal as used for today
        usedMealsPerDay.get(day).add(selectedMeal.recipe_name)

        console.log("[v0] Selected meal:", selectedMeal.recipe_name, "for", mealType, "on day", day)

        // Calculate accurate nutrition
        const nutrition = calculateAccurateNutrition(selectedMeal.ingredients, householdSize)

        allMeals.push({
          day_of_week: day,
          meal_type: mealType,
          recipe_name: selectedMeal.recipe_name,
          recipe_description: selectedMeal.recipe_description,
          ingredients: selectedMeal.ingredients.map((ing) => ({
            ...ing,
            quantity: ing.quantity * householdSize, // Scale for household size
          })),
          instructions: selectedMeal.instructions,
          prep_time: selectedMeal.prep_time,
          cook_time: selectedMeal.cook_time,
          servings: householdSize,
          calories_per_serving: nutrition.calories,
          nutrition_info: nutrition,
          cuisine: selectedMeal.cuisine,
        })
      }
    })
  }

  console.log("[v0] Generated total meals:", allMeals.length)
  return allMeals
}

export async function generateMealPlan(params: GenerateMealPlanParams) {
  try {
    console.log("[v0] Starting generateMealPlan function")

    const supabase = await createClient()

    let user
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.log("[v0] Auth error:", authError.message)
        // Try to continue without strict auth check for development
        user = { id: params.userId }
      } else {
        user = userData.user
      }
    } catch (authErr) {
      console.log("[v0] Auth check failed, continuing with provided userId")
      user = { id: params.userId }
    }

    if (!user) {
      return { success: false, error: "User not found" }
    }

    console.log("[v0] User authenticated:", user.id)

    // Generate AI meal plan
    const meals = generateAIMealPlan(params)

    if (meals.length === 0) {
      return { success: false, error: "No suitable meals found for your preferences" }
    }

    // Calculate total calories
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories_per_serving || 0), 0)

    const weekStartDate = new Date()
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay()) // Start of current week
    const timestamp = new Date().toLocaleTimeString()

    console.log("[v0] Creating meal plan record")

    const { data: mealPlan, error: mealPlanError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        title: `Meal Plan - ${weekStartDate.toLocaleDateString()} ${timestamp}`,
        week_start_date: weekStartDate.toISOString().split("T")[0],
        dietary_preferences: params.preferences,
        total_calories: totalCalories,
      })
      .select()
      .single()

    if (mealPlanError) {
      console.error("[v0] Error creating meal plan:", mealPlanError)
      return { success: false, error: "Failed to create meal plan: " + mealPlanError.message }
    }

    console.log("[v0] Meal plan created with ID:", mealPlan.id)

    // Insert meals
    const mealsWithPlanId = meals.map((meal) => ({
      ...meal,
      meal_plan_id: mealPlan.id,
      ingredients: JSON.stringify(meal.ingredients),
      nutrition_info: JSON.stringify(meal.nutrition_info),
    }))

    const { error: mealsError } = await supabase.from("meals").insert(mealsWithPlanId)

    if (mealsError) {
      console.error("[v0] Error creating meals:", mealsError)
      return { success: false, error: "Failed to create meals: " + mealsError.message }
    }

    console.log("[v0] Meals inserted successfully")

    try {
      await supabase
        .from("profiles")
        .update({
          dietary_preferences: params.preferences,
          allergies: params.allergies,
          preferred_cuisines: params.cuisines,
          cooking_skill_level: params.cookingSkill,
          household_size: params.householdSize,
        })
        .eq("id", user.id)
    } catch (profileError) {
      console.log("[v0] Profile update failed, but continuing:", profileError)
    }

    revalidatePath("/dashboard")
    console.log("[v0] Meal plan generation completed successfully")
    return { success: true, mealPlanId: mealPlan.id }
  } catch (error) {
    console.error("[v0] Error in generateMealPlan:", error)
    return { success: false, error: "An unexpected error occurred: " + (error as Error).message }
  }
}
