import { useAuth } from "@/hooks/use-auth";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-[1000px] mx-auto grid grid-cols-2 gap-20">
        <div>
          <h2 className="text-3xl font-semibold">Email Response Marketplace</h2>
          <p className="mt-4 text-muted-foreground">
            Monetize your expertise by offering premium email responses. Set your own rates, define response times, and build your reputation in our trusted marketplace.
          </p>
        </div>

        <div>
          <form onSubmit={handleEmailSignup} className="space-y-4">
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SocialAuthButtons />
        </div>
      </div>
    </div>
  );
}