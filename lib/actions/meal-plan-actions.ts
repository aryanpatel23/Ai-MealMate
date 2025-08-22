"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface GenerateMealPlanParams {
  userId: string
  preferences: string[]
  allergies: string[]
  cookingSkill: string
  householdSize: number
  calorieTarget?: number
  additionalNotes?: string
}

// Mock AI meal generation - in a real app, this would call an AI service
function generateAIMealPlan(params: GenerateMealPlanParams) {
  const { preferences, allergies, cookingSkill, householdSize, calorieTarget } = params

  // Sample meal data - in production, this would come from an AI service
  const sampleMeals = [
    {
      day_of_week: 0, // Sunday
      meal_type: "breakfast",
      recipe_name: "Avocado Toast with Eggs",
      recipe_description: "Whole grain toast topped with mashed avocado and poached eggs",
      ingredients: [
        { name: "Whole grain bread", quantity: 2, unit: "slices" },
        { name: "Avocado", quantity: 1, unit: "medium" },
        { name: "Eggs", quantity: 2, unit: "large" },
        { name: "Lemon juice", quantity: 1, unit: "tbsp" },
        { name: "Salt", quantity: 1, unit: "pinch" },
        { name: "Black pepper", quantity: 1, unit: "pinch" },
      ],
      instructions: [
        "Toast the bread slices until golden brown",
        "Mash the avocado with lemon juice, salt, and pepper",
        "Poach the eggs in simmering water for 3-4 minutes",
        "Spread avocado mixture on toast and top with poached eggs",
      ],
      prep_time: 10,
      cook_time: 8,
      servings: householdSize,
      calories_per_serving: 320,
      nutrition_info: {
        protein: 18,
        carbs: 28,
        fat: 16,
        fiber: 8,
      },
    },
    {
      day_of_week: 0,
      meal_type: "lunch",
      recipe_name: "Mediterranean Quinoa Bowl",
      recipe_description: "Nutritious quinoa bowl with fresh vegetables and feta cheese",
      ingredients: [
        { name: "Quinoa", quantity: 1, unit: "cup" },
        { name: "Cherry tomatoes", quantity: 1, unit: "cup" },
        { name: "Cucumber", quantity: 1, unit: "medium" },
        { name: "Red onion", quantity: 0.25, unit: "cup" },
        { name: "Feta cheese", quantity: 0.5, unit: "cup" },
        { name: "Olive oil", quantity: 2, unit: "tbsp" },
        { name: "Lemon juice", quantity: 2, unit: "tbsp" },
      ],
      instructions: [
        "Cook quinoa according to package instructions",
        "Dice tomatoes, cucumber, and red onion",
        "Mix vegetables with cooked quinoa",
        "Add feta cheese and dress with olive oil and lemon juice",
      ],
      prep_time: 15,
      cook_time: 15,
      servings: householdSize,
      calories_per_serving: 380,
      nutrition_info: {
        protein: 14,
        carbs: 45,
        fat: 14,
        fiber: 5,
      },
    },
    {
      day_of_week: 0,
      meal_type: "dinner",
      recipe_name: "Grilled Salmon with Roasted Vegetables",
      recipe_description: "Fresh salmon fillet with seasonal roasted vegetables",
      ingredients: [
        { name: "Salmon fillet", quantity: 6, unit: "oz" },
        { name: "Broccoli", quantity: 2, unit: "cups" },
        { name: "Bell peppers", quantity: 2, unit: "medium" },
        { name: "Zucchini", quantity: 1, unit: "medium" },
        { name: "Olive oil", quantity: 3, unit: "tbsp" },
        { name: "Garlic", quantity: 3, unit: "cloves" },
        { name: "Lemon", quantity: 1, unit: "medium" },
      ],
      instructions: [
        "Preheat oven to 425°F",
        "Cut vegetables into bite-sized pieces",
        "Toss vegetables with olive oil, minced garlic, salt, and pepper",
        "Roast vegetables for 20 minutes",
        "Season salmon with salt, pepper, and lemon juice",
        "Grill salmon for 4-5 minutes per side",
        "Serve salmon over roasted vegetables",
      ],
      prep_time: 15,
      cook_time: 25,
      servings: householdSize,
      calories_per_serving: 420,
      nutrition_info: {
        protein: 35,
        carbs: 12,
        fat: 22,
        fiber: 4,
      },
    },
  ]

  // Generate meals for all 7 days
  const allMeals = []
  for (let day = 0; day < 7; day++) {
    // For demo purposes, we'll cycle through our sample meals
    // In production, AI would generate unique meals based on preferences
    sampleMeals.forEach((meal) => {
      allMeals.push({
        ...meal,
        day_of_week: day,
        // Adjust recipe based on preferences and allergies
        recipe_name:
          preferences.includes("Vegetarian") && meal.recipe_name.includes("Salmon")
            ? "Grilled Tofu with Roasted Vegetables"
            : meal.recipe_name,
      })
    })
  }

  return allMeals
}

export async function generateMealPlan(params: GenerateMealPlanParams) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== params.userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Generate AI meal plan
    const meals = generateAIMealPlan(params)

    // Calculate total calories
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories_per_serving || 0), 0)

    // Create meal plan record
    const weekStartDate = new Date()
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay()) // Start of current week

    const { data: mealPlan, error: mealPlanError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: params.userId,
        title: `Meal Plan - ${weekStartDate.toLocaleDateString()}`,
        week_start_date: weekStartDate.toISOString().split("T")[0],
        dietary_preferences: params.preferences,
        total_calories: totalCalories,
      })
      .select()
      .single()

    if (mealPlanError) {
      console.error("Error creating meal plan:", mealPlanError)
      return { success: false, error: "Failed to create meal plan" }
    }

    // Insert meals
    const mealsWithPlanId = meals.map((meal) => ({
      ...meal,
      meal_plan_id: mealPlan.id,
      ingredients: JSON.stringify(meal.ingredients),
      nutrition_info: JSON.stringify(meal.nutrition_info),
    }))

    const { error: mealsError } = await supabase.from("meals").insert(mealsWithPlanId)

    if (mealsError) {
      console.error("Error creating meals:", mealsError)
      return { success: false, error: "Failed to create meals" }
    }

    // Update user profile with latest preferences
    await supabase
      .from("profiles")
      .update({
        dietary_preferences: params.preferences,
        allergies: params.allergies,
        cooking_skill_level: params.cookingSkill,
        household_size: params.householdSize,
      })
      .eq("id", params.userId)

    revalidatePath("/dashboard")
    return { success: true, mealPlanId: mealPlan.id }
  } catch (error) {
    console.error("Error in generateMealPlan:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
