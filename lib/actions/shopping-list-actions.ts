"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface GenerateShoppingListParams {
  mealPlanId: string
  userId: string
}

interface ShoppingItem {
  name: string
  quantity: number
  unit: string
  category: string
  checked: boolean
}

// Function to categorize ingredients
function categorizeIngredient(ingredientName: string): string {
  const name = ingredientName.toLowerCase()

  if (
    name.includes("lettuce") ||
    name.includes("tomato") ||
    name.includes("onion") ||
    name.includes("garlic") ||
    name.includes("pepper") ||
    name.includes("cucumber") ||
    name.includes("avocado") ||
    name.includes("lemon") ||
    name.includes("lime") ||
    name.includes("herb") ||
    name.includes("spinach") ||
    name.includes("broccoli") ||
    name.includes("carrot") ||
    name.includes("celery") ||
    name.includes("mushroom") ||
    name.includes("zucchini")
  ) {
    return "Produce"
  }

  if (
    name.includes("chicken") ||
    name.includes("beef") ||
    name.includes("pork") ||
    name.includes("fish") ||
    name.includes("salmon") ||
    name.includes("shrimp") ||
    name.includes("turkey") ||
    name.includes("lamb") ||
    name.includes("tuna")
  ) {
    return "Meat & Seafood"
  }

  if (
    name.includes("milk") ||
    name.includes("cheese") ||
    name.includes("yogurt") ||
    name.includes("butter") ||
    name.includes("cream") ||
    name.includes("egg") ||
    name.includes("feta") ||
    name.includes("mozzarella") ||
    name.includes("cheddar")
  ) {
    return "Dairy & Eggs"
  }

  if (
    name.includes("bread") ||
    name.includes("bagel") ||
    name.includes("muffin") ||
    name.includes("croissant") ||
    name.includes("roll")
  ) {
    return "Bakery"
  }

  if (
    name.includes("frozen") ||
    name.includes("ice cream") ||
    name.includes("frozen vegetables") ||
    name.includes("frozen fruit")
  ) {
    return "Frozen"
  }

  if (
    name.includes("juice") ||
    name.includes("soda") ||
    name.includes("water") ||
    name.includes("coffee") ||
    name.includes("tea") ||
    name.includes("wine") ||
    name.includes("beer")
  ) {
    return "Beverages"
  }

  // Default to Pantry for oils, spices, grains, etc.
  return "Pantry"
}

// Function to consolidate similar ingredients
function consolidateIngredients(ingredients: any[]): ShoppingItem[] {
  const consolidated: Record<string, ShoppingItem> = {}

  ingredients.forEach((ingredient) => {
    const key = ingredient.name.toLowerCase()
    const category = categorizeIngredient(ingredient.name)

    if (consolidated[key]) {
      // Add quantities if units match, otherwise keep separate
      if (consolidated[key].unit === ingredient.unit) {
        consolidated[key].quantity += ingredient.quantity
      } else {
        // Create a new entry with different unit
        const newKey = `${key}_${ingredient.unit}`
        consolidated[newKey] = {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category,
          checked: false,
        }
      }
    } else {
      consolidated[key] = {
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category,
        checked: false,
      }
    }
  })

  return Object.values(consolidated)
}

export async function generateShoppingList(params: GenerateShoppingListParams) {
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

    // Get meal plan with meals
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from("meal_plans")
      .select(`
        *,
        meals (*)
      `)
      .eq("id", params.mealPlanId)
      .eq("user_id", params.userId)
      .single()

    if (mealPlanError || !mealPlan) {
      return { success: false, error: "Meal plan not found" }
    }

    // Extract all ingredients from meals
    const allIngredients: any[] = []
    mealPlan.meals.forEach((meal: any) => {
      const ingredients = typeof meal.ingredients === "string" ? JSON.parse(meal.ingredients) : meal.ingredients
      if (ingredients && Array.isArray(ingredients)) {
        allIngredients.push(...ingredients)
      }
    })

    // Consolidate ingredients
    const consolidatedItems = consolidateIngredients(allIngredients)

    // Check if shopping list already exists for this meal plan
    const { data: existingList } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("meal_plan_id", params.mealPlanId)
      .eq("user_id", params.userId)
      .single()

    let shoppingList
    if (existingList) {
      // Update existing shopping list
      const { data: updatedList, error: updateError } = await supabase
        .from("shopping_lists")
        .update({
          items: consolidatedItems,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingList.id)
        .select()
        .single()

      if (updateError) {
        return { success: false, error: "Failed to update shopping list" }
      }
      shoppingList = updatedList
    } else {
      // Create new shopping list
      const { data: newList, error: createError } = await supabase
        .from("shopping_lists")
        .insert({
          user_id: params.userId,
          meal_plan_id: params.mealPlanId,
          title: `Shopping List - ${mealPlan.title}`,
          items: consolidatedItems,
        })
        .select()
        .single()

      if (createError) {
        return { success: false, error: "Failed to create shopping list" }
      }
      shoppingList = newList
    }

    revalidatePath(`/dashboard/meal-plans/${params.mealPlanId}`)
    return { success: true, shoppingList }
  } catch (error) {
    console.error("Error in generateShoppingList:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
