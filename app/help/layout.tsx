import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="border-b px-4 py-3">
          <SidebarTrigger />
        </div>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
