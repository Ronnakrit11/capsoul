import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const { status } = await request.json();

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}