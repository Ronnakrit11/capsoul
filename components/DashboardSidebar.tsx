"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    title: "Admin Panel",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-[205px] border-r bg-white">
      <div className="p-4 border-b">
        <h2 className="text-sm font-medium text-gray-500">MENU</h2>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === route.href
                    ? "text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <route.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    pathname === route.href
                      ? "text-gray-500"
                      : "text-gray-400"
                  )}
                />
                {route.title}
                {route.title === "Orders" && (
                  <span className="ml-auto bg-gray-900 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    2
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <h2 className="text-sm font-medium text-gray-500 mb-2">OPTIONS</h2>
      </div>
      <div className="mt-auto p-4">
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="font-medium">Upgrade to Pro</h3>
          <p className="text-sm text-gray-500">
            Unlock all features and get unlimited access to our support team.
          </p>
          <Button className="w-full bg-black hover:bg-gray-800">Upgrade</Button>
        </div>
      </div>
    </div>
  );
}