'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Save,
  Upload,
  X,
  Download,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { settingsService, LoginHistoryEntry } from '@/lib/api/settings.service';
import { Settings } from '@/types';

interface GeneralSettingsData {
  companyName: string;
  defaultCurrency: string;
  dateFormat: string;
  timezone: string;
}

interface RolePermissions {
  [role: string]: {
    [feature: string]: boolean;
  };
}

interface InvoiceSettingsData {
  template: string;
  showLogo: boolean;
  showStamp: boolean;
  itemsPerPage: number;
  invoicePrefix: string;
  startingNumber: number;
  autoIncrement: boolean;
}

interface NotificationSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  emailTemplate: string;
  triggers: {
    invoiceCreated: boolean;
    invoicePaid: boolean;
    invoiceOverdue: boolean;
    invoiceCanceled: boolean;
  };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Role Permissions State
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
    ADMIN: {
      'Manage Users': true,
      'Create Invoices': true,
      'Edit Invoices': true,
      'Delete Invoices': true,
      'View Reports': true,
      'Manage Settings': true,
      'Manage Buyers': true,
      'Manage Sellers': true,
    },
    OPERATOR: {
      'Manage Users': false,
      'Create Invoices': true,
      'Edit Invoices': true,
      'Delete Invoices': false,
      'View Reports': true,
      'Manage Settings': false,
      'Manage Buyers': true,
      'Manage Sellers': true,
    },
    VIEWER: {
      'Manage Users': false,
      'Create Invoices': false,
      'Edit Invoices': false,
      'Delete Invoices': false,
      'View Reports': true,
      'Manage Settings': false,
      'Manage Buyers': false,
      'Manage Sellers': false,
    },
  });

  // Login History State
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [loginHistoryPage, setLoginHistoryPage] = useState(1);
  const [loginHistoryTotal, setLoginHistoryTotal] = useState(0);
  const [loginDateRange, setLoginDateRange] = useState({ start: '', end: '' });

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityFilters, setActivityFilters] = useState({
    dateStart: '',
    dateEnd: '',
    userId: '',
    action: '',
  });

  const {
    register: registerGeneral,
    handleSubmit: handleGeneralSubmit,
    formState: { errors: generalErrors },
    reset: resetGeneral,
  } = useForm<GeneralSettingsData>();

  const {
    register: registerInvoice,
    handleSubmit: handleInvoiceSubmit,
    formState: { errors: invoiceErrors },
    reset: resetInvoice,
    watch: watchInvoice,
  } = useForm<InvoiceSettingsData>();

  const {
    register: registerNotification,
    handleSubmit: handleNotificationSubmit,
    formState: { errors: notificationErrors },
    reset: resetNotification,
  } = useForm<NotificationSettings>();

  const showLogo = watchInvoice('showLogo');
  const showStamp = watchInvoice('showStamp');

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.get();
        setSettings(response.data);
        setLogoPreview(response.data.companyLogo || null);

        resetGeneral({
          companyName: response.data.companyName,
          defaultCurrency: response.data.defaultCurrency,
          dateFormat: response.data.dateFormat,
          timezone: response.data.timezone,
        });

        resetInvoice({
          template: 'modern',
          showLogo: true,
          showStamp: true,
          itemsPerPage: 10,
          invoicePrefix: response.data.invoicePrefix,
          startingNumber: response.data.startingNumber,
          autoIncrement: response.data.autoIncrement,
        });

        resetNotification({
          smtpHost: response.data.smtpHost || '',
          smtpPort: response.data.smtpPort || 587,
          smtpUsername: response.data.smtpUsername || '',
          smtpPassword: response.data.smtpPassword || '',
          emailTemplate: 'default',
          triggers: {
            invoiceCreated: true,
            invoicePaid: true,
            invoiceOverdue: true,
            invoiceCanceled: false,
          },
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [resetGeneral, resetInvoice, resetNotification, toast]);

  // Fetch login history
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLoginHistory();
    }
  }, [activeTab, loginHistoryPage, loginDateRange]);

  // Fetch activity logs
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchActivityLogs();
    }
  }, [activeTab, activityPage, activityFilters]);

  const fetchLoginHistory = async () => {
    try {
      const response = await settingsService.getLoginHistory({
        page: loginHistoryPage,
        limit: 10,
        startDate: loginDateRange.start,
        endDate: loginDateRange.end,
      });
      setLoginHistory(response.data);
      setLoginHistoryTotal(response.meta?.total || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load login history',
        variant: 'destructive',
      });
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await settingsService.getActivityLogs({
        page: activityPage,
        limit: 10,
        startDate: activityFilters.dateStart,
        endDate: activityFilters.dateEnd,
        userId: activityFilters.userId,
        action: activityFilters.action,
      });
      setActivityLogs(response.data);
      setActivityTotal(response.meta?.total || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load activity logs',
        variant: 'destructive',
      });
    }
  };

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // General settings submit
  const onGeneralSubmit = async (data: GeneralSettingsData) => {
    setIsSaving(true);
    try {
      await settingsService.update(data);
      toast({
        title: 'Success',
        description: 'General settings saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save role permissions
  const saveRolePermissions = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to the backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Success',
        description: 'Role permissions saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save permissions',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Invoice settings submit
  const onInvoiceSubmit = async (data: InvoiceSettingsData) => {
    setIsSaving(true);
    try {
      await settingsService.update({
        invoicePrefix: data.invoicePrefix,
        startingNumber: data.startingNumber,
        autoIncrement: data.autoIncrement,
      });
      toast({
        title: 'Success',
        description: 'Invoice settings saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Notification settings submit
  const onNotificationSubmit = async (data: NotificationSettings) => {
    setIsSaving(true);
    try {
      await settingsService.update({
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUsername: data.smtpUsername,
        smtpPassword: data.smtpPassword,
      });
      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Test SMTP
  const testSmtp = async () => {
    try {
      const response = await settingsService.testSmtp();
      toast({
        title: response.data.success ? 'Success' : 'Error',
        description: response.data.message,
        variant: response.data.success ? 'default' : 'destructive',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to test SMTP',
        variant: 'destructive',
      });
    }
  };

  // Export logs
  const exportLogs = async (type: 'login' | 'activity') => {
    try {
      const blob = await settingsService.exportActivityLogs(
        type === 'activity' ? activityFilters : {}
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-logs-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Logs exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export logs',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage application settings and configurations
        </p>
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to users with Admin role.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        {/* Tab 1: General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneralSubmit(onGeneralSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="companyName">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    {...registerGeneral('companyName', {
                      required: 'Company name is required',
                    })}
                    className="mt-1"
                  />
                  {generalErrors.companyName && (
                    <p className="text-sm text-red-500 mt-1">
                      {generalErrors.companyName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyLogo">Company Logo</Label>
                  <div className="mt-2 space-y-4">
                    {logoPreview && (
                      <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
                        <img
                          src={logoPreview}
                          alt="Company logo"
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setLogoPreview(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Button>
                      <p className="text-sm text-muted-foreground">Max size: 2MB</p>
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select
                    defaultValue="USD"
                    onValueChange={(value) =>
                      registerGeneral('defaultCurrency').onChange({
                        target: { value, name: 'defaultCurrency' },
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    defaultValue="MM/DD/YYYY"
                    onValueChange={(value) =>
                      registerGeneral('dateFormat').onChange({
                        target: { value, name: 'dateFormat' },
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    defaultValue="UTC"
                    onValueChange={(value) =>
                      registerGeneral('timezone').onChange({
                        target: { value, name: 'timezone' },
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">
                        Eastern Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: User Management */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Roles Management</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge>ADMIN</Badge>
                    <span className="text-muted-foreground">
                      Full access to all features
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">OPERATOR</Badge>
                    <span className="text-muted-foreground">
                      Can manage invoices and view reports
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">VIEWER</Badge>
                    <span className="text-muted-foreground">
                      Read-only access to reports
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Permissions Matrix</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead className="text-center">Admin</TableHead>
                        <TableHead className="text-center">Operator</TableHead>
                        <TableHead className="text-center">Viewer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(rolePermissions.ADMIN).map((feature) => (
                        <TableRow key={feature}>
                          <TableCell className="font-medium">{feature}</TableCell>
                          {['ADMIN', 'OPERATOR', 'VIEWER'].map((role) => (
                            <TableCell key={role} className="text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={rolePermissions[role][feature]}
                                  onCheckedChange={(checked) => {
                                    setRolePermissions({
                                      ...rolePermissions,
                                      [role]: {
                                        ...rolePermissions[role],
                                        [feature]: checked as boolean,
                                      },
                                    });
                                  }}
                                />
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveRolePermissions} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Permissions'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Invoice Settings */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Configure invoice templates and numbering</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvoiceSubmit(onInvoiceSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="template">Invoice Template</Label>
                  <Select defaultValue="modern">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showLogo">Show Company Logo</Label>
                      <p className="text-sm text-muted-foreground">
                        Display logo on invoices
                      </p>
                    </div>
                    <Switch
                      id="showLogo"
                      {...registerInvoice('showLogo')}
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showStamp">Show Company Stamp</Label>
                      <p className="text-sm text-muted-foreground">
                        Display stamp on invoices
                      </p>
                    </div>
                    <Switch
                      id="showStamp"
                      {...registerInvoice('showStamp')}
                      defaultChecked
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="itemsPerPage">Items Per Page</Label>
                  <Select defaultValue="10">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Invoice Numbering</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invoicePrefix">Prefix</Label>
                      <Input
                        id="invoicePrefix"
                        {...registerInvoice('invoicePrefix', {
                          required: 'Prefix is required',
                        })}
                        placeholder="INV-"
                        className="mt-1"
                      />
                      {invoiceErrors.invoicePrefix && (
                        <p className="text-sm text-red-500 mt-1">
                          {invoiceErrors.invoicePrefix.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="startingNumber">Starting Number</Label>
                      <Input
                        id="startingNumber"
                        type="number"
                        {...registerInvoice('startingNumber', {
                          required: 'Starting number is required',
                          min: { value: 1, message: 'Must be at least 1' },
                        })}
                        className="mt-1"
                      />
                      {invoiceErrors.startingNumber && (
                        <p className="text-sm text-red-500 mt-1">
                          {invoiceErrors.startingNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoIncrement">Auto Increment</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically increment invoice numbers
                        </p>
                      </div>
                      <Switch
                        id="autoIncrement"
                        {...registerInvoice('autoIncrement')}
                        defaultChecked
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleNotificationSubmit(onNotificationSubmit)}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        {...registerNotification('smtpHost')}
                        placeholder="smtp.example.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        {...registerNotification('smtpPort')}
                        placeholder="587"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        {...registerNotification('smtpUsername')}
                        placeholder="user@example.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        {...registerNotification('smtpPassword')}
                        placeholder="••••••••"
                        className="mt-1"
                      />
                    </div>

                    <Button type="button" variant="outline" onClick={testSmtp}>
                      <Send className="mr-2 h-4 w-4" />
                      Test Email Configuration
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emailTemplate">Template</Label>
                      <Select defaultValue="default">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="invoice_created">Invoice Created</SelectItem>
                          <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
                          <SelectItem value="invoice_overdue">Invoice Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Template Editor</Label>
                      <div className="mt-1 border rounded-md p-4 min-h-[200px] bg-muted">
                        <p className="text-sm text-muted-foreground">
                          Rich text editor would go here.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Available variables: {'{'}customer_name{'}'}, {'{'}invoice_number
                          {'}'}, {'{'}amount{'}'}, {'{'}due_date{'}'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Triggers</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="invoiceCreated">Invoice Created</Label>
                      <Checkbox
                        id="invoiceCreated"
                        {...registerNotification('triggers.invoiceCreated')}
                        defaultChecked
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="invoicePaid">Invoice Paid</Label>
                      <Checkbox
                        id="invoicePaid"
                        {...registerNotification('triggers.invoicePaid')}
                        defaultChecked
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="invoiceOverdue">Invoice Overdue</Label>
                      <Checkbox
                        id="invoiceOverdue"
                        {...registerNotification('triggers.invoiceOverdue')}
                        defaultChecked
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="invoiceCanceled">Invoice Canceled</Label>
                      <Checkbox
                        id="invoiceCanceled"
                        {...registerNotification('triggers.invoiceCanceled')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: System Logs */}
        <TabsContent value="logs">
          <div className="space-y-6">
            {/* Login History */}
            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>View user login activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="loginDateStart">Start Date</Label>
                      <Input
                        id="loginDateStart"
                        type="date"
                        value={loginDateRange.start}
                        onChange={(e) =>
                          setLoginDateRange({ ...loginDateRange, start: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="loginDateEnd">End Date</Label>
                      <Input
                        id="loginDateEnd"
                        type="date"
                        value={loginDateRange.end}
                        onChange={(e) =>
                          setLoginDateRange({ ...loginDateRange, end: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => exportLogs('login')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Login Time</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loginHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No login history found
                            </TableCell>
                          </TableRow>
                        ) : (
                          loginHistory.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{entry.email}</TableCell>
                              <TableCell>
                                {new Date(entry.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>{entry.ipAddress}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {entry.userAgent}
                              </TableCell>
                              <TableCell>
                                {entry.success ? (
                                  <Badge className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Success
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Failed
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {loginHistoryTotal > 10 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {(loginHistoryPage - 1) * 10 + 1} to{' '}
                        {Math.min(loginHistoryPage * 10, loginHistoryTotal)} of{' '}
                        {loginHistoryTotal} entries
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLoginHistoryPage(loginHistoryPage - 1)}
                          disabled={loginHistoryPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLoginHistoryPage(loginHistoryPage + 1)}
                          disabled={loginHistoryPage * 10 >= loginHistoryTotal}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>View system activity and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="activityDateStart">Start Date</Label>
                      <Input
                        id="activityDateStart"
                        type="date"
                        value={activityFilters.dateStart}
                        onChange={(e) =>
                          setActivityFilters({
                            ...activityFilters,
                            dateStart: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="activityDateEnd">End Date</Label>
                      <Input
                        id="activityDateEnd"
                        type="date"
                        value={activityFilters.dateEnd}
                        onChange={(e) =>
                          setActivityFilters({
                            ...activityFilters,
                            dateEnd: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="activityUser">User</Label>
                      <Input
                        id="activityUser"
                        placeholder="Filter by user"
                        value={activityFilters.userId}
                        onChange={(e) =>
                          setActivityFilters({
                            ...activityFilters,
                            userId: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="activityAction">Action Type</Label>
                      <Select
                        value={activityFilters.action}
                        onValueChange={(value) =>
                          setActivityFilters({ ...activityFilters, action: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Actions</SelectItem>
                          <SelectItem value="CREATE">Create</SelectItem>
                          <SelectItem value="UPDATE">Update</SelectItem>
                          <SelectItem value="DELETE">Delete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => exportLogs('activity')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Resource</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No activity logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          activityLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>{log.user}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{log.action}</Badge>
                              </TableCell>
                              <TableCell>{log.resource}</TableCell>
                              <TableCell>
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {activityTotal > 10 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {(activityPage - 1) * 10 + 1} to{' '}
                        {Math.min(activityPage * 10, activityTotal)} of {activityTotal}{' '}
                        entries
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActivityPage(activityPage - 1)}
                          disabled={activityPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActivityPage(activityPage + 1)}
                          disabled={activityPage * 10 >= activityTotal}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
