'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ColDef, SelectionChangedEvent, CellEditingStoppedEvent, ModuleRegistry, AllCommunityModule, themeAlpine, iconSetAlpine, colorSchemeLight, colorSchemeDarkBlue } from 'ag-grid-community';
import type { AgGridReact as AgGridReactType } from 'ag-grid-react';
import './ag-grid-custom.css';
import { Search, Download, Trash2, Edit2, Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import { CustomHeader } from './CustomHeader';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { salesReportService } from '@/lib/api/sales-report.service';
import { SalesReport, SalesReportFilters } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { usePermissions, useUser } from '@/hooks/use-permissions';
import Link from 'next/link';

// Dynamically import AG Grid to avoid SSR issues
const AgGridReact = dynamic<any>(
  () => import('ag-grid-react').then((mod) => mod.AgGridReact),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-96">Loading grid...</div>
  }
);

export default function SalesReportPage() {
  const permissions = usePermissions();
  const user = useUser();
  const gridRef = useRef<any>(null); // Reference to AG Grid API
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<SalesReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check initially
    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Create theme with Alpine icons and conditional color scheme
  const customTheme = useMemo(() =>
    themeAlpine
      .withPart(iconSetAlpine)
      .withPart(isDarkMode ? colorSchemeDarkBlue : colorSchemeLight)
  , [isDarkMode]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState('');
  const [passengerFilter, setPassengerFilter] = useState('');
  const [buyerFilter, setBuyerFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [productNameFilter, setProductNameFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Can create/edit/delete
  const canModify = user ? ['ADMIN', 'MANAGER', 'OPERATOR'].includes(user.role) : false;

  const fetchSalesReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: SalesReportFilters = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        invoiceNumber: invoiceNumberFilter || undefined,
        passenger: passengerFilter || undefined,
        buyer: buyerFilter || undefined,
        provider: providerFilter || undefined,
        productName: productNameFilter || undefined,
        issueDateFrom: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        issueDateTo: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      };

      const response = await salesReportService.getAll(params);

      // Handle both array and nested data response
      const data = Array.isArray(response.data) ? response.data : ((response.data as any)?.data || []);
      setSalesReports(data);

      const total = response.pagination?.total ?? response.total ?? response.meta?.total ?? data.length;
      setTotalCount(total);
    } catch (error: any) {
      console.error('Error fetching sales reports:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch sales reports');
      setSalesReports([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, invoiceNumberFilter, passengerFilter, buyerFilter, providerFilter, productNameFilter, dateRange]);

  useEffect(() => {
    fetchSalesReports();
  }, [fetchSalesReports]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setInvoiceNumberFilter('');
    setPassengerFilter('');
    setBuyerFilter('');
    setProviderFilter('');
    setProductNameFilter('');
    setDateRange(undefined);
    setCurrentPage(1);
  };

  const handleSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedRows();
    setSelectedRows(selectedNodes);
  }, []);

  const handleCellEditingStopped = useCallback(async (event: CellEditingStoppedEvent) => {
    const { data, colDef, newValue, oldValue } = event;

    if (newValue === oldValue) return;
    if (!canModify) {
      toast.error('You do not have permission to edit');
      return;
    }

    try {
      const field = colDef.field as keyof SalesReport;

      // Update the API
      await salesReportService.update(data.id, { [field]: newValue });
      toast.success('Sales report updated successfully');

      // Update the local state directly instead of refetching
      // This preserves scroll position naturally
      setSalesReports(prevReports =>
        prevReports.map(report =>
          report.id === data.id
            ? { ...report, [field]: newValue }
            : report
        )
      );

      // Also update the grid's row data directly
      const rowNode = event.api.getRowNode(data.id);
      if (rowNode) {
        rowNode.setDataValue(field as string, newValue);
      }
    } catch (error) {
      console.error('Error updating sales report:', error);
      toast.error('Failed to update sales report');

      // Revert the change in the grid on error
      const rowNode = event.api.getRowNode(data.id);
      if (rowNode) {
        rowNode.setDataValue(colDef.field as string, oldValue);
      }
    }
  }, [canModify]);

  const handleAddRow = async () => {
    if (!canModify) {
      toast.error('You do not have permission to add rows');
      return;
    }

    if (!user?.id) {
      toast.error('User information not available');
      return;
    }

    try {
      // Create a new empty sales report
      const newReport: Partial<SalesReport> = {
        issueDate: new Date().toISOString(),
        invoiceNumber: '',
        passenger: '',
        productName: '',
        destination: '',
        departureArrivalDate: null,
        totalAmount: 0,
        buyer: '',
        provider: '',
        ticketNumber: '',
        pnr: '',
        airlineCompany: '',
        fare: 0,
        net: 0,
        serviceFee: 0,
        comment: '',
        createdBy: user.id, // Set createdBy to logged-in user's ID
      };

      // Create the new report via API
      const response = await salesReportService.create(newReport as any);
      const created = response.data;
      toast.success('New row added successfully');

      // Add to local state at the end with user information populated
      const newRowWithUser = {
        ...created,
        issueDate: created.issueDate || new Date().toISOString(),
        user: user, // Add the complete user object for the Created By column
      };

      setSalesReports(prevReports => [...prevReports, newRowWithUser]);
      setTotalCount(prev => prev + 1);

      // Focus on the newly added row (last row before the Add Row button)
      setTimeout(() => {
        if (gridRef.current) {
          const newRowIndex = salesReports.length; // Index of the newly added row
          gridRef.current.api.ensureIndexVisible(newRowIndex, 'bottom');
        }
      }, 100);
    } catch (error) {
      console.error('Error adding row:', error);
      toast.error('Failed to add new row');
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select rows to delete');
      return;
    }

    if (!canModify) {
      toast.error('You do not have permission to delete');
      return;
    }

    // Show custom confirmation dialog
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const ids = selectedRows.map(row => row.id);
      await salesReportService.bulkDelete(ids);
      toast.success(`Successfully deleted ${selectedRows.length} sales report(s)`);
      setSelectedRows([]);
      setShowDeleteDialog(false);
      fetchSalesReports();
    } catch (error) {
      console.error('Error deleting sales reports:', error);
      toast.error('Failed to delete sales reports');
      setShowDeleteDialog(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.info('Exporting sales reports...');

      const params: SalesReportFilters = {
        search: searchQuery || undefined,
        invoiceNumber: invoiceNumberFilter || undefined,
        passenger: passengerFilter || undefined,
        buyer: buyerFilter || undefined,
        provider: providerFilter || undefined,
        productName: productNameFilter || undefined,
        issueDateFrom: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        issueDateTo: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      };

      const blob = await salesReportService.exportToExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-reports-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Sales reports exported successfully');
    } catch (error) {
      console.error('Error exporting sales reports:', error);
      toast.error('Failed to export sales reports');
    }
  };

  // Add the "Add Row" button as a special row at the end of the data
  const rowDataWithAddButton = useMemo(() => {
    if (canModify && salesReports.length > 0) {
      return [...salesReports, { id: '__add_row_button__' } as any];
    }
    return salesReports;
  }, [salesReports, canModify]);

  const columnDefs: ColDef<SalesReport>[] = useMemo(() => [
    // 1. #
    {
      headerName: '#',
      valueGetter: (params) => {
        if (params.node && params.node.rowIndex !== null) {
          return params.node.rowIndex + 1;
        }
        return '';
      },
      filter: false,
      sortable: true,
      resizable: true,
      width: 70,
      maxWidth: 70,
      lockPosition: true,
      suppressMovable: true,
      suppressHeaderFilterButton: true,
      suppressHeaderMenuButton: true,
      headerComponent: null as any,
      cellRenderer: (params: any) => {
        // Check if this is the add row button
        if (params.data && params.data.id === '__add_row_button__') {
          return (
            <div
              className="flex items-center justify-center h-full cursor-pointer"
              onClick={handleAddRow}
              style={{ width: '100%' }}
            >
              <Plus className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span className="ml-2 text-sm text-green-600 dark:text-green-500 font-medium">Add New Row</span>
            </div>
          );
        }
        // Return the value for regular rows
        return params.value;
      },
      colSpan: (params) => {
        // Span across all columns for the add row button
        if (params.data && params.data.id === '__add_row_button__') {
          return 999; // Large number to span all columns
        }
        return 1;
      },
    },
    // 3. Issue Date
    {
      headerName: 'Issue Date',
      field: 'issueDate',
      valueFormatter: (params) => params.value ? formatDate(params.value) : '-',
      filter: 'agDateColumnFilter',
      editable: canModify,
    },
    // 4. Product Name
    {
      headerName: 'Product Name',
      field: 'productName',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
    // 5. Ticket Number
    {
      headerName: 'Ticket Number',
      field: 'ticketNumber',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
    // 6. PNR
    {
      headerName: 'PNR',
      field: 'pnr',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
    // 7. Airline Company
    {
      headerName: 'Airline Company',
      field: 'airlineCompany',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
    // 8. Passenger Name
    {
      headerName: 'Passenger Name',
      field: 'passenger',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
    // 9. Destination
    {
      headerName: 'Destination',
      field: 'destination',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
    // 10. Departure/Arrival Date
    {
      headerName: 'Departure/Arrival Date',
      field: 'departureArrivalDate',
      valueFormatter: (params) => params.value ? formatDate(params.value) : '-',
      filter: 'agDateColumnFilter',
      editable: canModify,
    },
    // 11. Fare
    {
      headerName: 'Fare',
      field: 'fare',
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '-';
        const num = Number(params.value);
        return isNaN(num) ? '-' : num.toFixed(2);
      },
      valueParser: (params) => {
        const newValue = params.newValue;
        if (newValue === null || newValue === undefined || newValue === '') return null;
        const num = Number(newValue);
        return isNaN(num) ? null : num;
      },
      filter: 'agNumberColumnFilter',
      editable: canModify,
    },
    // 12. Net
    {
      headerName: 'Net',
      field: 'net',
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '-';
        const num = Number(params.value);
        return isNaN(num) ? '-' : num.toFixed(2);
      },
      valueParser: (params) => {
        const newValue = params.newValue;
        if (newValue === null || newValue === undefined || newValue === '') return null;
        const num = Number(newValue);
        return isNaN(num) ? null : num;
      },
      filter: 'agNumberColumnFilter',
      editable: canModify,
    },
    // 13. Service Fee
    {
      headerName: 'Service Fee',
      field: 'serviceFee',
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '-';
        const num = Number(params.value);
        return isNaN(num) ? '-' : num.toFixed(2);
      },
      valueParser: (params) => {
        const newValue = params.newValue;
        if (newValue === null || newValue === undefined || newValue === '') return null;
        const num = Number(newValue);
        return isNaN(num) ? null : num;
      },
      filter: 'agNumberColumnFilter',
      editable: canModify,
    },
    // 14. Total Amount
    {
      headerName: 'Total Amount',
      field: 'totalAmount',
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '-';
        const num = Number(params.value);
        return isNaN(num) ? '-' : num.toFixed(2);
      },
      valueParser: (params) => {
        const newValue = params.newValue;
        if (newValue === null || newValue === undefined || newValue === '') return null;
        const num = Number(newValue);
        return isNaN(num) ? null : num;
      },
      filter: 'agNumberColumnFilter',
      editable: canModify,
    },
    // 15. Invoice Number
    {
      headerName: 'Invoice Number',
      field: 'invoiceNumber',
      cellRenderer: (params: any) => {
        if (!params.value) return '-';
        return (
          <Link href={`/dashboard/invoices`} className="text-blue-600 hover:underline">
            {params.value}
          </Link>
        );
      },
      filter: 'agTextColumnFilter',
    },
    // 16. Provider
    {
      headerName: 'Provider',
      field: 'provider',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
    // 17. Created By
    {
      headerName: 'Created By',
      field: 'createdBy',
      valueGetter: (params) => {
        const data = params.data;
        return data?.user?.fullName || data?.createdBy || '-';
      },
      filter: 'agTextColumnFilter',
    },
    // 18. Buyer
    {
      headerName: 'Buyer',
      field: 'buyer',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
    // 19. Comment
    {
      headerName: 'Comment',
      field: 'comment',
      filter: 'agTextColumnFilter',
      editable: canModify,
    },
  ], [canModify]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,

    // Use custom header component that includes both filter and menu icons
    headerComponent: CustomHeader,

    // Enable column features
    suppressMovable: false, // Allow drag to reorder
    lockPinned: false, // Allow pin/unpin
    lockPosition: false, // Allow position changes
    lockVisible: false, // Allow show/hide

    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true,
    },
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
    },
  }), []);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground">
            View and manage sales reports
            {!loading && <span className="ml-2">({totalCount} total records, {salesReports.length} loaded)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {permissions.canExportExcel && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, passenger, buyer, or provider..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
                    <span>Filter by date range</span>
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
            {(searchQuery || dateRange) && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Bulk Actions Toolbar - Always visible */}
      <Card className="py-2 px-4" style={{ backgroundColor: 'hsl(var(--muted) / .5)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedRows.length > 0 ? `${selectedRows.length} row(s) selected` : 'No rows selected'}
          </span>
          {canModify && (
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedRows.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          )}
        </div>
      </Card>

      {/* AG Grid Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading sales reports...</p>
            </div>
          </div>
        ) : salesReports.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-lg font-medium">No sales reports found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Sales reports will appear here when invoices are created
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full" style={{ height: 600 }}>
            <AgGridReact
              ref={gridRef}
              theme={customTheme}
              rowData={rowDataWithAddButton}
              columnDefs={columnDefs as any}
              defaultColDef={defaultColDef as any}

              // Row selection configuration
              rowSelection={{
                mode: 'multiRow',
                isRowSelectable: (node: any) => {
                  // Prevent selection of the "Add Row" button row
                  return node.data?.id !== '__add_row_button__';
                },
              }}

              // Event handlers
              onSelectionChanged={handleSelectionChanged}
              onCellEditingStopped={handleCellEditingStopped}

              // Grid features
              pagination={false}
              animateRows={true}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              enableRangeSelection={true}
              rowHeight={25}

              // Auto-size configuration - size columns to fit header content
              autoSizeStrategy={{
                type: 'fitCellContents',
                skipHeader: false,
              }}

              // IMPORTANT: Enable filter buttons explicitly
              suppressMenuHide={false}
              suppressContextMenu={false}

              sideBar={{
                toolPanels: [
                  {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                    toolPanelParams: {
                      suppressRowGroups: true,
                      suppressValues: true,
                      suppressPivots: true,
                      suppressPivotMode: true,
                    },
                  },
                  {
                    id: 'filters',
                    labelDefault: 'Filters',
                    labelKey: 'filters',
                    iconKey: 'filter',
                    toolPanel: 'agFiltersToolPanel',
                  },
                ],
                defaultToolPanel: '',
              }}
            />
          </div>
        )}

        {/* Custom Pagination */}
        {!loading && salesReports.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-muted-foreground ml-4">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sales Reports</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRows.length} sales report{selectedRows.length > 1 ? 's' : ''}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
