
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThreadLoading from "./ThreadLoading";

interface ThreadAccessGuardProps {
  isCheckingAccess: boolean;
  hasAccess: boolean;
  children: ReactNode;
}

export default function ThreadAccessGuard({ 
  isCheckingAccess, 
  hasAccess, 
  children 
}: ThreadAccessGuardProps) {
  const navigate = useNavigate();

  if (isCheckingAccess) {
    return <ThreadLoading />;
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Staff Only</h2>
        <p className="text-muted-foreground mb-6">
          This thread is only accessible to staff members.
        </p>
        <Button onClick={() => navigate('/forums')} variant="outline">
          Return to Forums
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
