"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Heart, ShieldAlert } from "lucide-react";

export function RegistrationToast() {
  const searchParams = useSearchParams();
  const success = searchParams.get("registration");
  const approval = searchParams.get("approval");

  useEffect(() => {
    if (success === "success") {
      toast.success("Registration Successful!", {
        description: "Your life-saving contribution is now part of our network.",
        icon: <Heart className="h-4 w-4 text-primary fill-primary" />,
        duration: 8000,
      });
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }

    if (approval === "pending") {
      toast.info("Account Pending Approval", {
        description: "Our team is verifying your hospital credentials. You'll have access shortly.",
        icon: <ShieldAlert className="h-4 w-4 text-primary" />,
        duration: 10000,
      });

      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [success, approval]);

  return null;
}
