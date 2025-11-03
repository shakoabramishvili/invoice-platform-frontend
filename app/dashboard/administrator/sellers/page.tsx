'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Edit, Trash2, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

import { sellersService } from '@/lib/api/sellers.service';
import { Seller, SellerFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
const sellerSchema = z.object({
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
  banks: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Bank name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    address: z.string().optional(),
    swift: z.string().optional(),
    intermediaryBankName: z.string().optional(),
    intermediaryBankSwift: z.string().optional(),
    isDefault: z.boolean().optional(),
  })).min(1, 'At least one bank is required'),
});

type SellerFormValues = z.infer<typeof sellerSchema>;

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [deletingSeller, setDeletingSeller] = useState<Seller | null>(null);
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set([0]));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
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
      banks: [{
        name: '',
        accountNumber: '',
        address: '',
        swift: '',
        intermediaryBankName: '',
        intermediaryBankSwift: '',
        isDefault: false,
      }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'banks',
  });

  // Sync fields when modal opens with seller data
  useEffect(() => {
    if (isModalOpen && editingSeller && editingSeller.banks && editingSeller.banks.length > 0) {
      replace(editingSeller.banks.map(bank => ({
        id: bank.id,
        name: bank.name,
        accountNumber: bank.accountNumber,
        address: bank.address || '',
        swift: bank.swift || '',
        intermediaryBankName: bank.intermediaryBankName || '',
        intermediaryBankSwift: bank.intermediaryBankSwift || '',
        isDefault: bank.isDefault || false,
      })));
      // All banks collapsed by default
      setExpandedBanks(new Set());
    } else if (isModalOpen && !editingSeller) {
      replace([{
        name: '',
        accountNumber: '',
        address: '',
        swift: '',
        intermediaryBankName: '',
        intermediaryBankSwift: '',
        isDefault: false,
      }]);
      // First bank expanded when creating new seller
      setExpandedBanks(new Set([0]));
    }
  }, [isModalOpen, editingSeller, replace]);

  // Toggle bank expansion
  const toggleBankExpansion = (index: number) => {
    setExpandedBanks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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

  // Fetch sellers
  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sellersService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
      });
      setSellers(response.data);
      const total = response.pagination?.total ?? response.total ?? response.meta?.total ?? response.data.length;
      setTotalCount(total);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch sellers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, toast]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  // Open modal for create/edit
  const openModal = (seller?: Seller) => {
    if (seller) {
      setEditingSeller(seller);
      setLogoPreview(seller.logo || null);
      setStampPreview(seller.stamp || null);
      reset({
        name: seller.name,
        legalType: seller.legalType,
        prefix: seller.prefix || '',
        contactPerson: seller.contactPerson,
        email: seller.email,
        phone: seller.phone,
        address: seller.address || '',
        country: seller.country,
        taxId: seller.taxId,
        banks: seller.banks && seller.banks.length > 0 ? seller.banks.map(bank => ({
          id: bank.id,
          name: bank.name,
          accountNumber: bank.accountNumber,
          address: bank.address || '',
          swift: bank.swift || '',
          intermediaryBankName: bank.intermediaryBankName || '',
          intermediaryBankSwift: bank.intermediaryBankSwift || '',
          isDefault: bank.isDefault || false,
        })) : [{
          name: '',
          accountNumber: '',
          address: '',
          swift: '',
          intermediaryBankName: '',
          intermediaryBankSwift: '',
          isDefault: false,
        }],
      });
    } else {
      setEditingSeller(null);
      setLogoPreview(null);
      setStampPreview(null);
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
        banks: [{
          name: '',
          accountNumber: '',
          address: '',
          swift: '',
          intermediaryBankName: '',
          intermediaryBankSwift: '',
          isDefault: false,
        }],
      });
    }
    setIsModalOpen(true);
    setCountrySearch('');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSeller(null);
    reset();
    setCountrySearch('');
    setLogoFile(null);
    setLogoPreview(null);
    setStampFile(null);
    setStampPreview(null);
  };

  // Submit form
  const onSubmit = async (data: SellerFormValues) => {
    try {
      // Check if we have files to upload
      const hasFiles = logoFile || stampFile;

      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('legalType', data.legalType);
        if (data.prefix) formData.append('prefix', data.prefix);
        formData.append('contactPerson', data.contactPerson);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        if (data.address) formData.append('address', data.address);
        formData.append('country', data.country);
        formData.append('taxId', data.taxId);

        // Append banks as JSON string (backend should parse this)
        const banksJson = JSON.stringify(data.banks);
        formData.append('banks', banksJson);

        // Append files if they exist
        if (logoFile) {
          formData.append('logo', logoFile);
        }
        if (stampFile) {
          formData.append('stamp', stampFile);
        }

        if (editingSeller) {
          await sellersService.update(editingSeller.id, formData);
          toast({
            title: 'Success',
            description: 'Supplier updated successfully',
          });
        } else {
          await sellersService.create(formData);
          toast({
            title: 'Success',
            description: 'Supplier created successfully',
          });
        }
      } else {
        // Use regular JSON payload if no files
        const payload: SellerFormData = {
          name: data.name,
          legalType: data.legalType,
          prefix: data.prefix,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          address: data.address,
          country: data.country,
          taxId: data.taxId,
          banks: data.banks,
        };

        if (editingSeller) {
          await sellersService.update(editingSeller.id, payload);
          toast({
            title: 'Success',
            description: 'Supplier updated successfully',
          });
        } else {
          await sellersService.create(payload);
          toast({
            title: 'Success',
            description: 'Supplier created successfully',
          });
        }
      }

      closeModal();
      fetchSellers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save seller',
        variant: 'destructive',
      });
    }
  };

  // Delete seller
  const handleDelete = async () => {
    if (!deletingSeller) return;

    try {
      await sellersService.delete(deletingSeller.id);
      toast({
        title: 'Success',
        description: 'Supplier deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setDeletingSeller(null);
      fetchSellers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete seller',
        variant: 'destructive',
      });
    }
  };

  // Open delete dialog
  const openDeleteDialog = (seller: Seller) => {
    setDeletingSeller(seller);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Management</h1>
          <p className="text-muted-foreground">Easily manage suppliers, contacts, and company data.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
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
              <TableHead className="whitespace-nowrap">Bank Name</TableHead>
              <TableHead className="whitespace-nowrap">Created On</TableHead>
              <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No suppliers found
                </TableCell>
              </TableRow>
            ) : (
              sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="whitespace-nowrap font-medium">{seller.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{seller.prefix || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{seller.contactPerson}</TableCell>
                  <TableCell className="whitespace-nowrap">{seller.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{seller.phone}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCountryFlag(seller.country)}</span>
                      <span>{seller.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{seller.taxId}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {seller.banks && seller.banks.length > 0
                      ? seller.banks.find(bank => bank.isDefault)?.name || seller.banks[0]?.name || '-'
                      : '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{format(new Date(seller.createdAt), 'dd.MM.yyyy')}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal(seller)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(seller)}
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

        {/* Pagination */}
        {!loading && sellers.length > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-4">
                Showing {totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {(() => {
                  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
                  const pages = [];

                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </Button>
                      );
                    }
                  } else {
                    pages.push(
                      <Button
                        key={1}
                        variant={currentPage === 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </Button>
                    );

                    if (currentPage > 3) {
                      pages.push(
                        <span key="dots-1" className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }

                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </Button>
                      );
                    }

                    if (currentPage < totalPages - 2) {
                      pages.push(
                        <span key="dots-2" className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }

                    pages.push(
                      <Button
                        key={totalPages}
                        variant={currentPage === totalPages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    );
                  }

                  return pages;
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(totalCount / itemsPerPage), prev + 1))}
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Seller Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSeller ? 'Edit Supplier' : 'Create Supplier'}</DialogTitle>
            <DialogDescription>
              {editingSeller
                ? 'Update supplier information and banking details'
                : 'Add a new supplier to the system'}
            </DialogDescription>
          </DialogHeader>
          <form key={editingSeller?.id || 'new'} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                  Company and contact details
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
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
                <Label htmlFor="prefix">Prefix</Label>
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
                  <Label htmlFor="phone">Phone *</Label>
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
                <Label htmlFor="email">Email *</Label>
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
            </div>

            <Separator />

            {/* Section 2: Logo and Stamp */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold">Logo and Stamp</h3>
                <p className="text-sm text-muted-foreground">
                  Upload company logo and stamp for invoices
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg">
                    {(logoPreview || editingSeller?.logo) && (
                      <img
                        src={logoPreview || editingSeller?.logo}
                        alt="Logo preview"
                        className="max-h-32 object-contain"
                      />
                    )}
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLogoPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>

                {/* Stamp Upload */}
                <div className="space-y-2">
                  <Label htmlFor="stamp">Company Stamp</Label>
                  <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg">
                    {(stampPreview || editingSeller?.stamp) && (
                      <img
                        src={stampPreview || editingSeller?.stamp}
                        alt="Stamp preview"
                        className="max-h-32 object-contain"
                      />
                    )}
                    <Input
                      id="stamp"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setStampFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setStampPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 3: Bank Details */}
            <div className="space-y-4">
              <div className="border-b pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Bank Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Banking information for payments
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newIndex = fields.length;
                    append({
                      name: '',
                      accountNumber: '',
                      address: '',
                      swift: '',
                      intermediaryBankName: '',
                      intermediaryBankSwift: '',
                      isDefault: false,
                    });
                    // Expand the newly added bank
                    setExpandedBanks(prev => {
                      const newSet = new Set(prev);
                      newSet.add(newIndex);
                      return newSet;
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bank
                </Button>
              </div>

              {errors.banks && typeof errors.banks.message === 'string' && (
                <p className="text-sm text-destructive">{errors.banks.message}</p>
              )}

              {fields.map((field, index) => {
                const isExpanded = expandedBanks.has(index);
                return (
                  <div key={field.id} className="border rounded-lg relative">
                    {/* Bank Header - Always Visible */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                      onClick={() => toggleBankExpansion(index)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <div className="space-y-2 flex-1">
                          <Input
                            id={`banks.${index}.name`}
                            {...register(`banks.${index}.name` as const)}
                            placeholder="Bank Name *"
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium"
                          />
                          {errors.banks?.[index]?.name && (
                            <p className="text-sm text-destructive">
                              {errors.banks[index]?.name?.message}
                            </p>
                          )}
                        </div>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(index);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Bank Details - Collapsible */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`banks.${index}.accountNumber`}>Account Number *</Label>
                            <Input
                              id={`banks.${index}.accountNumber`}
                              {...register(`banks.${index}.accountNumber` as const)}
                              placeholder="GE29NB0000000101904917"
                            />
                            {errors.banks?.[index]?.accountNumber && (
                              <p className="text-sm text-destructive">
                                {errors.banks[index]?.accountNumber?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`banks.${index}.swift`}>SWIFT/BIC</Label>
                            <Input
                              id={`banks.${index}.swift`}
                              {...register(`banks.${index}.swift` as const)}
                              placeholder="BAGAGE22"
                            />
                            {errors.banks?.[index]?.swift && (
                              <p className="text-sm text-destructive">
                                {errors.banks[index]?.swift?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`banks.${index}.address`}>Bank Address</Label>
                          <Textarea
                            id={`banks.${index}.address`}
                            {...register(`banks.${index}.address` as const)}
                            placeholder="3 Pushkin Street, Tbilisi 0105, Georgia"
                            rows={2}
                          />
                          {errors.banks?.[index]?.address && (
                            <p className="text-sm text-destructive">
                              {errors.banks[index]?.address?.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`banks.${index}.intermediaryBankName`}>Intermediary Bank Name</Label>
                            <Input
                              id={`banks.${index}.intermediaryBankName`}
                              {...register(`banks.${index}.intermediaryBankName` as const)}
                              placeholder="JP Morgan Chase Bank"
                            />
                            {errors.banks?.[index]?.intermediaryBankName && (
                              <p className="text-sm text-destructive">
                                {errors.banks[index]?.intermediaryBankName?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`banks.${index}.intermediaryBankSwift`}>Intermediary Bank SWIFT</Label>
                            <Input
                              id={`banks.${index}.intermediaryBankSwift`}
                              {...register(`banks.${index}.intermediaryBankSwift` as const)}
                              placeholder="CHASUS33"
                            />
                            {errors.banks?.[index]?.intermediaryBankSwift && (
                              <p className="text-sm text-destructive">
                                {errors.banks[index]?.intermediaryBankSwift?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`banks.${index}.isDefault`}
                            {...register(`banks.${index}.isDefault` as const)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`banks.${index}.isDefault`} className="cursor-pointer">
                            Set as default bank
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingSeller ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingSeller?.name}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingSeller(null);
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
