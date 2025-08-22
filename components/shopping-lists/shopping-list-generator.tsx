"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Download, Share, Plus, Loader2 } from "lucide-react"
import { generateShoppingList } from "@/lib/actions/shopping-list-actions"

interface ShoppingListGeneratorProps {
  mealPlan: any
  userId: string
}

interface ShoppingItem {
  name: string
  quantity: number
  unit: string
  category: string
  checked: boolean
}

const GROCERY_CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Pantry",
  "Frozen",
  "Bakery",
  "Beverages",
  "Other",
]

export function ShoppingListGenerator({ mealPlan, userId }: ShoppingListGeneratorProps) {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  const handleGenerateList = async () => {
    setIsGenerating(true)
    try {
      const result = await generateShoppingList({
        mealPlanId: mealPlan.id,
        userId,
      })

      if (result.success && result.shoppingList) {
        setShoppingList(result.shoppingList.items)
        setIsGenerated(true)
      }
    } catch (error) {
      console.error("Error generating shopping list:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleItem = (index: number) => {
    const updatedList = [...shoppingList]
    updatedList[index].checked = !updatedList[index].checked
    setShoppingList(updatedList)
  }

  const groupedItems = shoppingList.reduce(
    (acc, item, index) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push({ ...item, index })
      return acc
    },
    {} as Record<string, (ShoppingItem & { index: number })[]>,
  )

  const checkedCount = shoppingList.filter((item) => item.checked).length
  const totalCount = shoppingList.length

  if (!isGenerated) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Generate Shopping List</CardTitle>
          <CardDescription>
            Create a smart shopping list based on all the ingredients from your meal plan
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={handleGenerateList} disabled={isGenerating} size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating List...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Generate Shopping List
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Shopping List
              </CardTitle>
              <CardDescription>
                {checkedCount} of {totalCount} items completed
              </CardDescription>
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
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Progress</div>
            <Badge variant={checkedCount === totalCount ? "default" : "secondary"}>
              {Math.round((checkedCount / totalCount) * 100)}% Complete
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shopping List by Category */}
      <div className="space-y-4">
        {GROCERY_CATEGORIES.map((category) => {
          const categoryItems = groupedItems[category] || []
          if (categoryItems.length === 0) return null

          const categoryChecked = categoryItems.filter((item) => item.checked).length
          const categoryTotal = categoryItems.length

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <Badge variant="outline">
                    {categoryChecked}/{categoryTotal}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryItems.map((item) => (
                  <div key={item.index} className="flex items-center space-x-3">
                    <Checkbox
                      id={`item-${item.index}`}
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(item.index)}
                    />
                    <label
                      htmlFor={`item-${item.index}`}
                      className={`flex-1 text-sm cursor-pointer ${
                        item.checked ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {item.quantity} {item.unit}
                      </span>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Custom Item */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" className="w-full bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Item
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
