'use client';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  List,
  Table2,
  LogOut,
  Settings,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { useEffect, useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Orders', href: '/dashboard/live-orders', icon: ClipboardList },
  { name: 'Menu Items', href: '/dashboard/menu', icon: UtensilsCrossed },
  { name: 'Categories', href: '/dashboard/categories', icon: List },
  { name: 'Tables', href: '/dashboard/tables', icon: Table2 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64 pb-16 lg:pb-0">
        <main className="flex-1 bg-muted/10">
          {children}
        </main>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-background">
          <div className="flex-1">
            <div className="px-4 py-6 justify-center border-b mb-4">
              <h2 className="text-3xl font-semibold">Laganakis</h2>
            </div>
            <nav className="flex-1 space-y-2 px-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      grid grid-cols-[24px_1fr] gap-4 rounded-lg p-5 text-sm font-medium transition-all
                      active:scale-95
                      ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-primary hover:bg-muted'}
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="border-t p-4 space-y-2">
            <Button 
              variant="ghost" 
              onClick={toggleTheme} 
              className={`
                grid grid-cols-[24px_1fr] gap-4 rounded-lg p-5 text-sm font-medium transition-all
                active:scale-95 text-primary hover:bg-muted h-auto cursor-pointer w-full
              `}
            >
              {(mounted && theme == 'dark') ? (
                <>
                  <Moon className="h-5 w-5" />
                  <span className="truncate text-start">Dark theme</span>
                </>
              ) : (
                <>
                  <Sun className="h-5 w-5" />
                  <span className="truncate text-start">Light theme</span>
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={logout} 
              className="w-full grid grid-cols-[24px_1fr] gap-4 p-5 h-auto cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span className="truncate text-start">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-[9999] lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <nav className="flex justify-around items-center h-16">
          {navigation.slice(0, 2).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 flex-1
                  ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center justify-center h-full flex-1 p-2">
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1">Other</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] translate-y-[-10%]">
              <DialogTitle className="hidden" />
              <div className="space-y-4 p-2">
                {/* Additional Navigation Items */}
                {navigation.slice(2).map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg w-full
                        ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Divider */}
                <div className="h-px bg-border my-2" />
                
                {/* Theme Toggle */}
                <Button 
                  variant="ghost" 
                  onClick={toggleTheme} 
                  className="w-full flex items-center justify-start gap-3 p-3"
                >
                  {(mounted && theme == 'dark') ? (
                    <>
                      <Moon className="h-5 w-5" />
                      <span className="truncate text-start">Dark theme</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-5 w-5" />
                      <span className="truncate text-start">Light theme</span>
                    </>
                  )}
                </Button>

                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="w-full flex items-center justify-start gap-3 p-3 text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </nav>
      </div>
    </div>
  );
}