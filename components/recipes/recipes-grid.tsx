"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Heart, Search, Plus, Filter, ChefHat } from "lucide-react"
import Link from "next/link"

interface RecipesGridProps {
  recipes: any[]
  userId: string
}

export function RecipesGrid({ recipes, userId }: RecipesGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")

  // Filter and sort recipes
  const filteredRecipes = recipes
    .filter((recipe) => {
      const matchesSearch = recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "favorites" && recipe.is_favorite) ||
        (filterBy === "quick" && recipe.prep_time + recipe.cook_time <= 30)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name":
          return a.recipe_name.localeCompare(b.recipe_name)
        case "time":
          return a.prep_time + a.cook_time - (b.prep_time + b.cook_time)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground">Your saved recipe collection</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search recipes..."
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
            <SelectItem value="time">Cooking Time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recipes</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
            <SelectItem value="quick">Quick (≤30 min)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight">{recipe.recipe_name}</CardTitle>
                    <CardDescription className="line-clamp-2">{recipe.recipe_description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Heart className={`w-4 h-4 ${recipe.is_favorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recipe Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{recipe.servings}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-3 h-3" />
                      <span>{recipe.calories_per_serving} cal</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{recipe.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Recipe
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Save recipes from your meal plans to build your collection"}
          </p>
          <Link href="/dashboard">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Meal Plan
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
