'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

import { usersService } from '@/lib/api/users.service';
import { User, UserFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Validation schema
const userSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER'], {
    required_error: 'Please select a role',
  }),
  password: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type UserFormValues = z.infer<typeof userSchema>;

// Get user initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Password strength indicator
const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  if (!password) return { strength: 0, label: '', color: '' };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength <= 2) return { strength, label: 'Weak', color: 'text-red-500' };
  if (strength <= 3) return { strength, label: 'Medium', color: 'text-yellow-500' };
  return { strength, label: 'Strong', color: 'text-green-500' };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' });
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'VIEWER',
      password: '',
      status: 'ACTIVE',
    },
  });

  const watchPassword = watch('password');
  const watchStatus = watch('status');

  // Update password strength when password changes
  useEffect(() => {
    if (watchPassword) {
      setPasswordStrength(getPasswordStrength(watchPassword));
    } else {
      setPasswordStrength({ strength: 0, label: '', color: '' });
    }
  }, [watchPassword]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersService.getAll({ search: searchQuery });
      setUsers(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open modal for create/edit
  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        password: '', // Password is optional on edit
        status: user.status,
      });
    } else {
      setEditingUser(null);
      reset({
        fullName: '',
        email: '',
        phone: '',
        role: 'VIEWER',
        password: '',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
    setShowPassword(false);
  };

  // Submit form
  const onSubmit = async (data: UserFormValues) => {
    try {
      // Validate password on create
      if (!editingUser && !data.password) {
        toast({
          title: 'Error',
          description: 'Password is required when creating a new user',
          variant: 'destructive',
        });
        return;
      }

      const formData: UserFormData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        ...(data.password && { password: data.password }),
      };

      if (editingUser) {
        await usersService.update(editingUser.id, formData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        await usersService.create(formData);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }

      closeModal();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      await usersService.delete(deletingUser.id);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'OPERATOR':
        return 'secondary';
      case 'VIEWER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    return status === 'ACTIVE' ? 'default' : 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Create new users, assign roles, and control system permissions.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Avatar</TableHead>
              <TableHead className="whitespace-nowrap">Full Name</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Phone</TableHead>
              <TableHead className="whitespace-nowrap">Role</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created On</TableHead>
              <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="whitespace-nowrap">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={(user as any)?.profilePicture} alt={user.fullName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">{user.fullName}</TableCell>
                  <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{user.phone || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{format(new Date(user.createdAt), 'dd.MM.yyyy')}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Update user information and permissions'
                : 'Add a new user to the system'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+1234567890"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                onValueChange={(value) => setValue('role', value as any)}
                defaultValue={editingUser?.role || 'VIEWER'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="OPERATOR">Operator</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {!editingUser && '*'}
                {editingUser && ' (leave blank to keep current)'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {watchPassword && passwordStrength.label && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.strength <= 2
                          ? 'bg-red-500'
                          : passwordStrength.strength <= 3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="status">Status</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {watchStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  id="status"
                  checked={watchStatus === 'ACTIVE'}
                  onCheckedChange={(checked) =>
                    setValue('status', checked ? 'ACTIVE' : 'INACTIVE')
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.fullName}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
