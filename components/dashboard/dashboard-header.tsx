"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sparkles, User, Settings, LogOut, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardHeaderProps {
  user: any
  profile: any
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase()

  const isPremium = profile?.subscription_tier && profile.subscription_tier !== "free"

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AI MealMate</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-foreground font-medium">
            Dashboard
          </Link>
          <Link href="/dashboard/meal-plans" className="text-muted-foreground hover:text-foreground transition-colors">
            Meal Plans
          </Link>
          <Link href="/dashboard/recipes" className="text-muted-foreground hover:text-foreground transition-colors">
            Recipes
          </Link>
          <Link
            href="/dashboard/shopping-lists"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Shopping Lists
          </Link>
          {!isPremium && (
            <Link href="/pricing">
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-primary to-accent text-white border-0"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          )}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              {isPremium && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{profile?.full_name || "User"}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                {isPremium && (
                  <p className="text-xs text-primary font-medium">
                    {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)} Plan
                  </p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <Link href="/pricing">
              <DropdownMenuItem>
                <Crown className="mr-2 h-4 w-4" />
                {isPremium ? "Manage Subscription" : "Upgrade Plan"}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
