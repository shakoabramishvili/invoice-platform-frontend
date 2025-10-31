'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Printer, Edit, XCircle, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { invoicesService } from '@/lib/api/invoices.service';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  onEdit: (invoice: Invoice) => void;
  onSuccess: () => void;
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoiceId,
  onEdit,
  onSuccess,
}: InvoiceDetailModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoice();
    }
  }, [isOpen, invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoicesService.getById(invoiceId);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice || isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      const blob = await invoicesService.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleEdit = () => {
    if (invoice) {
      onEdit(invoice);
    }
  };

  const handleCancelClick = () => {
    setIsCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!invoice || !cancelReason.trim()) {
      toast.error('Please enter a cancellation reason');
      return;
    }

    try {
      await invoicesService.cancel(invoice.id, cancelReason);
      toast.success('Invoice canceled successfully');
      setIsCancelDialogOpen(false);
      setCancelReason('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error canceling invoice:', error);
      toast.error('Failed to cancel invoice');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'OVERDUE':
        return 'destructive';
      case 'DRAFT':
        return 'outline';
      case 'CANCELED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" hideClose>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Details</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {invoice.status !== 'CANCELED' && (
                <>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelClick}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Invoice
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{formatDate((invoice as any).issueDate || invoice.invoiceDate)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{(invoice as any).user?.fullName || invoice.createdBy?.fullName || 'N/A'}</p>
                </div>
              </div>
              {invoice.canceledAt && (
                <div className="flex items-center justify-between gap-4 pt-2 border-t">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Canceled At</p>
                    <p className="font-medium text-destructive">
                      {formatDate(invoice.canceledAt)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Cancellation Reason
                    </p>
                    <p className="font-medium text-destructive">
                      {invoice.cancelReason || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Buyer & Seller */}
          <Card>
            <CardHeader>
              <CardTitle>Buyer & Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Buyer</p>
                  <p className="font-medium">{invoice.buyer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seller</p>
                  <p className="font-medium">{invoice.seller.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Passengers */}
          {invoice.passengers && invoice.passengers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Passengers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.passengers.map((passenger, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{passenger.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {(passenger as any).birthDate ? formatDate((passenger as any).birthDate) : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Section 4: Products */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.products.map((product, index) => (
                <div key={index} className="grid grid-cols-7 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{product.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Direction</p>
                    <p className="font-medium">{product.direction || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Departure Date</p>
                    <p className="font-medium">{product.departureDate ? formatDate(product.departureDate) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Arrival Date</p>
                    <p className="font-medium">{product.arrivalDate ? formatDate(product.arrivalDate) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{product.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">
                      {typeof product.price === 'number' ? product.price.toFixed(2) : Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium">
                      {typeof product.total === 'number' ? product.total.toFixed(2) : Number(product.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 5: Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  {typeof invoice.subtotal === 'number' ? invoice.subtotal.toFixed(2) : Number(invoice.subtotal || 0).toFixed(2)} {(invoice as any).currencyFrom || invoice.currency}
                </span>
              </div>
              {invoice.discountType !== 'NONE' && invoice.discountValue && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-destructive">
                    -
                    {invoice.discountType === 'PERCENTAGE'
                      ? ((invoice.subtotal * invoice.discountValue) / 100).toFixed(2)
                      : Number(invoice.discountValue).toFixed(2)} {(invoice as any).currencyFrom || invoice.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">
                  {typeof invoice.totalAfterDiscount === 'number' ? invoice.totalAfterDiscount.toFixed(2) : Number(invoice.totalAfterDiscount || 0).toFixed(2)} {(invoice as any).currencyFrom || invoice.currency}
                </span>
              </div>
              {(invoice as any).currencyTo && invoice.exchangeRate && invoice.exchangeRate > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground pt-2">
                  <span>Exchange Rate:</span>
                  <span>
                    1 {(invoice as any).currencyFrom || invoice.currency} = {typeof invoice.exchangeRate === 'number' ? invoice.exchangeRate.toFixed(3) : Number(invoice.exchangeRate).toFixed(3)} {(invoice as any).currencyTo}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span>
                  {typeof invoice.grandTotal === 'number' ? invoice.grandTotal.toFixed(2) : Number(invoice.grandTotal || 0).toFixed(2)} {(invoice as any).currencyTo || (invoice as any).currencyFrom || invoice.currency}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Cancel Invoice Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel invoice <strong>{invoice?.invoiceNumber}</strong>?
              This action cannot be undone.
            </p>
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Cancellation Reason *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Please provide a reason for canceling this invoice..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelReason('');
              }}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim()}
            >
              Cancel Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
