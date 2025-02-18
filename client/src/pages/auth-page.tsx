import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Redirect } from "wouter";
import { SocialAuthButtons } from "@/components/social-auth-buttons";

export default function AuthPage() {
  const { user } = useAuth();

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to inBucks</CardTitle>
            <CardDescription>
              Choose your preferred way to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialAuthButtons />
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