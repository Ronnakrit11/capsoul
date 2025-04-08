"use client";
import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import PriceFormatter from "./PriceFormatter";
import useCartStore from "@/store";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { createCodOrder } from "@/actions/createCodOrder";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  onClose: () => void;
}

interface FormData {
  name: string;
  tel: string;
  address: string;
  paymentMethod: string;
}

const CheckoutForm = ({ onClose }: CheckoutFormProps) => {
  const { getTotalPrice, getSubtotalPrice, getGroupedItems, resetCart } = useCartStore();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    tel: "",
    address: "",
    paymentMethod: "cod",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to place an order");
      return;
    }

    setLoading(true);
    try {
      if (formData.paymentMethod === "cod") {
        const result = await createCodOrder({
          customerName: formData.name,
          email: user.emailAddresses[0].emailAddress,
          tel: formData.tel,
          address: formData.address,
          clerkUserId: user.id,
          items: getGroupedItems(),
        });

        if (result.success) {
          resetCart();
          router.push(`/success?orderNumber=${result.orderNumber}`);
          onClose();
        } else {
          toast.error("Failed to create order");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("An error occurred while placing your order");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tel">Phone Number</Label>
            <Input
              id="tel"
              name="tel"
              type="tel"
              required
              value={formData.tel}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <Input
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your delivery address"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup
              defaultValue="cod"
              onValueChange={(value: string) =>
                setFormData((prev) => ({ ...prev, paymentMethod: value }))
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery (COD)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md opacity-50 cursor-not-allowed">
                <RadioGroupItem value="promptpay" id="promptpay" disabled />
                <Label htmlFor="promptpay">PromptPay (Coming Soon)</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <div className="space-y-4">
          {getGroupedItems().map(({ product, quantity }) => (
            <div
              key={product._id}
              className="flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">Quantity: {quantity}</p>
              </div>
              <PriceFormatter
                amount={(product.price || 0) * quantity}
              />
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <PriceFormatter amount={getSubtotalPrice()} />
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <PriceFormatter
              amount={getSubtotalPrice() - getTotalPrice()}
            />
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <PriceFormatter amount={getTotalPrice()} className="text-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;