# Backend Integration Fix

## Issue: API Not Found Error

The frontend is correctly configured but there may be a response structure mismatch between frontend expectations and backend response.

## Current Frontend Expectations

### Auth Store (lib/stores/authStore.ts line 45-47)
```typescript
const response = await authService.login(credentials);
const { accessToken, refreshToken, user } = response.data;
```

**Expected Response Structure:**
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "123",
      "email": "user@example.com",
      "fullName": "User Name",
      "role": "ADMIN"
    }
  }
}
```

## Possible Backend Response Structures

### Option 1: Nested data property (current frontend expectation)
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {...}
  },
  "message": "Login successful"
}
```

### Option 2: Flat structure (common NestJS default)
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {...}
}
```

### Option 3: Different property names
```json
{
  "access_token": "...",  // snake_case instead of camelCase
  "refresh_token": "...",
  "user": {...}
}
```

## Fix Instructions

### Step 1: Check Your Backend Response

Run this command to see actual backend response:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
```

Replace YOUR_EMAIL and YOUR_PASSWORD with actual credentials from your database.

### Step 2: Update Frontend Based on Backend Response

#### If Backend Returns Flat Structure (Option 2):

**Edit:** `lib/stores/authStore.ts` line 45-47

**Change FROM:**
```typescript
const response = await authService.login(credentials);
const { accessToken, refreshToken, user } = response.data;
```

**Change TO:**
```typescript
const response = await authService.login(credentials);
const { accessToken, refreshToken, user } = response; // Remove .data
```

#### If Backend Uses snake_case (Option 3):

**Edit:** `lib/stores/authStore.ts` line 45-47

**Change FROM:**
```typescript
const { accessToken, refreshToken, user } = response.data;
```

**Change TO:**
```typescript
const { access_token, refresh_token, user } = response.data;
const accessToken = access_token;
const refreshToken = refresh_token;
```

### Step 3: Update Auth Service Response Type

**Edit:** `lib/api/auth.service.ts` line 8-10

**Current:**
```typescript
login: async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}
```

**If backend returns flat structure, change to:**
```typescript
login: async (data: LoginFormData): Promise<any> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data; // This is the axios response.data, which contains your backend response
}
```

## Quick Test Script

Create a test file `test-login.js`:

```javascript
const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'your@email.com',  // Replace with real email
      password: 'yourpassword'   // Replace with real password
    });

    console.log('Full Response:');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\nDirect properties:');
    console.log('accessToken:', response.data.accessToken);
    console.log('refreshToken:', response.data.refreshToken);
    console.log('user:', response.data.user);

    console.log('\nNested data properties:');
    console.log('data.accessToken:', response.data.data?.accessToken);
    console.log('data.refreshToken:', response.data.data?.refreshToken);
    console.log('data.user:', response.data.data?.user);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testLogin();
```

Run: `node test-login.js`

## Common Backend Response Formats

### NestJS with @nestjs/jwt (Default)
```json
{
  "accessToken": "...",
  "user": {...}
}
```

### NestJS with Custom Response Wrapper
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "user": {...}
  }
}
```

### NestJS with Swagger/DTO
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {...}
}
```

## Testing Checklist

- [ ] Backend responds successfully to curl/Postman
- [ ] Response structure identified
- [ ] Frontend auth store updated to match backend response
- [ ] Auth service types updated
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Login test from UI works

## If Still Not Working

1. **Enable browser DevTools Network tab**
2. **Try login from frontend**
3. **Check the actual request:**
   - URL should be: `http://localhost:3000/api/auth/login`
   - Method should be: POST
   - Headers should include: `Content-Type: application/json`
   - Body should have: `{"email":"...","password":"..."}`

4. **Check the response:**
   - Status code (200, 401, 404, etc.)
   - Response body structure
   - Any CORS errors

5. **Compare with Swagger:**
   - Go to your backend Swagger UI
   - Find the `/auth/login` endpoint
   - Check the response schema
   - Match frontend expectations to that schema

## Example Fix

If your backend returns:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "1",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

Then update `lib/stores/authStore.ts` line 42-72:

```typescript
login: async (credentials: LoginFormData) => {
  set({ isLoading: true, error: null });
  try {
    const response = await authService.login(credentials);

    // Backend returns flat structure, not nested in .data
    const { accessToken, refreshToken, user } = response;  // Changed from response.data

    // Rest remains the same
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  } catch (error: any) {
    set({
      error: error.message || 'Login failed',
      isLoading: false,
      isAuthenticated: false,
    });
    throw error;
  }
}
```

## Need Help?

Share the output of this command:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}' \
  -v
```

Replace with real credentials and share the response structure.
