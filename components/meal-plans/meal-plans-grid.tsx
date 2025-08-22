"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Utensils, Search, Plus, Filter } from "lucide-react"
import Link from "next/link"

interface MealPlansGridProps {
  mealPlans: any[]
  userId: string
}

export function MealPlansGrid({ mealPlans, userId }: MealPlansGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")

  // Filter and sort meal plans
  const filteredPlans = mealPlans
    .filter((plan) => {
      const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "recent" && new Date(plan.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Meal Plans</h1>
          <p className="text-muted-foreground">Manage and view all your generated meal plans</p>
        </div>
        <Link href="/dashboard">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search meal plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="recent">Recent (7 days)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Meal Plans Grid */}
      {filteredPlans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight">{plan.title}</CardTitle>
                    <CardDescription>Week of {new Date(plan.week_start_date).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant="outline">{new Date(plan.created_at).toLocaleDateString()}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Utensils className="w-3 h-3" />
                    <span>21 meals</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{plan.total_calories} cal</span>
                  </div>
                </div>

                {/* Dietary Preferences */}
                {plan.dietary_preferences && plan.dietary_preferences.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {plan.dietary_preferences.slice(0, 3).map((pref: string) => (
                      <Badge key={pref} variant="secondary" className="text-xs">
                        {pref}
                      </Badge>
                    ))}
                    {plan.dietary_preferences.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{plan.dietary_preferences.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/dashboard/meal-plans/${plan.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Plan
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No meal plans found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Create your first meal plan to get started"}
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
