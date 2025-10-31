# Quick Start Guide - API Client & State Management

This guide will help you quickly integrate the API client and state management into your application.

## Setup

### 1. Environment Configuration

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Initialize Stores in Your App

In your root layout or `_app.tsx`:

```typescript
// app/layout.tsx (Next.js 14 App Router)
import { initializeStores } from '@/lib/stores';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeStores();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Or for Next.js Pages Router:

```typescript
// pages/_app.tsx
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { initializeStores } from '@/lib/stores';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initializeStores();
  }, []);

  return <Component {...pageProps} />;
}
```

## Usage Examples

### Authentication

#### Login Page

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

#### Protected Route Component

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

#### User Profile Component

```typescript
'use client';

import { useAuthStore } from '@/lib/stores';

export function UserProfile() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div>
      <p>Welcome, {user?.fullName}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### Invoice Management

#### Invoice List Component

```typescript
'use client';

import { useEffect } from 'react';
import { useInvoiceStore } from '@/lib/stores';
import { toast } from 'sonner';

export function InvoiceList() {
  const { invoices, isLoading, error, fetchInvoices, deleteInvoice } = useInvoiceStore();

  useEffect(() => {
    fetchInvoices({ page: 1, limit: 10 });
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        toast.success('Invoice deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete invoice');
      }
    }
  };

  if (isLoading) {
    return <div>Loading invoices...</div>;
  }

  return (
    <div>
      <h2>Invoices</h2>
      {invoices.length === 0 ? (
        <p>No invoices found</p>
      ) : (
        <ul>
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <span>{invoice.invoiceNumber}</span>
              <span>{invoice.status}</span>
              <span>${invoice.grandTotal}</span>
              <button onClick={() => handleDelete(invoice.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

#### Create Invoice Form

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoiceStore } from '@/lib/stores';
import { InvoiceFormData } from '@/types';
import { toast } from 'sonner';

export function CreateInvoiceForm() {
  const router = useRouter();
  const { createInvoice, isLoading } = useInvoiceStore();

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      await createInvoice(data);
      toast.success('Invoice created successfully');
      router.push('/invoices');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invoice');
    }
  };

  // Form implementation here...
  return <form>{/* Form fields */}</form>;
}
```

### Buyer Management

```typescript
'use client';

import { useEffect } from 'react';
import { useBuyerStore } from '@/lib/stores';

export function BuyerList() {
  const { buyers, isLoading, fetchBuyers, deleteBuyer } = useBuyerStore();

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteBuyer(id);
      toast.success('Buyer deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      {/* Render buyers list */}
    </div>
  );
}
```

### Theme Toggle

```typescript
'use client';

import { useThemeStore } from '@/lib/stores';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeStore();

  return (
    <button onClick={toggleTheme}>
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
```

### Dashboard

```typescript
'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/lib/api';
import { DashboardStats } from '@/types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      {stats && (
        <div>
          <div>Total Invoices: {stats.totalInvoices}</div>
          <div>Paid Invoices: {stats.paidInvoices}</div>
          <div>Total Revenue: ${stats.totalRevenue}</div>
        </div>
      )}
    </div>
  );
}
```

## API Service Usage (Without Stores)

If you need to call API services directly:

```typescript
import { invoicesService } from '@/lib/api';

// In an async function or useEffect
const fetchInvoice = async (id: string) => {
  try {
    const response = await invoicesService.getById(id);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Error Handling Pattern

```typescript
'use client';

import { useEffect } from 'react';
import { useInvoiceStore } from '@/lib/stores';
import { toast } from 'sonner';

export function MyComponent() {
  const { error, clearError } = useInvoiceStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  return <div>{/* Component content */}</div>;
}
```

## TypeScript Types

Import types from the types directory:

```typescript
import {
  User,
  Invoice,
  Buyer,
  Seller,
  InvoiceFormData,
  BuyerFormData,
  SellerFormData,
  UserFormData,
  ApiResponse,
  ApiError,
} from '@/types';
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks and display error messages
2. **Show loading states**: Use `isLoading` from stores
3. **Clear errors after displaying**: Call `clearError()` after showing error messages
4. **Use pagination**: Don't load all data at once
5. **Persist auth state**: Auth tokens are automatically persisted
6. **Check authentication**: Use `isAuthenticated` from auth store
7. **Logout on 401**: Handled automatically by the API client

## Common Patterns

### Fetch Data on Component Mount

```typescript
useEffect(() => {
  fetchData();
}, []);
```

### Handle Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await createResource(data);
    toast.success('Success!');
    router.push('/list');
  } catch (error: any) {
    toast.error(error.message);
  }
};
```

### Conditional Rendering Based on Auth

```typescript
const { isAuthenticated, user } = useAuthStore();

if (!isAuthenticated) {
  return <LoginPrompt />;
}

if (user?.role === 'ADMIN') {
  return <AdminPanel />;
}

return <UserPanel />;
```

## Troubleshooting

### Token Not Being Sent

- Check that `NEXT_PUBLIC_API_URL` is set in `.env.local`
- Verify token exists in localStorage: `localStorage.getItem('accessToken')`

### 401 Errors Not Being Handled

- Ensure the API client is being used (not raw axios)
- Check that refresh token is valid

### Store State Not Persisting

- Check browser localStorage
- Ensure store is using persist middleware (auth and theme stores)

### TypeScript Errors

- Run `npm run lint` or `yarn lint`
- Check that all types are imported from `@/types`

## Support

For more details, see:
- `/lib/README.md` - Comprehensive API and store documentation
- `/IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `/types/index.ts` - All TypeScript type definitions
