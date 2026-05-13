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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const mainSections = [
  { title: "Dashboard", slug: "dashboard", icon: LayoutDashboard },
  { title: "Historik",  slug: "history",   icon: ChartLine },
  { title: "Alarmer",   slug: "alerts",    icon: Bell },
  { title: "Enheder",   slug: "devices",   icon: Cpu },
]

const bottomSections = [
  { title: "Hjælp",         href: "/help",     icon: CircleHelp },
  { title: "Indstillinger", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

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
                <SidebarMenuButton asChild size="lg" className={onLocationsRoot ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}>
                  <Link href="/locations">
                    <Home className="h-5 w-5 shrink-0" />
                    <span className="text-base">Hjem</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {mainSections.map((item) => {
                const disabled = !locationId
                return (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="w-full">
                          <SidebarMenuButton
                            asChild={!disabled}
                            size="lg"
                            className={[
                              isActive(item.slug) ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted",
                              disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "",
                            ].join(" ")}
                          >
                            {disabled ? (
                              <span className="flex items-center gap-2 px-2 py-1.5">
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span className="text-base">{item.title}</span>
                              </span>
                            ) : (
                              <Link href={makeUrl(item.slug)}>
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span className="text-base">{item.title}</span>
                              </Link>
                            )}
                          </SidebarMenuButton>
                        </span>
                      </TooltipTrigger>
                      {disabled && (
                        <TooltipContent side="right">
                          Vælg en lokation først
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomSections.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="lg" className={pathname === item.href ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}>
                <Link href={item.href}>
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