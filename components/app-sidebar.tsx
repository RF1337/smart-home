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
  Zap,
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
  useSidebar,
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

function SidebarLogo() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <div className="flex h-10 items-center overflow-hidden">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
        <Zap className="h-4 w-4 text-primary-foreground" />
      </div>
      <span
        className={`ml-2.5 whitespace-nowrap text-lg font-bold transition-[opacity,width] duration-300 ${
          collapsed ? "w-0 opacity-0" : "opacity-100"
        }`}
      >
        SmartHome
      </span>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()

  const locationId = pathname.match(/^\/locations\/([^/]+)/)?.[1]
  const onLocationsRoot = pathname === "/locations"

  const makeUrl = (slug: string) =>
    locationId ? `/locations/${locationId}/${slug}` : "#"

  const isActive = (slug: string) =>
    !!locationId && pathname === `/locations/${locationId}/${slug}`

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Home */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  isActive={onLocationsRoot}
                  tooltip="Hjem"
                  className={`rounded-lg transition-colors duration-150 ${
                    onLocationsRoot
                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                      : "hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Link href="/locations">
                    <Home className="h-5 w-5 shrink-0" />
                    <span className="text-base">Hjem</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Location-scoped items */}
              {mainSections.map((item) => {
                const disabled = !locationId
                const active = isActive(item.slug)

                return (
                  <SidebarMenuItem key={item.title}>
                    {disabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {/* Outer span keeps pointer events so tooltip fires */}
                          <span className="w-full">
                            <SidebarMenuButton
                              size="lg"
                              className="pointer-events-none w-full cursor-not-allowed rounded-lg opacity-40"
                              tabIndex={-1}
                              aria-disabled="true"
                            >
                              <item.icon className="h-5 w-5 shrink-0" />
                              <span className="text-base">{item.title}</span>
                            </SidebarMenuButton>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          Vælg en lokation for at åbne {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        size="lg"
                        isActive={active}
                        tooltip={item.title}
                        className={`rounded-lg transition-colors duration-150 ${
                          active
                            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                            : "hover:bg-muted/80 hover:text-foreground"
                        }`}
                      >
                        <Link href={makeUrl(item.slug)}>
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className="text-base">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomSections.map((item) => {
            const active = pathname === item.href
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  isActive={active}
                  tooltip={item.title}
                  className={`rounded-lg transition-colors duration-150 ${
                    active
                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                      : "hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Link href={item.href}>
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