import React, { useState, useEffect } from 'react';
import { useAuth, User } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User as UserIcon, 
  Shield, 
  UserCheck,
  Search
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const { user: currentUser, token } = useAuth();
  const { toast } = useToast();
  

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    password: '',
    password_confirm: ''
  });

     // Helper function to get role name safely
   const getRoleName = (role: any): string => {
     if (!role) return 'employee'; // Handle null/undefined
     if (typeof role === 'string') {
       return role;
     }
     if (role && typeof role === 'object' && role.name) {
       return role.name;
     }
     return 'employee'; // Default fallback
   };

  const currentUserRole = getRoleName(currentUser?.role);
  const canEdit = currentUserRole === 'admin';
  const canView = currentUserRole === 'admin' || currentUserRole === 'manager';
  
     

  useEffect(() => {
    if (token && canView) {
      fetchUsers();
    } else if (token && !canView) {
      setLoading(false);
    }
  }, [token, canView]);

  const fetchUsers = async () => {
    if (!token) {
      setUsers([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('http://127.0.0.1:8000/api/auth/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.results && Array.isArray(data.results)) {
          // Handle paginated response
          setUsers(data.results);
        } else if (data.users && Array.isArray(data.users)) {
          // Handle nested users object
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 403) {
          // For 403 errors, don't show an error toast since this is expected for employees
          setUsers([]);
          return;
        }
        
        throw new Error(errorData.message || errorData.detail || 'Failed to fetch users');
      }
    } catch (error) {
      // Don't show error toast for 403 errors as they're expected for employees
      if (!(error instanceof Error && error.message.includes('403'))) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch users",
          variant: "destructive",
        });
      }
      
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser ? `http://127.0.0.1:8000/api/auth/users/${editingUser.id}/` : 'http://127.0.0.1:8000/api/auth/register/';
      const method = editingUser ? 'PUT' : 'POST';
      
             // Transform the data to match Django backend expectations
       const transformedData = {
         username: formData.username,
         email: formData.email,
         first_name: formData.first_name,
         last_name: formData.last_name,
         role_name: formData.role, // Send role as role_name
         password: formData.password,
         password_confirm: formData.password_confirm
       };
       
       // For editing users, don't send password fields if password is empty
       const dataToSend = editingUser && !formData.password 
         ? { ...transformedData, password: undefined, password_confirm: undefined }
         : transformedData;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

             if (response.ok) {
         const responseData = await response.json().catch(() => ({}));
        
        toast({
          title: "Success",
          description: `User ${editingUser ? 'updated' : 'created'} successfully`,
        });
        
                 setIsAddDialogOpen(false);
         setEditingUser(null);
         setFormData({ username: '', email: '', first_name: '', last_name: '', role: 'employee', password: '', password_confirm: '' });
         fetchUsers();
             } else {
         const errorData = await response.json().catch(() => ({}));
        
        // Try to extract more detailed error information
        let errorMessage = `Failed to ${editingUser ? 'update' : 'create'} user`;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          // If it's an object with field errors, format them nicely
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = fieldErrors;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${editingUser ? 'update' : 'create'} user`,
        variant: "destructive",
      });
    }
  };

     const handleDelete = async (userId: string) => {
     if (!window.confirm('Are you sure you want to delete this user?')) return;

     try {
       const url = `http://127.0.0.1:8000/api/auth/users/${userId}/`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: getRoleName(user.role) as 'admin' | 'manager' | 'employee',
      password: '',
      password_confirm: ''
    });
    setIsAddDialogOpen(true);
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      getRoleName(user.role).toLowerCase().includes(searchLower)
    );
  }) : [];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'manager': return <UserCheck className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

     // Add loading state check
   if (!currentUser) {
     return (
       <Card className="shadow-medium">
         <CardContent className="flex items-center justify-center py-8">
           <div className="text-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
             <p className="text-muted-foreground">Loading user data...</p>
           </div>
         </CardContent>
       </Card>
     );
   }

   if (!canView && getRoleName(currentUser?.role) === 'employee') {
     // Employee view - only their own profile
     return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>My Profile</span>
          </CardTitle>
          <CardDescription>View your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
                         <Avatar className="h-16 w-16">
               <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                 {currentUser && currentUser.first_name && currentUser.last_name 
                   ? `${currentUser.first_name.charAt(0)}${currentUser.last_name.charAt(0)}` 
                   : 'U'}
               </AvatarFallback>
             </Avatar>
                         <div>
               <h3 className="text-lg font-semibold">
                 {currentUser?.first_name} {currentUser?.last_name}
               </h3>
               <p className="text-muted-foreground">{currentUser?.email}</p>
               <Badge variant={getRoleBadgeVariant(getRoleName(currentUser?.role))} className="mt-2">
                 <span className="flex items-center space-x-1">
                   {getRoleIcon(getRoleName(currentUser?.role))}
                   <span>{getRoleName(currentUser?.role) ? getRoleName(currentUser?.role).charAt(0).toUpperCase() + getRoleName(currentUser?.role).slice(1) : 'Employee'}</span>
                 </span>
               </Badge>
             </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                {canEdit ? 'Manage all users in the system' : 'View employee information'}
              </CardDescription>
            </div>
                         <div className="flex space-x-2">
               {canEdit && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingUser ? 'Update user information' : 'Create a new user account'}
                    </DialogDescription>
                  </DialogHeader>
                                     <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                       <Label htmlFor="username">Username</Label>
                       <Input
                         id="username"
                         value={formData.username}
                         onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                         required
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="first_name">First Name</Label>
                         <Input
                           id="first_name"
                           value={formData.first_name}
                           onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                           required
                         />
                       </div>
                       <div>
                         <Label htmlFor="last_name">Last Name</Label>
                         <Input
                           id="last_name"
                           value={formData.last_name}
                           onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                           required
                         />
                       </div>
                     </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                                         <div>
                       <Label htmlFor="password">
                         {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                       </Label>
                       <Input
                         id="password"
                         type="password"
                         value={formData.password}
                         onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                         required={!editingUser}
                         placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                       />
                     </div>
                     <div>
                       <Label htmlFor="password_confirm">
                         {editingUser ? 'Confirm New Password' : 'Confirm Password'}
                       </Label>
                       <Input
                         id="password_confirm"
                         type="password"
                         value={formData.password_confirm}
                         onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                         required={!editingUser}
                         placeholder={editingUser ? 'Confirm new password' : 'Confirm password'}
                       />
                     </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                                                 onClick={() => {
                           setIsAddDialogOpen(false);
                           setEditingUser(null);
                           setFormData({ username: '', email: '', first_name: '', last_name: '', role: 'employee', password: '', password_confirm: '' });
                         }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingUser ? 'Update' : 'Create'}
                      </Button>
                                         </div>
                   </form>
                 </DialogContent>
               </Dialog>
               )}
             </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
                     ) : !Array.isArray(users) || users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No users found</p>
              <Button onClick={fetchUsers} variant="outline">
                Retry
              </Button>
            </div>
          ) : (
                         <div className="grid gap-4">
               {Array.isArray(filteredUsers) && filteredUsers.map((user) => (
                <Card key={user.id} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}
                        </AvatarFallback>
                      </Avatar>
                                             <div>
                         <h3 className="font-semibold">
                           {user.first_name} {user.last_name}
                         </h3>
                         <p className="text-sm text-muted-foreground">{user.email}</p>
                         <p className="text-xs text-muted-foreground">@{user.username}</p>
                                                 <Badge variant={getRoleBadgeVariant(getRoleName(user.role))} className="mt-1">
                           <span className="flex items-center space-x-1">
                             {getRoleIcon(getRoleName(user.role))}
                             <span>{getRoleName(user.role).charAt(0).toUpperCase() + getRoleName(user.role).slice(1)}</span>
                           </span>
                         </Badge>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;