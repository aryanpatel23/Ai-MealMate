import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Sparkles } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">AI MealMate</span>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>We've sent you a verification link to complete your account setup</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the link in your email to verify your account and start creating personalized meal plans.
              </p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Didn't receive the email?</p>
                <Button variant="outline" size="sm">
                  Resend verification email
                </Button>
              </div>
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
