# API Connection Guide - Invoice Platform Frontend

## ✅ Backend Connection Verified

The backend is running correctly at: `http://localhost:3000/api/auth/login`

### Test Results
```bash
# ✅ This works (with /api prefix):
curl -X POST http://localhost:3000/api/auth/login

# ❌ This doesn't work (without /api prefix):
curl -X POST http://localhost:3000/auth/login
```

**Conclusion:** Your backend requires the `/api` prefix, which is correctly configured in the frontend.

---

## 🔧 Frontend Configuration

### Environment Variable
File: `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### API Client Configuration
File: `lib/api/client.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

### Auth Service
File: `lib/api/auth.service.ts`
```typescript
// Makes POST request to: {baseURL}/auth/login
// Full URL: http://localhost:3000/api/auth/login
login: async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}
```

**Result:** Frontend requests go to `http://localhost:3000/api/auth/login` ✅

---

## 🐛 If You're Still Seeing 404 Errors

### Issue: Environment Variable Not Loading

**Symptom:** Getting 404 errors even though backend is running

**Cause:** Next.js might not have picked up the `.env.local` file

**Solution:**

1. **Stop the dev server** (Ctrl+C)

2. **Verify .env.local exists and is correct:**
```bash
cat .env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Restart dev server:**
```bash
yarn dev
```

4. **Check in browser console:**
```javascript
// Open browser console and check:
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: http://localhost:3000/api
```

---

## 🔍 Debugging Steps

### Step 1: Verify Backend is Running
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**Expected:** Some response (even if error, it means backend is running)

### Step 2: Check Frontend Environment
```bash
# In project root
cat .env.local
```

**Expected:** `NEXT_PUBLIC_API_URL=http://localhost:3000/api`

### Step 3: Check Browser Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the request URL

**Expected URL:** `http://localhost:3000/api/auth/login`
**If you see:** `http://localhost:3000/auth/login` (missing /api)
**Then:** Environment variable not loaded, restart dev server

### Step 4: Check CORS
If request reaches backend but fails:

**Symptoms:**
- CORS error in browser console
- Request shows as "(failed)" in Network tab

**Solution:** Backend needs CORS configuration:
```typescript
// In your NestJS backend main.ts
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});
```

---

## 📋 Complete Checklist

Before testing login:

- [ ] Backend running at `http://localhost:3000`
- [ ] Can curl backend: `curl http://localhost:3000/api/auth/login`
- [ ] `.env.local` exists with correct API URL
- [ ] Frontend dev server restarted after .env changes
- [ ] Browser cache cleared (or use incognito mode)
- [ ] Backend CORS allows `http://localhost:3001`

---

## 🔐 Test Login Request

### Expected Request
**URL:** `POST http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

### Expected Responses

**Success (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "123",
      "email": "your@email.com",
      "fullName": "Your Name",
      "role": "ADMIN"
    }
  },
  "message": "Login successful"
}
```

**Invalid Credentials (401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

**Validation Error (400):**
```json
{
  "message": ["email must be an email"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 🚨 Common Issues

### Issue 1: "Cannot GET /api/auth/login"

**Cause:** Request is using GET instead of POST

**Solution:** Frontend correctly uses POST. If you see GET, check:
- Browser trying to navigate instead of fetch
- Typo in code making GET request

### Issue 2: "Cannot POST /auth/login" (without /api)

**Cause:** Environment variable not loaded

**Solution:**
```bash
# Stop dev server
# Verify .env.local
cat .env.local
# Restart
yarn dev
```

### Issue 3: CORS Error

**Cause:** Backend not configured for frontend origin

**Solution in Backend:**
```typescript
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Issue 4: Network Error / Connection Refused

**Cause:** Backend not running

**Solution:**
```bash
# Check if backend is running
curl http://localhost:3000/api/auth/login

# If not running, start your backend
cd path/to/backend
npm run start:dev  # or yarn start:dev
```

---

## ✅ Verification Script

Run this to verify everything:

```bash
#!/bin/bash

echo "=== Backend Check ==="
curl -s http://localhost:3000/api/auth/login | head -c 100
echo ""
echo ""

echo "=== Environment Check ==="
cat .env.local
echo ""

echo "=== Frontend API Client ==="
head -5 lib/api/client.ts
echo ""

echo "✅ If you see:"
echo "  1. Backend returns JSON (even error) = Backend running"
echo "  2. .env.local shows correct URL = Environment configured"
echo "  3. API client uses NEXT_PUBLIC_API_URL = Frontend configured"
echo ""
echo "Then restart dev server: yarn dev"
```

---

## 🎯 Quick Fix

If nothing else works:

1. **Hard Reset:**
```bash
# Stop dev server
# Clear Next.js cache
rm -rf .next

# Verify environment
cat .env.local

# Restart
yarn dev
```

2. **Test in Browser Console:**
```javascript
// After page loads, test API directly
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 📞 Still Not Working?

Check these in order:

1. **Backend logs** - See what backend receives
2. **Browser console** - Check for JavaScript errors
3. **Network tab** - See exact request being made
4. **Backend CORS** - Ensure allows localhost:3001
5. **Firewall** - Ensure ports 3000 and 3001 are open

---

## ✅ Success Indicators

You'll know it's working when:

- ✅ Network tab shows request to `http://localhost:3000/api/auth/login`
- ✅ Request method is POST
- ✅ Response is 200 (success) or 401 (wrong password)
- ✅ Response is JSON with tokens
- ✅ No CORS errors in console
- ✅ Tokens stored in localStorage
- ✅ Redirect to dashboard happens

---

**The configuration is correct. If you're seeing errors, follow the debugging steps above!**
