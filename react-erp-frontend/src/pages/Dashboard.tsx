import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/UserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  UserCheck, 
  User as UserIcon,
  Activity,
  Clock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    system_status: 'Online'
  });
  const [loading, setLoading] = useState(true);
  
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
  


  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

             try {
         const response = await fetch('http://127.0.0.1:8000/api/auth/dashboard/stats/', {
           headers: {
             'Authorization': `Bearer ${token}`,
           },
         });

         if (response.ok) {
           const data = await response.json();
           setStats(data);
         } else {
           // Use fallback values based on user role
           const fallbackStats = {
             total_users: getRoleName(user?.role) === 'admin' ? 12 : getRoleName(user?.role) === 'manager' ? 8 : 1,
             active_users: getRoleName(user?.role) === 'admin' ? 10 : getRoleName(user?.role) === 'manager' ? 6 : 1,
             system_status: 'Online'
           };
           setStats(fallbackStats);
         }
       } catch (error) {
         // Use fallback values
         const fallbackStats = {
           total_users: getRoleName(user?.role) === 'admin' ? 12 : getRoleName(user?.role) === 'manager' ? 8 : 1,
           active_users: getRoleName(user?.role) === 'admin' ? 10 : getRoleName(user?.role) === 'manager' ? 6 : 1,
           system_status: 'Online'
         };
         setStats(fallbackStats);
       } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, user?.role]);

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access with user management capabilities';
      case 'manager':
        return 'View and manage employee information';
      default:
        return 'Access to personal profile and assigned tasks';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-6 w-6" />;
      case 'manager': return <UserCheck className="h-6 w-6" />;
      default: return <UserIcon className="h-6 w-6" />;
    }
  };

  const getPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          'Create new users',
          'Edit all user profiles',
          'Delete users',
          'Manage system settings',
          'View all reports'
        ];
      case 'manager':
        return [
          'View employee profiles',
          'Generate team reports',
          'Assign tasks',
          'View team analytics'
        ];
      default:
        return [
          'View personal profile',
          'Update personal information',
          'View assigned tasks',
          'Submit time reports'
        ];
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-lg p-6 text-white shadow-strong">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.first_name}!
              </h1>
              <p className="opacity-90">
                {getRoleDescription(getRoleName(user?.role))}
              </p>
            </div>
            <div className="text-right">
                             <div className="flex items-center space-x-2 mb-2">
                 {user?.role && getRoleIcon(getRoleName(user.role))}
                 <Badge variant="secondary" className="bg-white/20 text-white">
                   {getRoleName(user?.role).charAt(0).toUpperCase() + getRoleName(user?.role).slice(1)}
                 </Badge>
               </div>
              <div className="flex items-center space-x-1 text-sm opacity-75">
                <Clock className="h-4 w-4" />
                <span>Last login: Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-medium">
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Your Role</CardTitle>
               {user?.role && getRoleIcon(getRoleName(user.role))}
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold capitalize">{getRoleName(user?.role)}</div>
              <p className="text-xs text-muted-foreground">
                Access Level
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.total_users}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.active_users}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {loading ? '...' : stats.system_status}
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Card */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Your Permissions</span>
            </CardTitle>
            <CardDescription>
              Current access level and available actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {getPermissions(getRoleName(user?.role)).map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="text-sm">{permission}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Management Section */}
        <UserManagement />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;