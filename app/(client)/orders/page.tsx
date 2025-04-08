"use client";
import Container from "@/components/Container";
import OrdersComponent from "@/components/OrdersComponent";
import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { getOrders } from "@/actions/getOrders";

const OrdersPage = () => {
  const [orders, setOrders] = useState<MY_ORDERS_QUERYResult>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Initial fetch using server action
        const initialOrders = await getOrders();
        setOrders(initialOrders);
        
        // Subscribe to real-time updates
        const query = `*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
          ...,
          products[]{
            ...,
            product->
          }
        }`;

        const subscription = client
          .listen(query)
          .subscribe(update => {
            if (update.result) {
              setOrders(prevOrders => {
                const updatedOrders = [...prevOrders];
                const index = updatedOrders.findIndex(order => order._id === update.result?._id);
                if (index !== -1 && update.result) {
                  updatedOrders[index] = update.result as MY_ORDERS_QUERYResult[number];
                }
                return updatedOrders;
              });
            }
          });

        setLoading(false);
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      {orders?.length ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Order List</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-auto">Order Number</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Invoice Number
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <OrdersComponent orders={orders} />
                <ScrollBar orientation="horizontal" />
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-5 md:py-10 px-4">
          <FileX className="h-24 w-24 text-gray-400 mb-4" />
          <Title>No orders found</Title>
          <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
            It looks like you haven&apos;t placed any orders yet. Start shopping
            to see your orders here!
          </p>
          <Button asChild className="mt-6">
            <Link href={"/"}>Browse Products</Link>
          </Button>
        </div>
      )}
    </Container>
  );
};

export default OrdersPage;