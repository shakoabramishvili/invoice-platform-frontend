'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, User, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/stores/authStore';
import type { RegisterFormData } from '@/types';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  return Math.min(strength, 100);
};

const getPasswordStrengthColor = (strength: number): string => {
  if (strength < 40) return 'bg-red-500';
  if (strength < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getPasswordStrengthText = (strength: number): string => {
  if (strength < 40) return 'Weak';
  if (strength < 70) return 'Medium';
  return 'Strong';
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const register = useAuthStore((state) => state.register);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password');
  const acceptTerms = watch('acceptTerms');
  const passwordStrength = password ? calculatePasswordStrength(password) : 0;

  // Password requirements
  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      });

      toast({
        title: 'Success',
        description: 'Your account has been created successfully',
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-bold">Join Us Today</h1>
            <p className="text-lg text-white/90">
              Create your account and start managing your invoices professionally.
            </p>
            <div className="space-y-4 pt-8">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Quick Setup</h3>
                  <p className="text-sm text-white/80">Get started in just a few minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Professional Templates</h3>
                  <p className="text-sm text-white/80">Beautiful invoice designs ready to use</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Reliable</h3>
                  <p className="text-sm text-white/80">Your data is safe with us</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  {...registerField('fullName')}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...registerField('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="pl-10 pr-10"
                  {...registerField('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength < 40 ? 'text-red-500' :
                      passwordStrength < 70 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor(
                        passwordStrength
                      )}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {requirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-1 ${
                          req.met ? 'text-green-600' : 'text-muted-foreground'
                        }`}
                      >
                        {req.met ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  {...registerField('confirmPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <Label
                  htmlFor="acceptTerms"
                  className="text-sm font-normal leading-tight cursor-pointer"
                >
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
