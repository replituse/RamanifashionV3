import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AccessDenied from "@/pages/AccessDenied";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();

  const adminToken = localStorage.getItem("admin_token");

  const { data: verifyData, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/verify"],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error("No admin token");
      }
      
      const response = await fetch("/api/admin/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Unauthorized");
      }
      
      return await response.json();
    },
    enabled: !!adminToken,
    retry: false,
  });

  useEffect(() => {
    if (isError || (!adminToken && !isLoading)) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    }
  }, [isError, adminToken, isLoading]);

  if (!adminToken) {
    return <AccessDenied />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !verifyData) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
