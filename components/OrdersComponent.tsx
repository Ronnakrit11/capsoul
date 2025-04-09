"use client";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import React, { useState } from "react";
import { TableBody, TableCell, TableRow } from "./ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { format } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import PriceFormatter from "./PriceFormatter";
import OrderDetailsDialog from "./OrderDetailsDialog";

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'paid':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OrdersComponent = ({ orders }: { orders: MY_ORDERS_QUERYResult }) => {
  const [selectedOrder, setSelectedOrder] = useState<
    MY_ORDERS_QUERYResult[number] | null
  >(null);

  const formatThaiTime = (date: string) => {
    const thaiTime = formatInTimeZone(new Date(date), 'Asia/Bangkok', 'dd/MM/yyyy');
    const thaiTimeHour = formatInTimeZone(new Date(date), 'Asia/Bangkok', 'h:mm a');
    return { date: thaiTime, time: thaiTimeHour };
  };

  return (
    <>
      <TableBody>
        <TooltipProvider>
          {orders?.map((order) => (
            <Tooltip key={order?.orderNumber}>
              <TooltipTrigger asChild>
                <TableRow
                  className="cursor-pointer hover:bg-gray-100 h-12"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-medium">
                    {order.orderNumber?.slice(-10) ?? "N/A"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.orderDate && (
                      <>
                        <div>{formatThaiTime(order.orderDate).date}</div>
                        <div className="text-xs text-gray-500">
                          {formatThaiTime(order.orderDate).time}
                        </div>
                      </>
                    )}
                  </TableCell>
                  <TableCell>{order?.customerName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.email}
                  </TableCell>
                  <TableCell>
                    <PriceFormatter
                      amount={order?.totalPrice}
                      className="text-black font-medium"
                    />
                  </TableCell>
                  <TableCell>
                    {order?.status && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(order?.status)}`}
                      >
                        {order?.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.invoice && (
                      <p>{order?.invoice ? order?.invoice?.number : "----"}</p>
                    )}
                  </TableCell>
                </TableRow>
              </TooltipTrigger>
              <TooltipContent>Click to see order details</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </TableBody>
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default OrdersComponent;