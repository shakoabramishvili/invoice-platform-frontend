'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, FileDown, FileText, Edit, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { invoicesService, InvoiceQueryParams } from '@/lib/api/invoices.service';
import { buyersService } from '@/lib/api/buyers.service';
import { Invoice, Buyer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import InvoiceModal from '@/components/InvoiceModal';
import InvoiceDetailModal from '@/components/InvoiceDetailModal';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function CanceledInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [buyerFilter, setBuyerFilter] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sorting states
  const [sortBy, setSortBy] = useState<string>('issueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params: InvoiceQueryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        status: 'CANCELED',
        buyerId: buyerFilter || undefined,
        startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      };

      const response = await invoicesService.getCanceled(params);
      setInvoices(response.data);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching canceled invoices:', error);
      toast.error('Failed to fetch canceled invoices');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, buyerFilter, dateRange, sortBy, sortOrder]);

  const fetchBuyers = async () => {
    try {
      const response = await buyersService.getAll();
      setBuyers(response.data);
    } catch (error) {
      console.error('Error fetching buyers:', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchInvoices();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setBuyerFilter('');
    setCurrencyFilter('');
    setDateRange(undefined);
    setCurrentPage(1);
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      const blob = await invoicesService.downloadPdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handleExport = async () => {
    try {
      toast.info('Exporting canceled invoices...');

      const params: InvoiceQueryParams = {
        search: searchQuery || undefined,
        status: 'CANCELED',
        buyerId: buyerFilter || undefined,
        startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      };

      const blob = await invoicesService.exportCanceledToExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canceled-invoices-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Canceled invoices exported successfully');
    } catch (error) {
      console.error('Error exporting canceled invoices:', error);
      toast.error('Failed to export canceled invoices');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default descending order
      setSortBy(field);
      setSortOrder('desc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Canceled Invoices</h1>
          <p className="text-muted-foreground">View and manage canceled invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, client, or customer name…"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${!dateRange ? 'text-muted-foreground' : ''}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'MMM dd, yyyy')
                    )
                  ) : (
                    <span>Filter by invoice date range</span>
                  )}
                  {dateRange?.from && (
                    <X
                      className="ml-2 h-4 w-4 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDateRange(undefined);
                        setCurrentPage(1);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {/* <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button> */}
          </div>

          {/* Collapsible Filters */}
          {/* {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Buyer</label>
                <Select value={buyerFilter} onValueChange={setBuyerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All buyers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All buyers</SelectItem>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Currency</label>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All currencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All currencies</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="GEL">GEL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button onClick={handleClearFilters} variant="outline" className="flex-1">
                  Clear Filters
                </Button>
              </div>
            </div>
          )} */}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  <button
                    onClick={() => handleSort('invoiceNumber')}
                    className="flex items-center hover:text-foreground transition-colors font-medium"
                  >
                    Invoice No.
                    {getSortIcon('invoiceNumber')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  <button
                    onClick={() => handleSort('issueDate')}
                    className="flex items-center hover:text-foreground transition-colors font-medium"
                  >
                    Invoice Date
                    {getSortIcon('issueDate')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  <button
                    onClick={() => handleSort('canceledAt')}
                    className="flex items-center hover:text-foreground transition-colors font-medium"
                  >
                    Canceled Date
                    {getSortIcon('canceledAt')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap">Client</TableHead>
                <TableHead className="whitespace-nowrap">Departure Date</TableHead>
                <TableHead className="whitespace-nowrap">Service</TableHead>
                <TableHead className="whitespace-nowrap">Direction</TableHead>
                <TableHead className="whitespace-nowrap">
                  <button
                    onClick={() => handleSort('subtotal')}
                    className="flex items-center hover:text-foreground transition-colors font-medium"
                  >
                    Amount
                    {getSortIcon('subtotal')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap">Currency</TableHead>
                <TableHead className="whitespace-nowrap">Cancellation Reason</TableHead>
                <TableHead className="whitespace-nowrap">Created By</TableHead>
                <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 12 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <p className="text-lg font-medium">No canceled invoices found</p>
                      <p className="text-sm text-muted-foreground">
                        Canceled invoices will appear here
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Invoice rows
                invoices.map((invoice, index) => (
                  <TableRow
                    key={invoice.id}
                    className={index % 2 === 0 ? 'bg-muted/50' : ''}
                  >
                    <TableCell className="whitespace-nowrap">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {invoice.invoiceNumber}
                      </button>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {invoice.canceledAt ? formatDate(invoice.canceledAt) : '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{invoice.buyer.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {invoice.products[0]?.departureDate
                        ? formatDate(invoice.products[0].departureDate)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[200px] block">
                              {invoice.products[0]?.description || '-'}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{invoice.products[0]?.description || '-'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{invoice.products[0]?.direction || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {typeof invoice.grandTotal === 'number'
                        ? invoice.grandTotal.toFixed(2)
                        : Number(invoice.grandTotal || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {(invoice as any).currencyTo || invoice.currency}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[200px] block">
                              {invoice.cancelReason || '-'}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{invoice.cancelReason || '-'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{(invoice as any).user?.fullName || invoice.createdBy?.fullName || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadPdf(invoice.id)}
                              >
                                <FileDown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download PDF</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && invoices.length > 0 && (
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
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-4">
                Showing {startItem} to {endItem} of {totalCount} items
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showDetailModal && selectedInvoice && (
        <InvoiceDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoice(null);
          }}
          invoiceId={selectedInvoice.id}
          onEdit={(invoice) => {
            setShowDetailModal(false);
            // For canceled invoices, we may not want to allow editing
          }}
          onSuccess={fetchInvoices}
        />
      )}
    </div>
  );
}
