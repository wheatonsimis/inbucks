import { Button } from "@/components/ui/button";
import { SiGoogle, SiApple, SiMicrosoft } from "react-icons/si";

export function SocialAuthButtons() {
  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth
    console.log("Google login clicked");
  };

  const handleAppleLogin = () => {
    // Placeholder for Apple OAuth
    console.log("Apple login clicked");
  };

  const handleMicrosoftLogin = () => {
    // Placeholder for Microsoft OAuth
    console.log("Microsoft login clicked");
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleGoogleLogin}
      >
        <SiGoogle className="h-5 w-5" />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleAppleLogin}
      >
        <SiApple className="h-5 w-5" />
        Continue with Apple
      </Button>
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleMicrosoftLogin}
      >
        <SiMicrosoft className="h-5 w-5" />
        Continue with Microsoft
      </Button>
    </div>
  );
}