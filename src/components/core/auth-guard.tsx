"use client";

// project imports
import useAuth from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { ReactElement, useEffect } from "react";

// ==============================|| AUTH GUARD ||============================== //

/**
 * Authentication guard for routes
 * @param {PropTypes.node} children children element/node
 */
const AuthGuard = ({ children }: { children: ReactElement | null }) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  return children;
};

export default AuthGuard;
