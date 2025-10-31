# Invoice Platform Frontend - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ Yarn package manager installed
- ✅ Backend API running at `http://localhost:3000`

### Step 1: Navigate to Project
```bash
cd /Users/shakoabramishvili/Documents/ClaudeMCP/invoice-platform-frontend
```

### Step 2: Install Dependencies (if not already done)
```bash
yarn install
```

### Step 3: Configure Environment
The `.env.local` file is already configured with:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 4: Start Development Server
```bash
yarn dev
```

The application will start at: **http://localhost:3001**

### Step 5: Login
1. Open browser: `http://localhost:3001`
2. You'll be redirected to `/login`
3. Login with your backend credentials

---

## 📱 What You'll See

### Login Page
- Beautiful split-screen design
- Gradient background (blue → indigo → purple)
- Email and password inputs
- Remember me checkbox
- Link to register

### After Login - Dashboard
- **Header:** Logo, theme toggle, user menu
- **Sidebar:** Navigation menu (collapsible)
- **KPI Cards:** Total/Paid/Pending/Canceled Invoices, Revenue
- **Charts:** Revenue over time, Status distribution
- **Recent Invoices Table**
- **Activity Feed**

### Available Pages
- `/dashboard` - Main dashboard
- `/dashboard/invoices` - Invoices list and management
- `/dashboard/invoices/canceled` - Canceled invoices
- `/dashboard/administrator/users` - Users management (Admin)
- `/dashboard/administrator/buyers` - Buyers management
- `/dashboard/administrator/sellers` - Sellers management
- `/dashboard/profile` - User profile
- `/dashboard/settings` - Application settings (Admin)

---

## 🎨 Features to Try

### 1. Theme Toggle
Click the **sun/moon icon** in the header to switch between light and dark mode.

### 2. Create an Invoice
1. Go to **Invoices** page
2. Click **Create Invoice** button
3. Fill in the form:
   - Basic info (date, number, currency)
   - Select buyer and seller
   - Add products (at least one required)
   - Set discount (optional)
   - Add currency conversion (optional)
4. Click **Create Invoice**

### 3. Manage Buyers/Sellers
1. Navigate to **Administrator → Buyers** or **Sellers**
2. Click **Add Buyer/Seller**
3. Fill in the form with country selection
4. Save

### 4. Update Your Profile
1. Click your avatar in the header
2. Select **Profile**
3. Upload profile picture
4. Update contact info
5. Change password (with strength indicator)

### 5. Explore Settings (Admin Only)
1. Navigate to **Settings**
2. Explore 5 tabs:
   - General (company info)
   - User Management (roles & permissions)
   - Invoice Settings (templates, numbering)
   - Notifications (email config)
   - System Logs (login history, activity)

---

## 🔧 Common Commands

### Development
```bash
yarn dev          # Start dev server on port 3001
```

### Production
```bash
yarn build        # Build for production
yarn start        # Start production server
```

### Linting
```bash
yarn lint         # Run ESLint
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
1. Verify backend is running: `http://localhost:3000/api`
2. Check `.env.local` has correct API URL
3. Check browser console for errors

### Issue: "Page not loading"
**Solution:**
1. Stop server (Ctrl+C)
2. Run `yarn dev` again
3. Clear browser cache

### Issue: "Login not working"
**Solution:**
1. Verify backend is running
2. Check backend credentials are correct
3. Check browser console for API errors
4. Verify backend CORS allows `http://localhost:3001`

### Issue: "Styles not loading"
**Solution:**
1. Stop server
2. Delete `.next` folder: `rm -rf .next`
3. Run `yarn dev` again

---

## 📊 Sample Workflow

### Create Your First Invoice
1. **Start servers:**
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:3001`

2. **Login to frontend**

3. **Add a Buyer:**
   - Go to Administrator → Buyers
   - Click "Add Buyer"
   - Fill: Name, Contact, Email, Phone, Country, Tax ID
   - Save

4. **Add a Seller:**
   - Go to Administrator → Sellers
   - Click "Add Seller"
   - Fill basic info + bank details
   - Save

5. **Create Invoice:**
   - Go to Invoices
   - Click "Create Invoice"
   - Set date and currency
   - Select buyer and seller
   - Add at least one product
   - Set quantity and price (total auto-calculates)
   - Add discount if needed
   - Click "Create Invoice"

6. **View Invoice:**
   - Invoice appears in table
   - Click invoice number to view details
   - Download PDF
   - Edit or Cancel if needed

---

## 🎯 Testing Checklist

Quick tests to verify everything works:

- [ ] Login with valid credentials
- [ ] Dashboard loads with KPIs and charts
- [ ] Toggle theme (light/dark)
- [ ] Sidebar collapses and expands
- [ ] Create a buyer
- [ ] Create a seller
- [ ] Create an invoice
- [ ] View invoice details
- [ ] Edit an invoice
- [ ] Download invoice PDF
- [ ] Cancel an invoice
- [ ] View canceled invoices
- [ ] Update profile
- [ ] Change password
- [ ] Logout

---

## 📁 Project Structure Quick Reference

```
invoice-platform-frontend/
├── app/                    # Pages
│   ├── dashboard/         # All dashboard pages
│   ├── login/            # Login page
│   └── register/         # Register page
├── components/            # React components
│   ├── ui/               # UI component library
│   ├── Header.tsx        # Top navigation
│   ├── Sidebar.tsx       # Side navigation
│   └── *.tsx             # Feature components
├── lib/                   # Core logic
│   ├── api/              # API services
│   ├── stores/           # State management
│   └── utils.ts          # Utility functions
├── types/                 # TypeScript types
└── .env.local            # Environment config
```

---

## 🔐 Default Roles

### Admin
- Full access to all features
- Can manage users, settings
- Can view system logs

### Operator
- Can create/edit/delete invoices
- Can manage buyers and sellers
- Can view dashboard
- Cannot access settings or user management

### Viewer
- Read-only access
- Can view dashboard and invoices
- Cannot create, edit, or delete

---

## 📞 Need Help?

1. **Check README.md** - Comprehensive documentation
2. **Check IMPLEMENTATION_COMPLETE.md** - Full feature list
3. **Check browser console** - For JavaScript errors
4. **Check network tab** - For API errors
5. **Verify backend is running** - Most common issue

---

## 🎉 You're Ready!

The Invoice Platform Frontend is fully functional and ready to use. Enjoy managing your invoices! 🚀

**Access your app at:** http://localhost:3001
