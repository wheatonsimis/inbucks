import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Redirect } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  if (user) {
    console.log("[AUTH-PAGE] User already authenticated, redirecting to dashboard");
    return <Redirect to="/dashboard" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        console.log("[AUTH-PAGE] Attempting login with email:", email);
        const response = await loginMutation.mutateAsync({
          email,
          password,
        });
        console.log("[AUTH-PAGE] Login response:", response);
      } else {
        console.log("[AUTH-PAGE] Attempting registration with email:", email);
        const response = await registerMutation.mutateAsync({
          email,
          password,
        });
        console.log("[AUTH-PAGE] Registration response:", response);
      }
    } catch (error) {
      console.error("[AUTH-PAGE] Auth error details:", {
        error,
        type: isLogin ? "login" : "registration",
        email,
      });

      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        console.error("[AUTH-PAGE] Error stack:", error.stack);
        errorMessage = error.message;
      } else {
        console.error("[AUTH-PAGE] Non-Error object thrown:", error);
      }

      toast({
        title: isLogin ? "Login failed" : "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#faf8f6' }}>
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">{isLogin ? "Welcome Back" : "Create an Account"}</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Sign in to access your account" : "Sign up to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : (isLogin ? "Sign in" : "Create Account")}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}