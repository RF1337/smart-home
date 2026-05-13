"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ChartLine,
  Bell,
  Cpu,
  Settings,
  CircleHelp,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Historik",
    url: "/history",
    icon: ChartLine,
  },
  {
    title: "Alarmer",
    url: "/alerts",
    icon: Bell,
  },
  {
    title: "Enheder",
    url: "/devices",
    icon: Cpu,
  },
]

const bottomItems = [
  {
    title: "Hjælp",
    url: "/help",
    icon: CircleHelp,
  },
  {
    title: "Indstillinger",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="text-2xl font-semibold">SmartHome</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = pathname === item.url
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg" className={isActive ? "bg-accent font-bold" : ""}>
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomItems.map((item) => {
            const isActive = pathname === item.url
            return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="lg" className={isActive ? "bg-accent font-bold" : ""}>
                <Link href={item.url}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="text-base">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}