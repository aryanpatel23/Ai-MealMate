"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Sparkles, Crown, Zap } from "lucide-react"
import { SubscriptionDialog } from "./subscription-dialog"

interface PricingPlansProps {
  user: any
  profile: any
}

export function PricingPlans({ user, profile }: PricingPlansProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)

  const currentTier = profile?.subscription_tier || "free"

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for trying out AI MealMate",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Sparkles,
      features: ["3 meal plans per month", "Basic shopping lists", "Recipe recommendations", "Email support"],
      limitations: ["Limited meal plan generation", "Basic nutritional tracking", "No family meal planning"],
      buttonText: currentTier === "free" ? "Current Plan" : "Downgrade",
      buttonVariant: currentTier === "free" ? "outline" : "ghost",
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      description: "For serious meal planners",
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      icon: Crown,
      features: [
        "Unlimited meal plans",
        "Smart shopping lists",
        "Advanced nutritional tracking",
        "Family meal planning (up to 6 people)",
        "Premium recipe collection",
        "Meal plan customization",
        "Export to PDF",
        "Priority email support",
      ],
      limitations: [],
      buttonText: currentTier === "premium" ? "Current Plan" : "Upgrade to Premium",
      buttonVariant: currentTier === "premium" ? "outline" : "default",
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      description: "For nutrition professionals",
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      icon: Zap,
      features: [
        "Everything in Premium",
        "Client meal planning (unlimited clients)",
        "Advanced analytics & reporting",
        "White-label meal plans",
        "API access",
        "Custom branding",
        "Bulk meal plan generation",
        "Priority phone & email support",
        "Dedicated account manager",
      ],
      limitations: [],
      buttonText: currentTier === "pro" ? "Current Plan" : "Upgrade to Pro",
      buttonVariant: currentTier === "pro" ? "outline" : "default",
      popular: false,
    },
  ]

  const handleSelectPlan = (planId: string) => {
    if (planId === currentTier) return
    setSelectedPlan(planId)
    setShowSubscriptionDialog(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of AI-powered meal planning with our premium features
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm ${!isYearly ? "font-medium" : "text-muted-foreground"}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm ${isYearly ? "font-medium" : "text-muted-foreground"}`}>
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 17%
            </Badge>
          </span>
        </div>
      </div>

      {/* Current Subscription Status */}
      {currentTier !== "free" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {currentTier === "premium" ? (
                    <Crown className="w-5 h-5 text-primary" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.subscription_expires_at
                      ? `Expires on ${new Date(profile.subscription_expires_at).toLocaleDateString()}`
                      : "Active subscription"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const isCurrentPlan = currentTier === plan.id
          const Icon = plan.icon

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : "border-border"} ${
                isCurrentPlan ? "ring-2 ring-primary/20" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    ${price}
                    <span className="text-base font-normal text-muted-foreground">
                      {plan.id === "free" ? "" : isYearly ? "/year" : "/month"}
                    </span>
                  </div>
                  {isYearly && plan.id !== "free" && (
                    <div className="text-sm text-muted-foreground">
                      ${(plan.monthlyPrice * 12).toFixed(2)} billed annually
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={plan.buttonVariant as any}
                  disabled={isCurrentPlan}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.buttonText}
                </Button>

                {/* Free Trial Notice */}
                {plan.id !== "free" && !isCurrentPlan && (
                  <p className="text-xs text-center text-muted-foreground">Start with a 7-day free trial</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Feature Comparison</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Features</th>
                    <th className="text-center p-4 font-medium">Free</th>
                    <th className="text-center p-4 font-medium">Premium</th>
                    <th className="text-center p-4 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Meal plans per month</td>
                    <td className="text-center p-4">3</td>
                    <td className="text-center p-4">Unlimited</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Shopping lists</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4">Smart</td>
                    <td className="text-center p-4">Smart</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Family meal planning</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">Up to 6 people</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Client management</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">API access</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4">Support</td>
                    <td className="text-center p-4">Email</td>
                    <td className="text-center p-4">Priority Email</td>
                    <td className="text-center p-4">Phone & Email</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue to have access to premium features
                until the end of your billing period.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's included in the free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The 7-day free trial includes full access to all premium features. No credit card required to start.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        selectedPlan={selectedPlan}
        currentTier={currentTier}
        isYearly={isYearly}
        user={user}
      />
    </div>
  )
}
