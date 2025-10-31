# API Client & State Management

This directory contains the API client, service layer, and Zustand stores for state management in the invoice platform frontend.

## Structure

```
lib/
├── api/                    # API services
│   ├── client.ts          # Axios instance with interceptors
│   ├── auth.service.ts    # Authentication endpoints
│   ├── invoices.service.ts # Invoice endpoints
│   ├── buyers.service.ts  # Buyer endpoints
│   ├── sellers.service.ts # Seller endpoints
│   ├── users.service.ts   # User management endpoints
│   ├── dashboard.service.ts # Dashboard statistics
│   ├── settings.service.ts # Application settings
│   └── index.ts           # Service exports
├── stores/                # Zustand stores
│   ├── authStore.ts       # Authentication state
│   ├── invoiceStore.ts    # Invoice state
│   ├── buyerStore.ts      # Buyer state
│   ├── sellerStore.ts     # Seller state
│   ├── userStore.ts       # User management state
│   ├── themeStore.ts      # Theme state
│   └── index.ts           # Store exports
└── utils/                 # Utility functions
```

## API Client

### Features

- **Automatic Token Management**: Access tokens are automatically added to request headers
- **Token Refresh Queue**: Prevents multiple concurrent token refresh requests
- **401 Handling**: Automatically refreshes tokens and retries failed requests
- **Error Handling**: Standardized error responses
- **Timeout Configuration**: 30-second timeout for all requests

### Configuration

Set the API base URL in your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Usage

```typescript
import { apiClient } from '@/lib/api';

// The client automatically adds auth headers
const response = await apiClient.get('/some-endpoint');
```

## Services

All services follow a consistent pattern and return promises with typed responses.

### Authentication Service

```typescript
import { authService } from '@/lib/api';

// Login
await authService.login({ email, password, rememberMe });

// Register
await authService.register({ fullName, email, password, confirmPassword, acceptTerms });

// Get current user
const user = await authService.getMe();

// Update profile
await authService.updateProfile({ fullName, phone });

// Change password
await authService.changePassword({ currentPassword, newPassword, confirmPassword });

// Logout
await authService.logout();
```

### Invoice Service

```typescript
import { invoicesService } from '@/lib/api';

// Get all invoices with filters
const invoices = await invoicesService.getAll({
  page: 1,
  limit: 10,
  status: 'PAID',
  search: 'INV-001',
});

// Get invoice by ID
const invoice = await invoicesService.getById(id);

// Create invoice
const newInvoice = await invoicesService.create(invoiceData);

// Update invoice
await invoicesService.update(id, updatedData);

// Cancel invoice
await invoicesService.cancel(id, reason);

// Download PDF
const pdfBlob = await invoicesService.downloadPdf(id);
```

### Buyer Service

```typescript
import { buyersService } from '@/lib/api';

// Get all buyers
const buyers = await buyersService.getAll({ page: 1, limit: 10 });

// Create buyer
const newBuyer = await buyersService.create(buyerData);

// Update buyer
await buyersService.update(id, updatedData);

// Delete buyer
await buyersService.delete(id);

// Search buyers
const results = await buyersService.search('company name');
```

### Seller Service

```typescript
import { sellersService } from '@/lib/api';

// Similar to buyersService
const sellers = await sellersService.getAll();
```

### User Service

```typescript
import { usersService } from '@/lib/api';

// Get all users
const users = await usersService.getAll({ role: 'ADMIN' });

// Create user
const newUser = await usersService.create(userData);

// Update user status
await usersService.updateStatus(id, 'INACTIVE');

// Update user role
await usersService.updateRole(id, 'OPERATOR');
```

### Dashboard Service

```typescript
import { dashboardService } from '@/lib/api';

// Get dashboard statistics
const stats = await dashboardService.getStats({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
```

### Settings Service

```typescript
import { settingsService } from '@/lib/api';

// Get settings
const settings = await settingsService.get();

// Update settings
await settingsService.update(updatedSettings);

// Get activity logs
const logs = await settingsService.getActivityLogs();
```

## Zustand Stores

All stores follow a consistent pattern with state and actions.

### Auth Store

```typescript
import { useAuthStore } from '@/lib/stores';

function LoginComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async () => {
    await login({ email, password });
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.fullName}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Invoice Store

```typescript
import { useInvoiceStore } from '@/lib/stores';

function InvoiceList() {
  const { invoices, isLoading, fetchInvoices, deleteInvoice } = useInvoiceStore();

  useEffect(() => {
    fetchInvoices({ page: 1, limit: 10 });
  }, []);

  return (
    <div>
      {invoices.map((invoice) => (
        <div key={invoice.id}>
          {invoice.invoiceNumber}
          <button onClick={() => deleteInvoice(invoice.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Theme Store

```typescript
import { useThemeStore } from '@/lib/stores';

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## Error Handling

All services and stores include error handling. Errors are caught and stored in the state:

```typescript
const { error, clearError } = useInvoiceStore();

useEffect(() => {
  if (error) {
    toast.error(error);
    clearError();
  }
}, [error]);
```

## TypeScript Types

All services and stores use TypeScript types from `/types/index.ts`. This ensures type safety across the application.

```typescript
import { Invoice, Buyer, Seller, User } from '@/types';
```

## Best Practices

1. **Use stores for state management**: Don't call services directly in components
2. **Handle loading states**: Show loading indicators when `isLoading` is true
3. **Handle errors**: Display error messages to users
4. **Clear errors**: Clear error state after displaying messages
5. **Use pagination**: Always paginate large lists
6. **Validate inputs**: Validate form inputs before submitting

## Token Storage

- Access tokens and refresh tokens are stored in `localStorage`
- The auth store persists user data using Zustand's persist middleware
- Tokens are automatically managed by the API client interceptors

## Security

- Tokens are automatically added to request headers
- 401 responses trigger automatic token refresh
- Failed refresh attempts clear tokens and redirect to login
- All API requests use HTTPS in production (configure via `NEXT_PUBLIC_API_URL`)
