"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { CartItem } from "@/store";
import crypto from "crypto";

interface OrderData {
  customerName: string;
  email: string;
  tel: string;
  address: string;
  clerkUserId: string;
  items: CartItem[];
}

export async function createCodOrder(data: OrderData) {
  try {
    const orderNumber = `COD-${crypto.randomBytes(8).toString("hex")}`;
    const totalPrice = data.items.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );

    const amountDiscount = data.items.reduce((sum, item) => {
      const price = item.product.price || 0;
      const discount = ((item.product.discount || 0) * price) / 100;
      return sum + discount * item.quantity;
    }, 0);

    // First verify all products exist in Sanity
    const productIds = data.items.map(item => item.product._id);
    const productsExist = await backendClient.fetch(
      `count(*[_type == "product" && _id in $ids]) == $total`,
      { 
        ids: productIds,
        total: productIds.length 
      }
    );

    if (!productsExist) {
      return {
        success: false,
        error: "One or more products do not exist"
      };
    }

    const order = await backendClient.create({
      _type: "order",
      orderNumber,
      customerName: data.customerName,
      email: data.email,
      clerkUserId: data.clerkUserId,
      products: data.items.map((item) => ({
        _key: crypto.randomUUID(),
        product: {
          _type: "reference",
          _ref: item.product._id,
          _weak: false
        },
        quantity: item.quantity,
      })),
      currency: "USD",
      amountDiscount,
      totalPrice,
      status: "pending",
      orderDate: new Date().toISOString(),
      shippingAddress: data.address,
      phoneNumber: data.tel,
      paymentMethod: "COD",
    });

    return {
      success: true,
      orderNumber,
      order,
    };
  } catch (error) {
    console.error("Error creating COD order:", error);
    return {
      success: false,
      error: "Failed to create order",
    };
  }
}