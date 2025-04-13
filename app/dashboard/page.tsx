"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      const data = await response.json();
      setAgents(data);
    } catch {
      toast.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (agentId: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state
      setAgents(agents.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      ));

      toast.success(`Agent ${newStatus.toLowerCase()} successfully`);
    } catch {
      toast.error("Failed to update agent status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">รอดำเนินการ</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">อนุมัติแล้ว</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ปฏิเสธ</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">รายการตัวแทนจำหน่าย</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>เบอร์โทรศัพท์</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>
                      {agent.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(agent.id, "APPROVED")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            อนุมัติ
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(agent.id, "REJECTED")}
                          >
                            ปฏิเสธ
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Container>
  );
}