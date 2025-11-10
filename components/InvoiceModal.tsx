'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Calendar, X } from 'lucide-react';
import { invoicesService } from '@/lib/api/invoices.service';
import { buyersService } from '@/lib/api/buyers.service';
import { sellersService } from '@/lib/api/sellers.service';
import { Invoice, Buyer, Seller, InvoiceFormData } from '@/types';
import { toast } from 'sonner';
import CustomerModal from '@/components/CustomerModal';

const passengerSchema = z.object({
  gender: z.enum(['MR', 'MS', 'MRS', 'CHD', 'INF']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().optional(),
});

const productSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  direction: z.string().optional(),
  departureDate: z.string().optional(),
  arrivalDate: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
  total: z.number(),
});

const invoiceSchema = z.object({
  issueDate: z.date(),
  legalType: z.enum(['INDIVIDUAL', 'LEGAL_ENTITY'], {
    required_error: 'Legal type is required',
  }),
  showLogo: z.boolean(),
  showStamp: z.boolean(),
  currencyFrom: z.string().min(1, 'Currency is required'),
  buyerId: z.string().optional(),
  sellerId: z.string().min(1, 'Supplier is required'),
  bankId: z.string().optional(),
  passengers: z.array(passengerSchema),
  products: z.array(productSchema).min(1, 'At least one product is required'),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0),
  currencyTo: z.string().optional(),
  exchangeRate: z.number().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
}).refine((data) => {
  // If legal type is LEGAL_ENTITY, buyerId is required
  if (data.legalType === 'LEGAL_ENTITY') {
    return !!data.buyerId;
  }
  return true;
}, {
  message: 'Customer is required for legal entity',
  path: ['buyerId'],
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  onSuccess: () => void;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: InvoiceModalProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [availableBanks, setAvailableBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issueDate: new Date(),
      legalType: 'LEGAL_ENTITY',
      showLogo: true,
      showStamp: true,
      currencyFrom: 'USD',
      buyerId: '',
      sellerId: '',
      bankId: '',
      passengers: [],
      products: [],
      discountType: 'FIXED_AMOUNT',
      discountValue: 0,
      description: '',
      notes: '',
      termsAndConditions: '',
    },
  });

  const {
    fields: passengerFields,
    append: appendPassenger,
    remove: removePassenger,
  } = useFieldArray({
    control,
    name: 'passengers',
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: 'products',
  });

  const watchProducts = watch('products');
  const watchDiscountType = watch('discountType');
  const watchDiscountValue = watch('discountValue');
  const watchExchangeRate = watch('exchangeRate');
  const watchCurrencyFrom = watch('currencyFrom');
  const watchCurrencyTo = watch('currencyTo');
  const watchLegalType = watch('legalType');
  const watchSellerId = watch('sellerId');

  useEffect(() => {
    fetchBuyers();
    fetchSellers();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Clear search inputs when modal closes
      setCustomerSearch('');
      setSellerSearch('');
    }
  }, [isOpen]);

  // Update available banks when seller changes
  useEffect(() => {
    if (watchSellerId) {
      const selectedSeller = sellers.find(s => s.id === watchSellerId);
      if (selectedSeller && selectedSeller.banks) {
        setAvailableBanks(selectedSeller.banks);
        // If editing and bank exists, set it; otherwise set first bank as default
        if (!invoice && selectedSeller.banks.length > 0) {
          const defaultBank = selectedSeller.banks.find(b => b.isDefault) || selectedSeller.banks[0];
          setValue('bankId', defaultBank.id);
        }
      } else {
        setAvailableBanks([]);
        setValue('bankId', '');
      }
    } else {
      setAvailableBanks([]);
      setValue('bankId', '');
    }
  }, [watchSellerId, sellers, setValue, invoice]);


  useEffect(() => {
    if (invoice) {
      // Helper function to format date strings to YYYY-MM-DD
      const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      reset({
        issueDate: new Date((invoice as any).issueDate),
        legalType: invoice.buyer?.id ? 'LEGAL_ENTITY' : 'INDIVIDUAL',
        showLogo: invoice.showLogo,
        showStamp: invoice.showStamp,
        currencyFrom: (invoice as any).currencyFrom,
        buyerId: invoice.buyer?.id || '',
        sellerId: invoice.seller.id,
        bankId: (invoice as any).bankId || '',
        passengers: (invoice.passengers || []).map((p: any) => ({
          gender: p.gender,
          firstName: p.firstName,
          lastName: p.lastName,
          birthDate: formatDateForInput(p.birthDate),
        })),
        products: invoice.products.map((p) => ({
          description: p.description,
          direction: p.direction || '',
          departureDate: formatDateForInput(p.departureDate),
          arrivalDate: formatDateForInput(p.arrivalDate),
          quantity: Number(p.quantity) || 0,
          price: Number(p.price) || 0,
          total: Number(p.total) || 0,
        })),
        discountType: invoice.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
        discountValue: Number(invoice.discountValue) || 0,
        currencyTo: (invoice as any).currencyTo,
        exchangeRate: Number(invoice.exchangeRate) || 0,
        description: (invoice as any).description || '',
        notes: (invoice as any).notes || '',
        termsAndConditions: (invoice as any).termsAndConditions || '',
      });
    }
  }, [invoice, reset]);

  // Calculate totals in real-time
  const subtotal = watchProducts.reduce(
    (sum, product) => {
      const quantity = Number(product.quantity) || 0;
      const price = Number(product.price) || 0;
      return sum + (quantity * price);
    },
    0
  );

  // Calculate discount
  let discountAmount = 0;
  if (watchDiscountType === 'PERCENTAGE') {
    discountAmount = (subtotal * (Number(watchDiscountValue) || 0)) / 100;
  } else if (watchDiscountType === 'FIXED_AMOUNT') {
    discountAmount = Number(watchDiscountValue) || 0;
  }

  // Get first product's departure date for invoice
  const departureDate = watchProducts.length > 0 && watchProducts[0]?.departureDate
    ? watchProducts[0].departureDate
    : undefined;

  const totalAfterDiscount = subtotal - discountAmount;

  // Calculate grand total with exchange rate
  const exchangeRate = Number(watchExchangeRate) || 0;
  const grandTotal = exchangeRate > 0
    ? totalAfterDiscount * exchangeRate
    : totalAfterDiscount;

  const fetchBuyers = async () => {
    try {
      const response = await buyersService.getAll();
      setBuyers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await sellersService.getAll();
      setSellers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to fetch suppliers');
    }
  };

  // Filter customers based on search
  const filteredCustomers = buyers.filter((buyer) =>
    buyer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    buyer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter sellers based on search
  const filteredSellers = sellers.filter((seller) =>
    seller.name.toLowerCase().includes(sellerSearch.toLowerCase()) ||
    seller.email.toLowerCase().includes(sellerSearch.toLowerCase())
  );

  const handleCustomerCreated = async (customerId?: string) => {
    // Refresh buyers list
    await fetchBuyers();
    // Auto-select the newly created customer if ID is provided
    if (customerId) {
      setValue('buyerId', customerId);
    }
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    console.log('Form submitted with data:', data);
    try {
      setLoading(true);

      // Format the data to match API expectations
      const formData: any = {
        sellerId: data.sellerId,
        ...(data.bankId ? { bankId: data.bankId } : {}),
        legalType: data.legalType,
        ...(data.legalType === 'LEGAL_ENTITY' && data.buyerId ? { buyerId: data.buyerId } : {}),
        issueDate: data.issueDate instanceof Date
          ? data.issueDate.toISOString().split('T')[0]
          : data.issueDate,
        departureDate: departureDate,
        subtotal: subtotal,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: discountAmount,
        totalAfterDiscount: totalAfterDiscount,
        currencyFrom: data.currencyFrom,
        exchangeRate: (data.currencyTo && data.exchangeRate) ? data.exchangeRate : 0,
        currencyTo: data.currencyTo || data.currencyFrom,
        grandTotal: (data.currencyTo && data.exchangeRate) ? grandTotal : totalAfterDiscount,
        showLogo: data.showLogo,
        showStamp: data.showStamp,
        description: data.description || '',
        notes: data.notes || '',
        termsAndConditions: data.termsAndConditions || '',
        passengers: data.passengers.map((p) => ({
          gender: p.gender,
          firstName: p.firstName,
          lastName: p.lastName,
          birthDate: p.birthDate || undefined,
        })),
        products: data.products.map((p) => ({
          description: p.description,
          direction: p.direction || '',
          departureDate: p.departureDate || undefined,
          arrivalDate: p.arrivalDate || undefined,
          quantity: p.quantity,
          price: p.price,
          total: p.quantity * p.price,
        })),
      };

      console.log('Sending to API:', formData);

      if (invoice) {
        console.log('Updating invoice:', invoice.id);
        await invoicesService.update(invoice.id, formData);
        toast.success('Invoice updated successfully');
      } else {
        console.log('Creating new invoice');
        await invoicesService.create(formData);
        toast.success('Invoice created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('Form validation errors:', errors);
          toast.error('Please fix the form errors before submitting');
        })} className="space-y-6">
          {/* Section 1: Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Controller
                    control={control}
                    name="issueDate"
                    render={({ field }) => (
                      <Input
                        type="date"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    )}
                  />
                  {errors.issueDate && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.issueDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="legalType">Legal Type</Label>
                  <Controller
                    name="legalType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Clear buyerId when switching to INDIVIDUAL
                          if (value === 'INDIVIDUAL') {
                            setValue('buyerId', '');
                          }
                        }}
                      >
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
                    <p className="text-sm text-destructive mt-1">
                      {errors.legalType.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="showLogo"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label>Show Logo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="showStamp"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label>Show Stamp</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Customer & Supplier */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Supplier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerId">
                    Customer {watchLegalType === 'LEGAL_ENTITY' && <span className="text-destructive">*</span>}
                  </Label>
                  <Controller
                    control={control}
                    name="buyerId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={watchLegalType === 'INDIVIDUAL'}
                      >
                        <SelectTrigger disabled={watchLegalType === 'INDIVIDUAL'}>
                          <SelectValue placeholder={
                            watchLegalType === 'INDIVIDUAL'
                              ? 'Not required for individual'
                              : 'Select customer'
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative mb-2">
                              <Input
                                placeholder="Search customers..."
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                autoFocus
                                className="pr-8"
                              />
                              {customerSearch && (
                                <button
                                  onClick={() => setCustomerSearch('')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredCustomers.map((buyer) => (
                              <SelectItem key={buyer.id} value={buyer.id}>
                                {buyer.name}
                              </SelectItem>
                            ))}
                            {filteredCustomers.length === 0 && (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No customers found
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.buyerId && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.buyerId.message}
                    </p>
                  )}
                  {watchLegalType === 'LEGAL_ENTITY' && (
                    <button
                      type="button"
                      onClick={() => setShowCustomerModal(true)}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                    >
                      <Plus className="h-3 w-3" />
                      Create customer
                    </button>
                  )}
                </div>
                <div>
                  <Label htmlFor="sellerId">Supplier</Label>
                  <Controller
                    control={control}
                    name="sellerId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative mb-2">
                              <Input
                                placeholder="Search suppliers..."
                                value={sellerSearch}
                                onChange={(e) => setSellerSearch(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                autoFocus
                                className="pr-8"
                              />
                              {sellerSearch && (
                                <button
                                  onClick={() => setSellerSearch('')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredSellers.map((seller) => (
                              <SelectItem key={seller.id} value={seller.id}>
                                {seller.name}
                              </SelectItem>
                            ))}
                            {filteredSellers.length === 0 && (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No suppliers found
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.sellerId && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.sellerId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Bank Selection */}
              {watchSellerId && availableBanks.length > 0 && (
                <div className="mt-4">
                  <Label htmlFor="bankId">Bank Account</Label>
                  <Controller
                    control={control}
                    name="bankId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank account" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {availableBanks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              <div className="flex flex-col text-left">
                                <span className="font-medium">{bank.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {bank.accountNumber}
                                  {bank.isDefault && <span className="ml-2 text-green-600">(Default)</span>}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.bankId && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.bankId.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Passengers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Passengers</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendPassenger({
                    gender: 'MR',
                    firstName: '',
                    lastName: '',
                    birthDate: '',
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Passenger
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {passengerFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 p-4 border rounded-lg items-end"
                >
                  <div style={{ width: '10%' }}>
                    <Label>Title</Label>
                    <Controller
                      control={control}
                      name={`passengers.${index}.gender`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MR">Mr</SelectItem>
                            <SelectItem value="MS">Ms</SelectItem>
                            <SelectItem value="MRS">Mrs</SelectItem>
                            <SelectItem value="CHD">Child</SelectItem>
                            <SelectItem value="INF">Infant</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div style={{ width: '30%' }}>
                    <Label>First Name</Label>
                    <Input
                      {...register(`passengers.${index}.firstName`)}
                      placeholder="First name"
                    />
                  </div>
                  <div style={{ width: '30%' }}>
                    <Label>Last Name</Label>
                    <Input
                      {...register(`passengers.${index}.lastName`)}
                      placeholder="Last name"
                    />
                  </div>
                  <div style={{ width: '25%' }}>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      {...register(`passengers.${index}.birthDate`)}
                    />
                  </div>
                  <div style={{ width: '5%' }}>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePassenger(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 4: Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendProduct({
                    description: '',
                    quantity: 1,
                    price: 0,
                    total: 0,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {productFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  {/* First line: Description, Direction */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Description</Label>
                      <Input
                        {...register(`products.${index}.description`)}
                        placeholder="Product description"
                      />
                      {errors.products?.[index]?.description && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.products[index]?.description?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Direction</Label>
                      <Input
                        {...register(`products.${index}.direction`)}
                        placeholder="Direction"
                      />
                    </div>
                  </div>

                  {/* Second line: Departure, Arrival, Quantity, Price, Total, Remove */}
                  <div className="flex gap-3 items-end">
                    <div style={{ width: '20%' }}>
                      <Label>Departure</Label>
                      <Input
                        type="date"
                        {...register(`products.${index}.departureDate`)}
                      />
                    </div>
                    <div style={{ width: '20%' }}>
                      <Label>Arrival</Label>
                      <Input
                        type="date"
                        {...register(`products.${index}.arrivalDate`)}
                      />
                    </div>
                    <div style={{ width: '15%' }}>
                      <Label>Quantity</Label>
                      <Controller
                        control={control}
                        name={`products.${index}.quantity`}
                        render={({ field }) => (
                          <Input
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || !isNaN(Number(value))) {
                                field.onChange(value === '' ? 0 : Number(value));
                              }
                            }}
                            placeholder="1"
                          />
                        )}
                      />
                    </div>
                    <div style={{ width: '20%' }}>
                      <Label>Price</Label>
                      <Controller
                        control={control}
                        name={`products.${index}.price`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                            }}
                            placeholder="0.00"
                          />
                        )}
                      />
                    </div>
                    <div style={{ width: '20%' }}>
                      <Label>Total</Label>
                      <Input
                        value={(watchProducts[index]?.quantity * watchProducts[index]?.price || 0).toFixed(2)}
                        readOnly
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div style={{ width: '5%' }}>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 5: Totals & Discount */}
          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total</Label>
                  <Input
                    type="number"
                    value={subtotal.toFixed(2)}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Controller
                    control={control}
                    name="currencyFrom"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="GEL">GEL</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount</Label>
                  <Controller
                    control={control}
                    name="discountValue"
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                        }}
                        placeholder="0.00"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label>Discount Type</Label>
                  <Controller
                    control={control}
                    name="discountType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                          <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exchange Rate</Label>
                  <Controller
                    control={control}
                    name="exchangeRate"
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.0001"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                        }}
                        placeholder="Optional"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label>Conversion Currency</Label>
                  <Controller
                    control={control}
                    name="currencyTo"
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) => field.onChange(value === 'NONE' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="GEL">GEL</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {subtotal.toFixed(2)} {watchCurrencyFrom}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span className="font-medium text-destructive">
                    -{discountAmount.toFixed(2)} {watchCurrencyFrom}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Amount:</span>
                  <span className="font-medium">
                    {totalAfterDiscount.toFixed(2)} {watchCurrencyFrom}
                  </span>
                </div>
                {watchCurrencyTo && exchangeRate > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-muted-foreground pt-2">
                      <span>Exchange Rate:</span>
                      <span>
                        1 {watchCurrencyFrom} = {exchangeRate.toFixed(3)} {watchCurrencyTo}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Grand Total:</span>
                      <span>
                        {grandTotal.toFixed(2)} {watchCurrencyTo}
                      </span>
                    </div>
                  </>
                )}
                {(!watchCurrencyTo || exchangeRate === 0) && (
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span>
                      {grandTotal.toFixed(2)} {watchCurrencyFrom}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <Textarea
                      id="notes"
                      placeholder="Enter any additional notes or comments about this invoice..."
                      value={field.value || ''}
                      onChange={field.onChange}
                      rows={4}
                      className="resize-none"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                console.log('Submit button clicked');
                console.log('Loading state:', loading);
                console.log('Form errors:', errors);
              }}
            >
              {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Customer Creation Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSuccess={handleCustomerCreated}
      />
    </Dialog>
  );
}
