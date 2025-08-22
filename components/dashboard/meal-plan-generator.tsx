"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Plus, X, Loader2, Crown } from "lucide-react"
import { generateMealPlan } from "@/lib/actions/meal-plan-actions"
import Link from "next/link"

interface MealPlanGeneratorProps {
  userId: string
  profile: any
}

const DIETARY_PREFERENCES = [
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Mediterranean",
  "Low-carb",
  "High-protein",
  "Gluten-free",
  "Dairy-free",
  "Nut-free",
]

const ALLERGIES = ["Nuts", "Dairy", "Eggs", "Soy", "Gluten", "Shellfish", "Fish", "Sesame"]

export function MealPlanGenerator({ userId, profile }: MealPlanGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [preferences, setPreferences] = useState<string[]>(profile?.dietary_preferences || [])
  const [allergies, setAllergies] = useState<string[]>(profile?.allergies || [])
  const [customPreference, setCustomPreference] = useState("")
  const [customAllergy, setCustomAllergy] = useState("")
  const [formData, setFormData] = useState({
    cookingSkill: profile?.cooking_skill_level || "intermediate",
    householdSize: profile?.household_size || 1,
    calorieTarget: "",
    additionalNotes: "",
  })

  const isPremium = profile?.subscription_tier && profile.subscription_tier !== "free"
  const isFreeTier = !isPremium

  const addCustomPreference = () => {
    if (customPreference && !preferences.includes(customPreference)) {
      setPreferences([...preferences, customPreference])
      setCustomPreference("")
    }
  }

  const addCustomAllergy = () => {
    if (customAllergy && !allergies.includes(customAllergy)) {
      setAllergies([...allergies, customAllergy])
      setCustomAllergy("")
    }
  }

  const removePreference = (pref: string) => {
    setPreferences(preferences.filter((p) => p !== pref))
  }

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateMealPlan({
        userId,
        preferences,
        allergies,
        cookingSkill: formData.cookingSkill,
        householdSize: formData.householdSize,
        calorieTarget: formData.calorieTarget ? Number.parseInt(formData.calorieTarget) : undefined,
        additionalNotes: formData.additionalNotes,
      })

      if (result.success) {
        // Redirect to the generated meal plan
        window.location.href = `/dashboard/meal-plans/${result.mealPlanId}`
      } else {
        console.error("Failed to generate meal plan:", result.error)
      }
    } catch (error) {
      console.error("Error generating meal plan:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className={isFreeTier ? "border-primary/20" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Generate New Meal Plan
          {isFreeTier && (
            <Badge variant="outline" className="ml-auto">
              Free Plan
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Create a personalized 7-day meal plan based on your preferences and dietary needs
          {isFreeTier && (
            <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Free Plan Limitations</p>
                  <p className="text-muted-foreground">
                    You can generate 3 meal plans per month. Upgrade to Premium for unlimited meal plans and advanced
                    features.
                  </p>
                  <Link href="/pricing" className="text-primary hover:underline font-medium">
                    Upgrade to Premium →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dietary Preferences */}
        <div className="space-y-3">
          <Label>Dietary Preferences</Label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_PREFERENCES.map((pref) => (
              <div key={pref} className="flex items-center space-x-2">
                <Checkbox
                  id={pref}
                  checked={preferences.includes(pref)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPreferences([...preferences, pref])
                    } else {
                      removePreference(pref)
                    }
                  }}
                />
                <Label htmlFor={pref} className="text-sm font-normal">
                  {pref}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom Preference Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom preference..."
              value={customPreference}
              onChange={(e) => setCustomPreference(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomPreference()}
            />
            <Button type="button" variant="outline" size="sm" onClick={addCustomPreference}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Preferences */}
          {preferences.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {preferences.map((pref) => (
                <Badge key={pref} variant="secondary" className="flex items-center gap-1">
                  {pref}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removePreference(pref)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="space-y-3">
          <Label>Allergies & Restrictions</Label>
          <div className="flex flex-wrap gap-2">
            {ALLERGIES.map((allergy) => (
              <div key={allergy} className="flex items-center space-x-2">
                <Checkbox
                  id={allergy}
                  checked={allergies.includes(allergy)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAllergies([...allergies, allergy])
                    } else {
                      removeAllergy(allergy)
                    }
                  }}
                />
                <Label htmlFor={allergy} className="text-sm font-normal">
                  {allergy}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom Allergy Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom allergy..."
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomAllergy()}
            />
            <Button type="button" variant="outline" size="sm" onClick={addCustomAllergy}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Allergies */}
          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <Badge key={allergy} variant="destructive" className="flex items-center gap-1">
                  {allergy}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeAllergy(allergy)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Additional Settings */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cookingSkill">Cooking Skill Level</Label>
            <Select
              value={formData.cookingSkill}
              onValueChange={(value) => setFormData({ ...formData, cookingSkill: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="householdSize">
              Household Size
              {!isPremium && formData.householdSize > 2 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Premium Feature
                </Badge>
              )}
            </Label>
            <Input
              id="householdSize"
              type="number"
              min="1"
              max={isPremium ? "10" : "2"}
              value={formData.householdSize}
              onChange={(e) => setFormData({ ...formData, householdSize: Number.parseInt(e.target.value) || 1 })}
            />
            {!isPremium && formData.householdSize > 2 && (
              <p className="text-xs text-muted-foreground">
                Family meal planning (3+ people) requires Premium.{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  Upgrade now
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="calorieTarget">Daily Calorie Target (optional)</Label>
          <Input
            id="calorieTarget"
            type="number"
            placeholder="e.g., 2000"
            value={formData.calorieTarget}
            onChange={(e) => setFormData({ ...formData, calorieTarget: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any specific requests, favorite cuisines, or other preferences..."
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          />
        </div>

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Your Meal Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Meal Plan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
