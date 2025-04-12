import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET() {
  try {
    const token = (await cookies()).get("agent_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verify(token, JWT_SECRET) as { agentId: string };
    const agent = await prisma.agent.findUnique({
      where: { id: decoded.agentId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    if (!agent || agent.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json(agent);
  } catch {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }
}