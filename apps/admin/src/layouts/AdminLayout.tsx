import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminLayout() {

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      
      <div className="pl-72 transition-all duration-300">
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search anything..." 
                className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
            </Button>
            
            <div className="h-8 w-px bg-border mx-2" />
            
            <LanguageSwitcher />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@minimart.com</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                <span className="text-sm font-bold text-primary">AD</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
