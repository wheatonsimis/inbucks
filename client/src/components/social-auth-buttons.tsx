import { Button } from "@/components/ui/button";
import { SiGoogle, SiApple, SiMicrosoft } from "react-icons/si";

export function SocialAuthButtons() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleAppleLogin = () => {
    // Placeholder for Apple OAuth
    console.log("Apple login clicked");
  };

  const handleOutlookLogin = () => {
    // Placeholder for Microsoft OAuth
    console.log("Outlook login clicked");
  };

  return (
    <div className="flex flex-col gap-3 w-full">
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
        onClick={handleOutlookLogin}
      >
        <SiMicrosoft className="h-5 w-5" />
        Continue with Outlook
      </Button>
    </div>
  );
}