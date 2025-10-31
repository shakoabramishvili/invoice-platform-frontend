'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/api/auth.service';
import { useAuthStore } from '@/lib/stores/authStore';
import { User } from '@/types';

interface ProfileFormData {
  fullName: string;
  email: string;
  phone?: string;
  countryCode: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue: setProfileValue,
  } = useForm<ProfileFormData>({
    defaultValues: {
      countryCode: '+995',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch: watchPassword,
    reset: resetPassword,
  } = useForm<PasswordFormData>();

  const newPassword = watchPassword('newPassword');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getMe();
        setUser(response.data);
        resetProfile({
          fullName: response.data.fullName,
          email: response.data.email,
          phone: response.data.phone || '',
          countryCode: '+995',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [resetProfile, toast]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(newPassword || '');
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.match(/image\/(jpg|jpeg|png)/)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG or PNG image',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    // Upload the image
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/profile-picture`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const result = await response.json();

      // Update user state with new profile picture
      const updatedUser = { ...user, ...result.data };
      setUser(updatedUser);
      updateUser(updatedUser); // Update global auth store
      setAvatarPreview(null);

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle avatar remove
  const handleAvatarRemove = async () => {
    if (!user) return;

    setIsUploadingAvatar(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/profile-picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove profile picture');
      }

      // Update user state to remove profile picture
      const updatedUser = { ...user, profilePicture: undefined } as any;
      setUser(updatedUser);
      updateUser(updatedUser); // Update global auth store
      setAvatarPreview(null);

      toast({
        title: 'Success',
        description: 'Profile picture removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const updateData: Partial<User> = {
        fullName: data.fullName,
        phone: data.phone ? `${data.countryCode}${data.phone}` : undefined,
      };

      const response = await authService.updateProfile(updateData);
      setUser(response.data);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword(data);
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      resetPassword();
      setShowPasswordSection(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      resetProfile({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        countryCode: '+995',
      });
    }
    setAvatarPreview(null);
    setShowPasswordSection(false);
    resetPassword();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userInitials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-[800px]">
        <CardHeader>
          <CardTitle className="text-3xl">My Profile</CardTitle>
          <CardDescription>Manage your account information and settings</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Profile Picture Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className="relative h-[120px] w-[120px] rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                  onMouseEnter={() => setIsHoveringAvatar(true)}
                  onMouseLeave={() => setIsHoveringAvatar(false)}
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                >
                  {(user as any)?.profilePicture ? (
                    <img
                      src={(user as any).profilePicture}
                      alt={user?.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-semibold text-muted-foreground">
                      {userInitials}
                    </span>
                  )}

                  {/* Hover overlay with camera icon */}
                  {isHoveringAvatar && !isUploadingAvatar && (
                    <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center transition-opacity">
                      <Camera className="h-10 w-10 text-white" />
                    </div>
                  )}

                  {/* Loading overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                {/* Dropdown menu */}
                {showAvatarMenu && !isUploadingAvatar && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowAvatarMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Upload photo
                      </button>
                      {(user as any)?.profilePicture && (
                        <button
                          onClick={() => {
                            handleAvatarRemove();
                            setShowAvatarMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove photo
                        </button>
                      )}
                      <div className="border-t my-1"></div>
                      <button
                        onClick={() => setShowAvatarMenu(false)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors text-muted-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Click on the avatar to manage your photo
                </p>
                <p className="text-sm text-muted-foreground">
                  JPG or PNG. Max size 2MB.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="text-2xl font-bold mt-1">{user?.fullName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg mt-1">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone Number</Label>
                <p className="text-lg mt-1">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Member Since</Label>
                <p className="text-lg mt-1">{memberSince}</p>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To change your email address, please contact support.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* <Separator /> */}

          {/* Contact Information Section */}
          {/* <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...registerProfile('fullName', {
                    required: 'Full name is required',
                  })}
                  className="mt-1"
                />
                {profileErrors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{profileErrors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="flex gap-2 mt-1">
                  <Select
                    defaultValue="+995"
                    onValueChange={(value) => setProfileValue('countryCode', value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+995">+995 (GE)</SelectItem>
                      <SelectItem value="+1">+1 (US)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+91">+91 (IN)</SelectItem>
                      <SelectItem value="+81">+81 (JP)</SelectItem>
                      <SelectItem value="+86">+86 (CN)</SelectItem>
                      <SelectItem value="+49">+49 (DE)</SelectItem>
                      <SelectItem value="+33">+33 (FR)</SelectItem>
                      <SelectItem value="+39">+39 (IT)</SelectItem>
                      <SelectItem value="+34">+34 (ES)</SelectItem>
                      <SelectItem value="+7">+7 (RU)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    {...registerProfile('phone')}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </form> */}

          {/* <Separator /> */}

          {/* Change Password Section */}
          {/* <div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="mb-4 p-0 h-auto font-semibold text-lg hover:bg-transparent"
            >
              Change Password
              {showPasswordSection ? (
                <ChevronUp className="ml-2 h-5 w-5" />
              ) : (
                <ChevronDown className="ml-2 h-5 w-5" />
              )}
            </Button>

            {showPasswordSection && (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">
                    Current Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required',
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={`font-medium ${passwordStrength < 50 ? 'text-red-500' : passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your password',
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </form>
            )}
          </div> */}
        </CardContent>

        {/* <CardFooter className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleProfileSubmit(onProfileSubmit)}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter> */}
      </Card>
    </div>
  );
}
