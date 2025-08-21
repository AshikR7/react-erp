import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Shield, 
  LogOut, 
  Menu,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Helper function to get role name safely
  const getRoleName = (role: any): string => {
    if (typeof role === 'string') {
      return role;
    }
    if (role && typeof role === 'object' && role.name) {
      return role.name;
    }
    return 'employee'; // Default fallback
  };

  /**
   * Returns the initials of the given first and last name.
   *
   * @param firstName - The first name.
   * @param lastName - The last name.
   * @returns The initials.
   */
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'manager':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'manager':
        return 'bg-warning text-white';
      default:
        return 'bg-info text-white';
    }
  };



  // Add loading state check - also check if user data is complete
  if (!user || (!user.first_name && !user.last_name)) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="bg-card border-b shadow-soft sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary">ERP System</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Card className="shadow-none border-0 bg-transparent">
              <CardContent className="flex items-center space-x-3 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(user?.first_name, user?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">
                    {user && user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user?.first_name || user?.last_name || 'User'}
                  </p>
                  <div className="flex items-center space-x-1">
                    {user?.role && getRoleIcon(getRoleName(user.role))}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user ? getRoleBadgeClass(getRoleName(user.role)) : ''}`}>
                      {getRoleName(user?.role).charAt(0).toUpperCase() + getRoleName(user?.role).slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-card border-r shadow-medium transition-transform duration-300 ease-in-out
          mt-[73px] lg:mt-0
        `}>
          <div className="p-6">
            <nav className="space-y-2">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {getRoleName(user?.role) === 'admin' && 'Full access to all users'}
                    {getRoleName(user?.role) === 'manager' && 'View employee profiles'}
                    {getRoleName(user?.role) === 'employee' && 'View your own profile'}
                  </p>
                </CardContent>
              </Card>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;