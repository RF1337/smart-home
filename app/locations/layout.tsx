import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="border-b px-4 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="rounded-lg transition-colors duration-150 hover:bg-muted active:scale-95" />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Skjul / vis sidebar <kbd className="ml-1 rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">⌘B</kbd>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
