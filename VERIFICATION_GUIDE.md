# Verification Guide

This guide helps you verify that your Quote Calculator project is correctly set up and all components are working properly.

## Table of Contents

1. [Quick Verification Checklist](#quick-verification-checklist)
2. [File Structure Verification](#file-structure-verification)
3. [Environment Setup Verification](#environment-setup-verification)
4. [Database Verification](#database-verification)
5. [Backend Verification](#backend-verification)
6. [Frontend Verification](#frontend-verification)
7. [Authentication Flow Verification](#authentication-flow-verification)
8. [Common Issues and Solutions](#common-issues-and-solutions)

---

## Quick Verification Checklist

Use this checklist for a quick verification of your setup:

- [ ] All files from COMPLETE_PROJECT_STRUCTURE.md exist
- [ ] Backend .env file created and configured
- [ ] Frontend .env file exists
- [ ] Database is running and accessible
- [ ] Prisma migrations are applied
- [ ] Backend server starts without errors
- [ ] Frontend dev server starts without errors
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Protected routes are working
- [ ] Logout functionality works

---

## File Structure Verification

### Check All Auth Files Exist

Run these commands from the project root:

```bash
# Backend auth files
ls -la backend/src/features/auth/auth.controller.ts
ls -la backend/src/features/auth/auth.middleware.ts
ls -la backend/src/features/auth/auth.routes.ts
ls -la backend/src/features/auth/auth.service.ts
ls -la backend/src/features/auth/auth.validation.ts
ls -la backend/src/features/auth/index.ts

# Frontend auth files
ls -la frontend/src/features/auth/components/Login.tsx
ls -la frontend/src/features/auth/components/Register.tsx
ls -la frontend/src/features/auth/components/ProtectedRoute.tsx
ls -la frontend/src/features/auth/auth.types.ts
ls -la frontend/src/features/auth/index.ts
ls -la frontend/src/hooks/useAuth.tsx
ls -la frontend/src/lib/api.ts
```

**Expected:** All files should exist and return their file information.

### Verify Configuration Files

```bash
# Backend
ls -la backend/tsconfig.json
ls -la backend/prisma/schema.prisma
ls -la backend/.env.example

# Frontend
ls -la frontend/vite.config.ts
ls -la frontend/tsconfig.json
ls -la frontend/.env
```

**Expected:** All configuration files should exist.

---

## Environment Setup Verification

### Backend Environment Variables

1. **Check if .env exists:**
   ```bash
   ls -la backend/.env
   ```

2. **If not, create from example:**
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Required variables:**
   Open `backend/.env` and verify these exist:
   - `PORT` (default: 3100)
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_ACCESS_SECRET` (change from default!)
   - `JWT_REFRESH_SECRET` (change from default!)
   - `NODE_ENV` (development/production)

4. **Generate secure JWT secrets for production:**
   ```bash
   node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   ```

### Frontend Environment Variables

1. **Check frontend/.env:**
   ```bash
   cat frontend/.env
   ```

2. **Should contain:**
   ```bash
   VITE_API_URL=http://localhost:3100/api
   ```

---

## Database Verification

### 1. Check PostgreSQL is Running

```bash
# For Docker
docker ps | grep postgres

# For local PostgreSQL
pg_isready

# Or try connecting
psql -U postgres -h localhost
```

### 2. Verify Database Exists

```bash
cd backend
npx prisma db pull
```

**Expected:** Should connect successfully or show clear error about missing database.

### 3. Check Migrations

```bash
cd backend
npx prisma migrate status
```

**Expected:** Shows applied migrations or prompts to run them.

### 4. Apply Migrations (if needed)

```bash
cd backend
npx prisma migrate dev
```

**Expected:** Migrations apply successfully.

### 5. Verify Tables Exist

```bash
cd backend
npx prisma studio
```

**Expected:** Prisma Studio opens in browser showing User, Quote, and QuoteItem tables.

---

## Backend Verification

### 1. Install Dependencies

```bash
cd backend
npm install
```

**Expected:** All packages install without errors.

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

**Expected:** Prisma client generated successfully.

### 3. Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:3100
📊 Environment: development
🔒 Auth endpoints available at: http://localhost:3100/api/auth
```

### 4. Test Health Endpoint

Open new terminal:
```bash
curl http://localhost:3100/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2025-11-19T..."
}
```

### 5. Test Auth Endpoints

**Register endpoint:**
```bash
curl -X POST http://localhost:3100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User"
    }
  }
}
```

**Login endpoint:**
```bash
curl -X POST http://localhost:3100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

**Expected:** Same response structure as register.

---

## Frontend Verification

### 1. Install Dependencies

```bash
cd frontend
npm install
```

**Expected:** All packages install without errors.

### 2. Start Frontend Dev Server

```bash
npm run dev
```

**Expected Output:**
```
VITE v7.2.2  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Open Browser

Navigate to: http://localhost:5173

**Expected:** See the application with routing working.

### 4. Check Console for Errors

Open browser DevTools (F12) and check Console tab.

**Expected:** No errors (warnings are okay).

### 5. Verify API Proxy

In DevTools Network tab, watch for API requests going to `/api/*`.

**Expected:** Requests should be proxied to `http://localhost:3100/api/*`.

---

## Authentication Flow Verification

### 1. Register New User

1. Navigate to http://localhost:5173/register
2. Fill out form:
   - Name: Test User
   - Email: test2@example.com
   - Password: Test1234
   - Confirm Password: Test1234
3. Click "Create Account"

**Expected:**
- Success toast notification appears
- Redirected to home page (/)
- User name appears in navbar
- localStorage contains: `accessToken`, `refreshToken`, `user`

**Check localStorage:**
Open DevTools > Application > Local Storage > http://localhost:5173
- `accessToken` - should be a JWT string
- `refreshToken` - should be a JWT string
- `user` - should be JSON with id, email, name

### 2. Logout

1. Click "Logout" button in navbar

**Expected:**
- Success toast notification
- Redirected to /login
- localStorage cleared of auth data

### 3. Login

1. Navigate to http://localhost:5173/login
2. Enter credentials:
   - Email: test2@example.com
   - Password: Test1234
3. Click "Sign In"

**Expected:**
- Success toast notification
- Redirected to home page (/)
- User name appears in navbar
- localStorage populated with tokens

### 4. Protected Route Test

1. While logged in, note the current page
2. Open DevTools > Application > Local Storage
3. Delete the `accessToken` key
4. Try to navigate to / (home page)

**Expected:**
- Redirected to /login
- "Please login to continue" or similar message

### 5. Token Verification

1. Login successfully
2. Open DevTools > Network tab
3. Navigate around the app
4. Check any API requests

**Expected:**
- All API requests include header: `Authorization: Bearer <token>`
- Requests succeed with 200 status

### 6. Invalid Token Test

1. Login successfully
2. Open DevTools > Application > Local Storage
3. Change `accessToken` to invalid value: "invalid_token"
4. Try to access a protected resource

**Expected:**
- 401 Unauthorized response
- Redirected to login
- localStorage cleared

---

## Common Issues and Solutions

### Issue: Backend won't start

**Error:** `Error: Cannot find module '@prisma/client'`

**Solution:**
```bash
cd backend
npm run prisma:generate
```

---

**Error:** `DATABASE_URL is not defined`

**Solution:**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

---

**Error:** `Port 3100 is already in use`

**Solution:**
```bash
# Kill process on port 3100
lsof -ti:3100 | xargs kill -9

# Or change PORT in backend/.env
```

---

### Issue: Frontend won't start

**Error:** `Cannot find module '@/...'`

**Solution:**
Verify `vite.config.ts` has path alias configured:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

---

**Error:** API requests failing with 404

**Solution:**
1. Check backend is running on port 3100
2. Verify `frontend/.env` has correct API URL:
   ```bash
   VITE_API_URL=http://localhost:3100/api
   ```
3. Restart frontend dev server after changing .env

---

### Issue: Database connection fails

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
1. Verify PostgreSQL is running
2. Check connection string in `backend/.env`
3. Test connection:
   ```bash
   psql -U postgres -h localhost
   ```

---

**Error:** `P3009: migrate found failed migrations`

**Solution:**
```bash
cd backend
npx prisma migrate reset  # WARNING: Deletes all data!
npx prisma migrate dev
```

---

### Issue: Authentication not working

**Problem:** Login succeeds but can't access protected routes

**Solution:**
1. Check browser localStorage has `accessToken` (not `token`)
2. Verify `frontend/src/lib/api.ts` line 16:
   ```typescript
   const token = localStorage.getItem('accessToken');  // NOT 'token'
   ```
3. Check browser DevTools > Network > Request Headers:
   ```
   Authorization: Bearer <token>
   ```

---

**Problem:** Register/Login returns 400 or validation error

**Solution:**
1. Check password meets requirements:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
2. Check email is valid format
3. Check email isn't already registered

---

**Problem:** Tokens not being stored

**Solution:**
1. Open DevTools Console for errors
2. Check `frontend/src/hooks/useAuth.tsx` lines 51-53:
   ```typescript
   localStorage.setItem('accessToken', accessToken)
   localStorage.setItem('refreshToken', refreshToken)
   localStorage.setItem('user', JSON.stringify(user))
   ```
3. Verify no errors in console when storing

---

### Issue: Git tracking .env files

**Problem:** Frontend .env is tracked by git

**Solution:**
```bash
# Add .env to gitignore
echo ".env" >> frontend/.gitignore

# Remove from git tracking
git rm --cached frontend/.env

# Commit the change
git add frontend/.gitignore
git commit -m "fix: Stop tracking .env file"
```

---

## Verification Complete

If all checks pass, your project is properly set up!

**Next Steps:**
- See `AI_CODING_RULES.md` for development best practices
- See `ADD_FEATURE_GUIDE.md` to start adding features

---

**Last Updated:** 2025-11-19
