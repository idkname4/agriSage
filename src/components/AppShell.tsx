'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Leaf, ScanLine, LayoutGrid } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-headline text-2xl font-bold text-sidebar-foreground">
              AgriVoice
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/'}
                tooltip={{ children: 'Analysis' }}
              >
                <Link href="/">
                  <ScanLine />
                  <span>Analysis</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip={{ children: 'Dashboard' }}
              >
                <Link href="/dashboard">
                  <LayoutGrid />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6 lg:h-16">
            <SidebarTrigger className="flex md:hidden" />
            <div className="flex-1">
                <h1 className="font-headline text-lg font-semibold md:text-2xl">
                    {pathname === '/dashboard' ? 'Agronomist Dashboard' : 'Crop Analysis'}
                </h1>
            </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
