'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buyersService } from '@/lib/api/buyers.service';
import { toast } from 'sonner';
import { X } from 'lucide-react';

// Common countries with their flags
const COUNTRIES = [
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
];

const buyerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  legalType: z.enum(['INDIVIDUAL', 'LEGAL_ENTITY'], {
    required_error: 'Legal type is required',
  }),
  prefix: z.string().optional(),
  contactPerson: z.string().min(2, 'Contact person must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
});

type BuyerFormValues = z.infer<typeof buyerSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerId?: string) => void;
}

export default function CustomerModal({ isOpen, onClose, onSuccess }: CustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      name: '',
      legalType: 'LEGAL_ENTITY',
      prefix: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      country: '',
      taxId: '',
    },
  });

  // Get country flag by country name or code
  const getCountryFlag = (countryName: string | null | undefined) => {
    if (!countryName) return '🏳️';
    const country = COUNTRIES.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code === countryName
    );
    return country?.flag || '🏳️';
  };

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const onSubmit = async (data: BuyerFormValues) => {
    try {
      setLoading(true);
      const response = await buyersService.create(data);
      toast.success('Customer created successfully');
      reset();
      setCountrySearch('');
      onSuccess(response.data.id);
      onClose();
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setCountrySearch('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Customer</DialogTitle>
          <DialogDescription>
            Add customer details for invoicing and contact management.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Company Name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalType">Legal Type *</Label>
              <Controller
                name="legalType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select legal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="LEGAL_ENTITY">Legal Entity</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.legalType && (
                <p className="text-sm text-destructive">{errors.legalType.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefix">Invoice Prefix</Label>
            <Input
              id="prefix"
              {...register('prefix')}
              placeholder="e.g., GFF, AC, IA"
            />
            {errors.prefix && (
              <p className="text-sm text-destructive">{errors.prefix.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                {...register('contactPerson')}
                placeholder="John Doe"
              />
              {errors.contactPerson && (
                <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+1234567890"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="123 Main Street, City, State, ZIP"
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country">
                          {field.value && (
                            <div className="flex items-center gap-2">
                              <span className="text-xl">
                                {getCountryFlag(field.value)}
                              </span>
                              <span>{field.value}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <div className="relative mb-2">
                            <Input
                              placeholder="Search countries..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              className="pr-8"
                            />
                            {countrySearch && (
                              <button
                                onClick={() => setCountrySearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {filteredCountries.map((country) => (
                            <SelectItem key={country.code} value={country.name}>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{country.flag}</span>
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID *</Label>
              <Input
                id="taxId"
                {...register('taxId')}
                placeholder="123456789"
              />
              {errors.taxId && (
                <p className="text-sm text-destructive">{errors.taxId.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
