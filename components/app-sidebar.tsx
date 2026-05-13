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
  Home,
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

const mainSections = [
  { title: "Dashboard", slug: "dashboard", icon: LayoutDashboard },
  { title: "Historik",  slug: "history",   icon: ChartLine },
  { title: "Alarmer",   slug: "alerts",    icon: Bell },
  { title: "Enheder",   slug: "devices",   icon: Cpu },
]

const bottomSections = [
  { title: "Hjælp",        slug: "help",     icon: CircleHelp },
  { title: "Indstillinger", slug: "settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  // Extract location id from paths like /locations/[id]/...
  const locationId = pathname.match(/^\/locations\/([^/]+)/)?.[1]
  const onLocationsRoot = pathname === "/locations"

  const makeUrl = (slug: string) =>
    locationId ? `/locations/${locationId}/${slug}` : "#"

  const isActive = (slug: string) =>
    !!locationId && pathname === `/locations/${locationId}/${slug}`

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="text-2xl font-semibold">SmartHome</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" className={onLocationsRoot ? "bg-accent font-bold" : ""}>
                  <Link href="/locations">
                    <Home className="h-5 w-5 shrink-0" />
                    <span className="text-base">Hjem</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {mainSections.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg" className={isActive(item.slug) ? "bg-accent font-bold" : ""}>
                    <Link href={makeUrl(item.slug)}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomSections.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="lg" className={isActive(item.slug) ? "bg-accent font-bold" : ""}>
                <Link href={makeUrl(item.slug)}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="text-base">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}