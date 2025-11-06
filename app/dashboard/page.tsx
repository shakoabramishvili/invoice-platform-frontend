'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Download,
  Plus,
  FileDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCards from '@/components/StatsCards';
import TopBuyersRanked from '@/components/TopBuyersRanked';
import InvoicesPerEmployee from '@/components/InvoicesPerEmployee';
import CurrencyRatesComparison from '@/components/CurrencyRatesComparison';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboardService } from '@/lib/api';
import { invoicesService } from '@/lib/api/invoices.service';
import { DashboardStats, InvoiceStatus, TopBuyer, EmployeeInvoiceStats, CurrencyRates, Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import InvoiceDetailModal from '@/components/InvoiceDetailModal';

// Status color mapping
const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELED: 'bg-gray-200 text-gray-600',
};

// Chart colors
const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  gray: '#6b7280',
};

const PIE_COLORS = [CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.gray];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeInvoiceStats[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates>({});
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsResponse, topBuyersResponse, employeeStatsResponse, currencyRatesResponse, recentInvoicesResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTopBuyers({ limit: 5 }),
        dashboardService.getInvoicesPerEmployee(),
        dashboardService.getCurrencyRates(),
        dashboardService.getRecentInvoices({ limit: 10 }),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      } else {
        setError(statsResponse.message || 'Failed to fetch dashboard data');
      }

      if (topBuyersResponse.success) {
        setTopBuyers(topBuyersResponse.data);
      }

      if (employeeStatsResponse.success) {
        setEmployeeStats(employeeStatsResponse.data);
      }

      if (currencyRatesResponse.success) {
        setCurrencyRates(currencyRatesResponse.data);
      }

      if (recentInvoicesResponse.success) {
        setRecentInvoices(recentInvoicesResponse.data);
      }
    } catch (err) {
      setError('An error occurred while fetching dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const getStatusBadgeClass = (status: InvoiceStatus) => {
    return statusColors[status] || statusColors.DRAFT;
  };

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await invoicesService.downloadPdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
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

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setShowDetailModal(true);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Test Test test test test</h1>
          <p className="text-muted-foreground mt-1">{getCurrentDate()}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/invoices">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Currency Exchange Rates */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse h-40" />
          <div className="rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse h-40" />
        </div>
      ) : (
        <CurrencyRatesComparison rates={currencyRates} />
      )}

      {/* KPI Cards - Modern Design */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <StatsCards
          totalInvoices={stats?.totalInvoices || 0}
          totalCanceledInvoices={stats?.totalCanceledInvoices || 0}
          revenueUSD={stats?.revenueUSD || 0}
          revenueGEL={stats?.revenueGEL || 0}
          revenueEUR={stats?.revenueEUR || 0}
        />
      )}

      {/* Top 5 Buyers by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 5 Buyers by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-200 animate-pulse h-24" />
              ))}
            </div>
          ) : (
            <TopBuyersRanked buyers={topBuyers} />
          )}
        </CardContent>
      </Card>

      {/* Employee Invoice Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Invoice Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <InvoicesPerEmployee employees={employeeStats} />
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Departure Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices && recentInvoices.length > 0 ? (
                  recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="min-w-[180px]">
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {invoice.invoiceNumber}
                        </button>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {invoice.buyer ? (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">
                                  {invoice.buyer.name.length > 30
                                    ? `${invoice.buyer.name.substring(0, 30)}...`
                                    : invoice.buyer.name}
                                </span>
                              </TooltipTrigger>
                              {invoice.buyer.name.length > 30 && (
                                <TooltipContent>
                                  <p>{invoice.buyer.name}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          (() => {
                            const mainPassenger = invoice.passengers?.find((p: any) => p.isMain);
                            const fullName = mainPassenger
                              ? `${mainPassenger.firstName} ${mainPassenger.lastName}`
                              : 'Individual';
                            return fullName.length > 30 ? (
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help">
                                      {fullName.substring(0, 30)}...
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{fullName}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span>{fullName}</span>
                            );
                          })()
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.grandTotal, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {invoice.currencyTo || invoice.currency}
                        </span>
                      </TableCell>
                      <TableCell>
                        {invoice.departureDate ? formatDate(invoice.departureDate) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No recent invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoiceId && (
        <InvoiceDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoiceId(null);
          }}
          invoiceId={selectedInvoiceId}
          onEdit={() => {
            // Not implemented in dashboard - could navigate to edit page
            toast.info('Edit functionality available in Invoices page');
          }}
          onSuccess={() => {
            // Refresh dashboard data after any changes
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
