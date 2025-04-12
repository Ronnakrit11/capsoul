"use client";
import Container from "@/components/Container";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AgentData {
  id: string;
  name: string;
  email: string;
}

export default function AgentDashboard() {
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/agents/me");
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
        const data = await response.json();
        setAgent(data);
      } catch {
        router.push("/agents/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Container>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <Container className="py-10">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Agent Dashboard</h1>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="font-semibold text-lg mb-2">Agent Information</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span> {agent.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {agent.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}