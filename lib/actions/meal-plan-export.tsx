"use server"

import { createClient } from "@/lib/supabase/server"

interface ExportMealPlanParams {
  mealPlanId: string
  format: "pdf" | "csv" | "print"
  userId: string
}

interface ShareMealPlanParams {
  mealPlanId: string
  method: "link" | "email"
  userId: string
}

export async function exportMealPlan(params: ExportMealPlanParams) {
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

    // Get meal plan data
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

    // Generate export data based on format
    let exportData: string
    let mimeType: string
    let filename: string

    switch (params.format) {
      case "csv":
        exportData = generateCSVExport(mealPlan)
        mimeType = "text/csv"
        filename = `meal-plan-${mealPlan.id}.csv`
        break
      case "pdf":
        // In a real app, you'd use a PDF library like jsPDF or Puppeteer
        exportData = generatePDFExport(mealPlan)
        mimeType = "application/pdf"
        filename = `meal-plan-${mealPlan.id}.pdf`
        break
      case "print":
        // For print, we'll return HTML that can be printed
        exportData = generatePrintHTML(mealPlan)
        mimeType = "text/html"
        filename = `meal-plan-${mealPlan.id}.html`
        break
      default:
        return { success: false, error: "Invalid export format" }
    }

    // In a real application, you would:
    // 1. Generate the actual file using appropriate libraries
    // 2. Upload to cloud storage (S3, etc.)
    // 3. Return a download URL
    // For demo purposes, we'll create a data URL
    const dataUrl = `data:${mimeType};base64,${Buffer.from(exportData).toString("base64")}`

    return {
      success: true,
      downloadUrl: dataUrl,
      filename,
    }
  } catch (error) {
    console.error("Error exporting meal plan:", error)
    return { success: false, error: "Export failed" }
  }
}

export async function shareMealPlan(params: ShareMealPlanParams) {
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

    // Generate a shareable link
    // In a real app, you might create a public share token
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shared/meal-plan/${params.mealPlanId}`

    // Create share record (optional - for analytics)
    await supabase.from("meal_plan_shares").insert({
      meal_plan_id: params.mealPlanId,
      user_id: params.userId,
      share_method: params.method,
      created_at: new Date().toISOString(),
    })

    return {
      success: true,
      shareUrl,
    }
  } catch (error) {
    console.error("Error sharing meal plan:", error)
    return { success: false, error: "Share failed" }
  }
}

function generateCSVExport(mealPlan: any): string {
  const headers = ["Day", "Meal Type", "Recipe Name", "Prep Time", "Cook Time", "Calories", "Protein", "Carbs", "Fat"]
  const rows = [headers.join(",")]

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  mealPlan.meals.forEach((meal: any) => {
    const nutrition =
      typeof meal.nutrition_info === "string" ? JSON.parse(meal.nutrition_info) : meal.nutrition_info || {}

    const row = [
      dayNames[meal.day_of_week],
      meal.meal_type,
      `"${meal.recipe_name}"`,
      meal.prep_time,
      meal.cook_time,
      meal.calories_per_serving,
      nutrition.protein || 0,
      nutrition.carbs || 0,
      nutrition.fat || 0,
    ]
    rows.push(row.join(","))
  })

  return rows.join("\n")
}

function generatePDFExport(mealPlan: any): string {
  // This is a simplified version - in a real app, use a proper PDF library
  return `PDF Export for ${mealPlan.title}\n\nThis would be a properly formatted PDF with meal plan details.`
}

function generatePrintHTML(mealPlan: any): string {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${mealPlan.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .meal-day { margin-bottom: 30px; page-break-inside: avoid; }
        .meal { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; }
        .meal-type { font-weight: bold; color: #2563eb; }
        .ingredients { margin-top: 10px; }
        .nutrition { margin-top: 10px; font-size: 0.9em; color: #666; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <h1>${mealPlan.title}</h1>
      <p>Week of ${new Date(mealPlan.week_start_date).toLocaleDateString()}</p>
  `

  // Group meals by day
  const mealsByDay: any = {}
  mealPlan.meals.forEach((meal: any) => {
    if (!mealsByDay[meal.day_of_week]) {
      mealsByDay[meal.day_of_week] = []
    }
    mealsByDay[meal.day_of_week].push(meal)
  })

  // Generate HTML for each day
  dayNames.forEach((dayName, dayIndex) => {
    const dayMeals = mealsByDay[dayIndex] || []
    if (dayMeals.length > 0) {
      html += `<div class="meal-day"><h2>${dayName}</h2>`

      dayMeals.forEach((meal: any) => {
        const nutrition =
          typeof meal.nutrition_info === "string" ? JSON.parse(meal.nutrition_info) : meal.nutrition_info || {}

        html += `
          <div class="meal">
            <div class="meal-type">${meal.meal_type.toUpperCase()}</div>
            <h3>${meal.recipe_name}</h3>
            <p>${meal.recipe_description}</p>
            <div class="nutrition">
              Calories: ${meal.calories_per_serving} | 
              Protein: ${nutrition.protein || 0}g | 
              Carbs: ${nutrition.carbs || 0}g | 
              Fat: ${nutrition.fat || 0}g
            </div>
          </div>
        `
      })

      html += "</div>"
    }
  })

  html += "</body></html>"
  return html
}
