import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { ModeToggle } from '@/components/mode-toggle';

export default function AppNavbarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { auth } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AppShell variant="sidebar">
            {/* Top Navbar */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                {/* Mobile Sidebar Toggle */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <MenuIcon className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                        <AppSidebar /> {/* Re-use existing sidebar component */}
                    </SheetContent>
                </Sheet>

                {/* Logo and Nav Links (Desktop) */}
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-semibold md:text-base"
                    >
                        <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
                        <span className="sr-only">InspeksiApp</span>
                    </Link>
                    <Link
                        href={route('dashboard')}
                        className="text-foreground transition-colors hover:text-primary"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={route('inspections.index')}
                        className="text-muted-foreground transition-colors hover:text-primary"
                    >
                        Inspeksi
                    </Link>
                    <Link
                        href={route('customers.index')}
                        className="text-muted-foreground transition-colors hover:text-primary"
                    >
                        Customers
                    </Link>
                    <Link
                        href={route('assets.index')}
                        className="text-muted-foreground transition-colors hover:text-primary"
                    >
                        Assets
                    </Link>
                    {/* Add Reports Link */}
                    <Link
                        href={route('reports.general')}
                        className="text-muted-foreground transition-colors hover:text-primary"
                    >
                        Reports
                    </Link>
                </nav>

                {/* Right side: User Nav, Mode Toggle */}
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto flex-1 sm:flex-initial">{/* Search or other utility */}
                        {/* <Input type="search" placeholder="Search products..." className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]" /> */}
                    </div>
                    <ModeToggle />
                    <UserNav user={auth.user} />
                </div>
            </header>

            {/* Main Content Area */}
            <AppContent variant="sidebar" className="flex-1 flex-col">
                {/* Breadcrumbs and Page Title (if needed, otherwise remove AppSidebarHeader) */}
                {/* AppSidebarHeader is designed for sidebar layout, might need adjustment or removal */}
                {/* <AppSidebarHeader breadcrumbs={breadcrumbs} /> */}
                {children}
            </AppContent>
        </AppShell>
    );
}
