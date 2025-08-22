"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, CreditCard, Shield, Loader2 } from "lucide-react"
import { upgradeSubscription } from "@/lib/actions/subscription-actions"

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlan: string | null
  currentTier: string
  isYearly: boolean
  user: any
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  selectedPlan,
  currentTier,
  isYearly,
  user,
}: SubscriptionDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!selectedPlan) return null

  const planDetails = {
    free: {
      name: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ["3 meal plans per month", "Basic shopping lists", "Recipe recommendations"],
    },
    premium: {
      name: "Premium",
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      features: [
        "Unlimited meal plans",
        "Smart shopping lists",
        "Advanced nutritional tracking",
        "Family meal planning",
        "Premium recipe collection",
      ],
    },
    pro: {
      name: "Pro",
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      features: [
        "Everything in Premium",
        "Client meal planning",
        "Advanced analytics",
        "White-label options",
        "API access",
        "Priority support",
      ],
    },
  }

  const plan = planDetails[selectedPlan as keyof typeof planDetails]
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
  const isUpgrade = selectedPlan !== "free" && currentTier === "free"
  const isDowngrade = selectedPlan === "free"

  const handleSubscribe = async () => {
    setIsProcessing(true)
    try {
      const result = await upgradeSubscription({
        userId: user.id,
        planId: selectedPlan,
        isYearly,
      })

      if (result.success) {
        // In a real app, this would redirect to a payment processor
        // For demo purposes, we'll simulate success
        setTimeout(() => {
          setIsProcessing(false)
          onOpenChange(false)
          window.location.reload() // Refresh to show updated subscription
        }, 2000)
      } else {
        setIsProcessing(false)
        console.error("Subscription failed:", result.error)
      }
    } catch (error) {
      setIsProcessing(false)
      console.error("Subscription error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Change"} to {plan.name}
          </DialogTitle>
          <DialogDescription>
            {isUpgrade
              ? "Unlock premium features and take your meal planning to the next level"
              : isDowngrade
                ? "You'll lose access to premium features but can upgrade again anytime"
                : "Review your plan change details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name} Plan</CardTitle>
                {selectedPlan === "premium" && <Badge>Most Popular</Badge>}
              </div>
              <CardDescription>
                <div className="text-2xl font-bold text-foreground">
                  ${price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {selectedPlan === "free" ? "" : isYearly ? "/year" : "/month"}
                  </span>
                </div>
                {isYearly && selectedPlan !== "free" && (
                  <div className="text-sm text-muted-foreground">Save 17% with yearly billing</div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Free Trial Notice */}
          {isUpgrade && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">7-Day Free Trial</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try all premium features risk-free. Cancel anytime during the trial period and you won't be charged.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Billing Summary */}
          {selectedPlan !== "free" && (
            <div className="space-y-3">
              <h4 className="font-medium">Billing Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    {plan.name} Plan ({isYearly ? "Yearly" : "Monthly"})
                  </span>
                  <span>${price}</span>
                </div>
                {isUpgrade && (
                  <div className="flex justify-between text-green-600">
                    <span>Free Trial (7 days)</span>
                    <span>$0.00</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total {isUpgrade ? "after trial" : "today"}</span>
                  <span>${isUpgrade ? price : price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubscribe} disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedPlan === "free" ? (
                    "Downgrade"
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isUpgrade ? "Start Free Trial" : "Subscribe"}
                    </>
                  )}
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-center text-muted-foreground">
            <Shield className="w-3 h-3 inline mr-1" />
            Secure payment processing. Cancel anytime.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
