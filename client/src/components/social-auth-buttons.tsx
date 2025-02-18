import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";

export function SocialAuthButtons() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
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
    </div>
  );
}