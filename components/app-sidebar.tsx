
"use client"

import Link from "next/link"
import { Bell, Home, LineChart, Package, Package2, ShoppingCart, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  isMobile?: boolean
  count?:string
}

export function AppSidebar({ isMobile = false  ,count}: AppSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/notifications", icon: Home, label: "لوحة التحكم" },
    { href: "#", icon: ShoppingCart, label: "الطلبات", badge: "6" },
  ]

  return (
    <div className={cn("hidden border-l bg-muted/40 md:block", isMobile && "block border-l-0")}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">لوحة التحكم</span>
          </Link>
          <Button variant="outline" size="icon" className="mr-auto h-8 w-8 bg-transparent">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && (
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    {count}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
