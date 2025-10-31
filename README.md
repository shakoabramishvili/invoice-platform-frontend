# Invoice Platform - Frontend

A complete Next.js 14 invoice management system with role-based access control, designed to integrate seamlessly with a REST API backend.

## 🚀 Features

### Authentication & Authorization
- ✅ JWT-based authentication with automatic token refresh
- ✅ Login and registration pages with form validation
- ✅ Role-based access control (Admin, Operator, Viewer)
- ✅ Protected routes with middleware
- ✅ Persistent authentication state

### Dashboard
- ✅ KPI cards (Total/Paid/Pending/Canceled Invoices, Total Revenue)
- ✅ Revenue over time chart (last 6 months)
- ✅ Invoice status distribution pie chart
- ✅ Recent invoices table
- ✅ Activity feed

### Invoice Management
- ✅ Complete CRUD operations
- ✅ Advanced filtering (date range, status, buyer, currency)
- ✅ Search functionality
- ✅ Pagination with customizable page size
- ✅ Create/Edit modal with:
  - Basic information (date, number, currency, logo/stamp options)
  - Buyer and seller selection
  - Dynamic passenger management
  - Dynamic product management
  - Automatic total calculations
  - Discount options (percentage/fixed)
  - Currency conversion
- ✅ Detail view modal with complete invoice information
- ✅ PDF download functionality
- ✅ Invoice cancellation with reason
- ✅ Separate canceled invoices page

### Administration
- ✅ **Users Management** (Admin only)
  - Create, edit, delete users
  - Role assignment
  - Status management
  - Password strength validation

- ✅ **Buyers Management**
  - Complete buyer CRUD
  - Country selection with flags
  - Tax ID management

- ✅ **Sellers Management**
  - Complete seller CRUD
  - Bank details management
  - Country selection with flags

### User Features
- ✅ Profile management
  - Profile picture upload
  - Contact information update
  - Password change with strength indicator

- ✅ Settings (Admin only)
  - General settings (company info, currency, date format, timezone)
  - User management (roles and permissions matrix)
  - Invoice settings (templates, numbering, pagination)
  - Notifications (email configuration, templates, triggers)
  - System logs (login history, activity logs with export)

### UI/UX
- ✅ Light and dark theme support
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Collapsible sidebar with persistent state
- ✅ Loading states and skeletons
- ✅ Toast notifications
- ✅ Confirmation dialogs
- ✅ Empty states
- ✅ Error handling

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios with interceptors
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Package Manager:** Yarn

## 📁 Project Structure

```
invoice-platform-frontend/
├── app/                          # Next.js App Router pages
│   ├── dashboard/               # Dashboard pages
│   │   ├── administrator/       # Admin pages
│   │   │   ├── buyers/         # Buyers management
│   │   │   ├── sellers/        # Sellers management
│   │   │   └── users/          # Users management
│   │   ├── invoices/           # Invoice pages
│   │   │   └── canceled/       # Canceled invoices
│   │   ├── profile/            # User profile
│   │   ├── settings/           # Settings (Admin)
│   │   ├── layout.tsx          # Dashboard layout
│   │   └── page.tsx            # Dashboard home
│   ├── login/                   # Login page
│   ├── register/                # Register page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Root page
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── Header.tsx              # App header
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── ThemeToggle.tsx         # Theme switcher
│   ├── InvoiceModal.tsx        # Invoice create/edit
│   └── InvoiceDetailModal.tsx  # Invoice view
├── lib/                        # Core libraries
│   ├── api/                    # API services
│   │   ├── client.ts          # Axios instance
│   │   ├── auth.service.ts    # Auth endpoints
│   │   ├── invoices.service.ts
│   │   ├── buyers.service.ts
│   │   ├── sellers.service.ts
│   │   ├── users.service.ts
│   │   ├── dashboard.service.ts
│   │   └── settings.service.ts
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── invoiceStore.ts
│   │   ├── buyerStore.ts
│   │   ├── sellerStore.ts
│   │   ├── userStore.ts
│   │   └── themeStore.ts
│   └── utils.ts                # Utility functions
├── types/                      # TypeScript types
│   └── index.ts               # All type definitions
├── hooks/                      # Custom React hooks
│   └── use-toast.ts           # Toast hook
├── public/                     # Static assets
├── .env.local                 # Environment variables
├── middleware.ts              # Route protection
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
└── tsconfig.json              # TypeScript config
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ installed
- Yarn package manager
- Backend API running at `http://localhost:3000/api`

### Installation

1. **Install dependencies:**
```bash
yarn install
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Run development server:**
```bash
yarn dev
```

The application will start at `http://localhost:3001`

### Build for Production

```bash
yarn build
yarn start
```

## 🔐 Authentication

### Login Credentials
Use your backend credentials to log in. The application stores JWT tokens in both localStorage and cookies for route protection.

### Token Management
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh on 401 responses
- Token refresh queue prevents concurrent refresh calls

## 📱 Pages & Routes

### Public Routes
- `/login` - User login
- `/register` - User registration

### Protected Routes (Require Authentication)
- `/dashboard` - Dashboard home
- `/dashboard/invoices` - Invoices list
- `/dashboard/invoices/canceled` - Canceled invoices
- `/dashboard/profile` - User profile

### Admin Only Routes
- `/dashboard/administrator/users` - Users management
- `/dashboard/administrator/buyers` - Buyers management
- `/dashboard/administrator/sellers` - Sellers management
- `/dashboard/settings` - Application settings

## 🎨 Theme

The application supports both light and dark themes:
- Toggle using the sun/moon icon in the header
- Theme preference is persisted in localStorage
- Applies to all UI components automatically

## 🔧 Configuration

### API Endpoints
All API endpoints are configured in `.env.local`. The default backend URL is:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API base URL

## 📊 Features by Role

### Admin
- Full access to all features
- User management
- Settings configuration
- System logs access

### Operator
- Invoice management (create, edit, delete, cancel)
- Buyer and seller management
- Dashboard access
- Profile management

### Viewer
- View-only access to invoices and dashboard
- Cannot create, edit, or delete
- Profile management

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Register new user
- [ ] Navigate all pages
- [ ] Create new invoice
- [ ] Edit existing invoice
- [ ] Cancel invoice
- [ ] Download invoice PDF
- [ ] Manage buyers/sellers
- [ ] Change user profile
- [ ] Toggle dark/light theme
- [ ] Test on mobile device
- [ ] Test responsive layouts

## 🐛 Troubleshooting

### Common Issues

**1. Cannot connect to backend**
- Verify backend is running at `http://localhost:3000`
- Check `.env.local` has correct API URL
- Check browser console for CORS errors

**2. Authentication not persisting**
- Clear browser localStorage
- Check cookies are enabled
- Verify tokens are being stored

**3. Styles not loading**
- Run `yarn dev` to rebuild
- Check `globals.css` is imported in `app/layout.tsx`
- Verify Tailwind is configured correctly

**4. TypeScript errors**
- Run `yarn install` to ensure all dependencies are installed
- Check `tsconfig.json` paths are correct

## 📚 Documentation

### Additional Documentation
- `/lib/README.md` - API services and stores documentation
- `/components/ui/README.md` - UI components documentation
- Backend API documentation available in backend repository

## 🤝 Contributing

1. Ensure all TypeScript types are properly defined
2. Follow existing code structure and naming conventions
3. Test all features before committing
4. Maintain responsive design for all components

## 📄 License

This project is part of the Invoice Platform system.

## 🔗 Related Projects

- **Backend:** Invoice Platform Backend (NestJS)
- **Database:** MySQL 8+

## 📞 Support

For issues or questions:
1. Check this README
2. Review backend API documentation
3. Check browser console for errors
4. Verify backend is running and accessible

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS**
