import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function BackButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  const onBack = () => {
    if (canGoBack) navigate(-1);
    else navigate("/");
  };

  // Hide on first load of root path if no history to reduce noise
  const hide = !canGoBack && location.pathname === "/";
  if (hide) return null;

  return (
    <Button variant="ghost" size="sm" onClick={onBack} className={className} aria-label="Go back">
      ← Back
    </Button>
  );
}
