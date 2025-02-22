import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Redirect } from "wouter";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import { useState } from "react";

export default function AuthPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return <Redirect to="/" />;
  }

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for email/password signup
    console.log("Email signup clicked", { email, password });
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Choose your preferred way to sign up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign up with Email
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <SocialAuthButtons />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-12">
        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl font-bold">Email Response Marketplace</h1>
          <p className="text-muted-foreground text-lg">
            Monetize your expertise by offering premium email responses. Set your
            own rates, define response times, and build your reputation in our
            trusted marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}