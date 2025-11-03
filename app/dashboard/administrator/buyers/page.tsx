'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

import { buyersService } from '@/lib/api/buyers.service';
import { Buyer, BuyerFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// Validation schema
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

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [deletingBuyer, setDeletingBuyer] = useState<Buyer | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      name: '',
      legalType: 'LEGAL_ENTITY' as const,
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

  // Fetch buyers
  const fetchBuyers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await buyersService.getAll({ search: searchQuery });
      setBuyers(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  // Open modal for create/edit
  const openModal = (buyer?: Buyer) => {
    if (buyer) {
      setEditingBuyer(buyer);
      reset({
        name: buyer.name,
        legalType: buyer.legalType,
        prefix: buyer.prefix || '',
        contactPerson: buyer.contactPerson,
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.address || '',
        country: buyer.country,
        taxId: buyer.taxId,
      });
    } else {
      setEditingBuyer(null);
      reset({
        name: '',
        legalType: 'LEGAL_ENTITY' as const,
        prefix: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        taxId: '',
      });
    }
    setIsModalOpen(true);
    setCountrySearch('');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBuyer(null);
    reset();
    setCountrySearch('');
  };

  // Submit form
  const onSubmit = async (data: BuyerFormValues) => {
    try {
      const formData: BuyerFormData = {
        name: data.name,
        legalType: data.legalType,
        prefix: data.prefix,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        country: data.country,
        taxId: data.taxId,
      };

      if (editingBuyer) {
        await buyersService.update(editingBuyer.id, formData);
        toast({
          title: 'Success',
          description: 'Customer updated successfully',
        });
      } else {
        await buyersService.create(formData);
        toast({
          title: 'Success',
          description: 'Customer created successfully',
        });
      }

      closeModal();
      fetchBuyers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save customer',
        variant: 'destructive',
      });
    }
  };

  // Delete buyer
  const handleDelete = async () => {
    if (!deletingBuyer) return;

    try {
      await buyersService.delete(deletingBuyer.id);
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setDeletingBuyer(null);
      fetchBuyers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete customer',
        variant: 'destructive',
      });
    }
  };

  // Open delete dialog
  const openDeleteDialog = (buyer: Buyer) => {
    setDeletingBuyer(buyer);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Easily manage clients, contacts, and company data.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Invoice Prefix</TableHead>
              <TableHead className="whitespace-nowrap">Contact Person</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Phone</TableHead>
              <TableHead className="whitespace-nowrap">Country</TableHead>
              <TableHead className="whitespace-nowrap">Tax ID</TableHead>
              <TableHead className="whitespace-nowrap">Created On</TableHead>
              <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : buyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              buyers.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell className="whitespace-nowrap">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {buyer.name.length > 30
                              ? `${buyer.name.substring(0, 30)}...`
                              : buyer.name}
                          </span>
                        </TooltipTrigger>
                        {buyer.name.length > 30 && (
                          <TooltipContent>
                            <p>{buyer.name}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{buyer.prefix || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{buyer.contactPerson}</TableCell>
                  <TableCell className="whitespace-nowrap">{buyer.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{buyer.phone}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCountryFlag(buyer.country)}</span>
                      <span>{buyer.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{buyer.taxId}</TableCell>
                  <TableCell className="whitespace-nowrap">{format(new Date(buyer.createdAt), 'dd.MM.yyyy')}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal(buyer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(buyer)}
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

      {/* Buyer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBuyer ? 'Edit Customer' : 'Create Customer'}</DialogTitle>
            <DialogDescription>
              {editingBuyer
                ? 'Update customer details for invoicing and contact management.'
                : 'Add customer details for invoicing and contact management.'}
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
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingBuyer ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingBuyer?.name}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingBuyer(null);
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
