import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

import { LogOut } from 'lucide-react';
// import { Bell, Search } from 'lucide-react'; // Temporarily hidden
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'AD';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      
      <div className="pl-72 transition-all duration-300">
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
          {/* Temporarily hidden - Search feature not implemented */}
          {/* <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm..." 
                className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-all"
              />
            </div>
          </div> */}
          
          <div className="flex items-center gap-4 ml-auto">
            {/* Temporarily hidden - Notification feature not implemented */}
            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
            </Button>
            
            <div className="h-8 w-px bg-border mx-2" /> */}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-foreground">{user?.name || 'Quản trị viên'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'admin@minimart.com'}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <span className="text-sm font-bold text-primary">{getUserInitials()}</span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
