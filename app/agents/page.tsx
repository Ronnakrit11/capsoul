"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.replace("/agents/login");
  }, [router]);

  return null; // No need to render anything as we're redirecting
}