import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9a6 6 0 0 1 0-12c2.3 0 3.8 1 4.7 1.8l3.2-3.1A11 11 0 0 0 12 2a10 10 0 0 0 0 20c5.8 0 9.7-4 9.7-9.8 0-.7 0-1.2-.2-1.9H12Z"
      />
    </svg>
  );
}

export function SocialLoginButtons() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

  return (
    <div className="grid grid-cols-2 gap-3">
      <a href={`${apiBaseUrl}/oauth2/authorization/google`} className="w-full">
        <Button variant="outline" type="button" className="w-full">
          <GoogleIcon />
          Google
        </Button>
      </a>
      <a href={`${apiBaseUrl}/oauth2/authorization/github`} className="w-full">
        <Button variant="outline" type="button" className="w-full">
          <Github className="h-4 w-4" />
          GitHub
        </Button>
      </a>
    </div>
  );
}
