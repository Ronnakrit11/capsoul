"use server";

import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import { redirect } from "next/navigation";

export async function getOrders() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const query = `*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
    ...,
    products[]{
      ...,
      product->
    }
  }`;

  try {
    const orders = await client.fetch<MY_ORDERS_QUERYResult>(query, { userId });
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}