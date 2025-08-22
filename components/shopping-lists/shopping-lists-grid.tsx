"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShoppingCart, Calendar, CheckCircle, Plus, Download, Share } from "lucide-react"
import Link from "next/link"

interface ShoppingListsGridProps {
  shoppingLists: any[]
  userId: string
}

export function ShoppingListsGrid({ shoppingLists, userId }: ShoppingListsGridProps) {
  const [selectedList, setSelectedList] = useState<string | null>(null)

  const calculateProgress = (items: any[]) => {
    if (!items || items.length === 0) return 0
    const checkedItems = items.filter((item) => item.checked).length
    return Math.round((checkedItems / items.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
          <p className="text-muted-foreground">Manage your grocery shopping lists</p>
        </div>
        <Link href="/dashboard">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Meal Plan
          </Button>
        </Link>
      </div>

      {/* Shopping Lists Grid */}
      {shoppingLists.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shoppingLists.map((list) => {
            const progress = calculateProgress(list.items)
            const totalItems = list.items?.length || 0
            const checkedItems = list.items?.filter((item: any) => item.checked).length || 0

            return (
              <Card key={list.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">{list.title}</CardTitle>
                      <CardDescription>
                        {list.meal_plans?.title && (
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3" />
                            {list.meal_plans.title}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={progress === 100 ? "default" : "secondary"}>{progress}% Complete</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {checkedItems} of {totalItems} items
                      </span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      <span>{totalItems} items</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>{checkedItems} done</span>
                    </div>
                  </div>

                  {/* Estimated Cost */}
                  {list.total_estimated_cost && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Estimated: </span>
                      <span className="font-medium">${list.total_estimated_cost}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      View List
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No shopping lists yet</h3>
          <p className="text-muted-foreground mb-6">
            Create a meal plan to automatically generate smart shopping lists
          </p>
          <Link href="/dashboard">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Meal Plan
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
