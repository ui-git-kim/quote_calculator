# Complete Project Structure

**Project Name:** Quote Calculator
**Type:** Modular React + TypeScript + Express Starter Template
**Authentication:** JWT (Access + Refresh Tokens)
**Last Verified:** 2025-11-19

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Technology Stack](#technology-stack)
4. [Authentication System](#authentication-system)
5. [Database Schema](#database-schema)
6. [Configuration Files](#configuration-files)
7. [Environment Variables](#environment-variables)

---

## Overview

This is a production-ready, modular full-stack application template with:
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + DaisyUI
- **Backend:** Express 5 + TypeScript + Prisma ORM + PostgreSQL
- **Authentication:** Complete JWT implementation with access & refresh tokens
- **Features:** User registration, login, protected routes, token refresh

---

## Directory Structure

```
/home/user/quote_calculator/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   ├── 20251119024029_init/
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   └── schema.prisma              # Database schema (User, Quote, QuoteItem)
│   ├── src/
│   │   ├── features/
│   │   │   └── auth/
│   │   │       ├── auth.controller.ts # HTTP handlers (register, login, refresh, etc.)
│   │   │       ├── auth.middleware.ts # JWT verification middleware
│   │   │       ├── auth.routes.ts     # Auth route definitions
│   │   │       ├── auth.service.ts    # Business logic (token generation, etc.)
│   │   │       ├── auth.validation.ts # Zod validation schemas
│   │   │       └── index.ts           # Barrel exports
│   │   └── server.ts                  # Express app entry point
│   ├── .env.example                   # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma.config.ts
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── features/
    │   │   └── auth/
    │   │       ├── components/
    │   │       │   ├── Login.tsx           # Login form component
    │   │       │   ├── ProtectedRoute.tsx  # Route wrapper for auth
    │   │       │   └── Register.tsx        # Registration form component
    │   │       ├── auth.types.ts           # TypeScript type definitions
    │   │       └── index.ts                # Barrel exports
    │   ├── hooks/
    │   │   └── useAuth.tsx                 # Auth context & hook
    │   ├── lib/
    │   │   ├── api.ts                      # Axios instance with interceptors
    │   │   └── utils.ts                    # Utility functions
    │   ├── App.tsx                         # Main app component with routing
    │   ├── index.css                       # Global styles
    │   └── main.tsx                        # React entry point
    ├── .env                                # Environment variables (local)
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```

---

## Technology Stack

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.0 | UI library |
| react-router-dom | 7.9.6 | Client-side routing |
| axios | 1.13.2 | HTTP client |
| zod | 4.1.12 | Schema validation |
| tailwindcss | 4.1.17 | Utility-first CSS |
| daisyui | 5.5.5 | Component library |
| @phosphor-icons/react | 2.1.10 | Icon library |
| sonner | 2.0.7 | Toast notifications |
| react-hook-form | 7.66.1 | Form management |

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.1.0 | Web framework |
| @prisma/client | 6.19.0 | Database ORM |
| jsonwebtoken | 9.0.2 | JWT implementation |
| bcryptjs | 3.0.3 | Password hashing |
| zod | 4.1.12 | Schema validation |
| helmet | 8.1.0 | Security headers |
| cors | 2.8.5 | CORS middleware |
| compression | 1.8.1 | Response compression |
| winston | 3.18.3 | Logging |

---

## Authentication System

### Backend Architecture

#### File: `backend/src/features/auth/auth.service.ts`

**Key Features:**
- Password hashing using bcryptjs (10 salt rounds)
- JWT token generation (access + refresh)
- Token expiration:
  - Access Token: 15 minutes
  - Refresh Token: 7 days
- User registration with duplicate email check
- Secure login with password verification
- Token refresh mechanism

**Methods:**
- `register(data)` - Create new user account
- `login(data)` - Authenticate user
- `refreshAccessToken(refreshToken)` - Renew access token
- `verifyAccessToken(token)` - Validate JWT
- `getUserById(userId)` - Fetch user data

#### File: `backend/src/features/auth/auth.middleware.ts`

**Middleware Functions:**
- `authMiddleware` - Protects routes, requires valid JWT
- `optionalAuthMiddleware` - Checks auth but doesn't fail if missing

**Process:**
1. Extract token from `Authorization: Bearer <token>` header
2. Verify token using JWT secret
3. Attach user data to `req.user`
4. Continue to next handler or return 401

#### File: `backend/src/features/auth/auth.routes.ts`

**Endpoints:**

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/me` | Private | Get current user |
| POST | `/api/auth/logout` | Private | Logout user |

#### File: `backend/src/features/auth/auth.validation.ts`

**Validation Rules:**
- Email: Valid email format, required
- Password: Minimum 8 characters, requires uppercase, lowercase, and number
- Name: String, optional

### Frontend Architecture

#### File: `frontend/src/hooks/useAuth.tsx`

**AuthProvider Context:**
- Manages global auth state
- Stores tokens in localStorage:
  - `accessToken` - Short-lived token for API requests
  - `refreshToken` - Long-lived token for renewal
  - `user` - User data (id, email, name)

**Functions:**
- `register(data)` - Register new account
- `login(data)` - Login user
- `logout()` - Clear auth state and redirect

**Features:**
- Toast notifications for user feedback
- Automatic navigation after auth actions
- Error handling with user-friendly messages

#### File: `frontend/src/lib/api.ts`

**Axios Configuration:**
- Base URL from environment variable
- Request interceptor: Adds `Authorization: Bearer <token>` header
- Response interceptor: Handles 401 errors, clears auth, redirects to login

#### File: `frontend/src/features/auth/components/ProtectedRoute.tsx`

**Route Protection:**
- Checks if user is authenticated
- Shows loading spinner during auth check
- Redirects to `/login` if not authenticated
- Renders protected content if authenticated

### Authentication Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Register/Login
       ▼
┌─────────────────────────────┐
│   Frontend (useAuth hook)   │
│   - Validates input         │
│   - Makes API request       │
└──────────┬──────────────────┘
           │
           │ 2. POST /api/auth/register or /login
           ▼
┌─────────────────────────────┐
│   Backend (auth.service)    │
│   - Hash password (bcrypt)  │
│   - Create/verify user      │
│   - Generate JWT tokens     │
└──────────┬──────────────────┘
           │
           │ 3. Return tokens + user data
           ▼
┌─────────────────────────────┐
│   Frontend (useAuth hook)   │
│   - Store in localStorage   │
│   - Update context state    │
│   - Navigate to dashboard   │
└──────────┬──────────────────┘
           │
           │ 4. Protected API request
           ▼
┌─────────────────────────────┐
│   Frontend (api.ts)         │
│   - Add Authorization header│
└──────────┬──────────────────┘
           │
           │ 5. Request + Bearer token
           ▼
┌─────────────────────────────┐
│   Backend (auth.middleware) │
│   - Verify JWT              │
│   - Attach user to request  │
└──────────┬──────────────────┘
           │
           │ 6. Continue to route handler
           ▼
┌─────────────────────────────┐
│   Route Handler             │
│   - Access req.user         │
│   - Process request         │
└─────────────────────────────┘
```

---

## Database Schema

**File:** `backend/prisma/schema.prisma`

### Models

#### User
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  quotes    Quote[]
}
```

**Relationships:** One-to-many with Quote

#### Quote
```prisma
model Quote {
  id          String   @id @default(uuid())
  clientName  String
  clientEmail String?
  items       QuoteItem[]
  subtotal    Float
  tax         Float?
  total       Float
  status      String   @default("draft") // draft, sent, accepted, rejected
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Relationships:**
- Belongs to User
- One-to-many with QuoteItem

#### QuoteItem
```prisma
model QuoteItem {
  id          String  @id @default(uuid())
  description String
  quantity    Int
  rate        Float
  amount      Float
  quoteId     String
  quote       Quote   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
}
```

**Relationships:** Belongs to Quote (cascading delete)

---

## Configuration Files

### Frontend

#### `vite.config.ts`
- React + SWC plugin for fast refresh
- Tailwind CSS v4 plugin
- Path alias: `@` → `./src`
- Dev server on port 5173
- Proxy `/api` requests to `http://localhost:3100`

#### `tsconfig.app.json`
- Target: ES2022
- JSX: react-jsx
- Strict TypeScript settings
- Path alias: `@/*` → `./src/*`

#### `eslint.config.js`
- ESLint with TypeScript support
- React hooks plugin
- React refresh plugin

### Backend

#### `tsconfig.json`
- Target: ES2020
- Module: commonjs
- Output directory: `./dist`
- Path alias: `@/*` → `src/*`

#### `prisma/schema.prisma`
- PostgreSQL datasource
- Prisma client generator
- Database models (User, Quote, QuoteItem)

---

## Environment Variables

### Frontend `.env`

```bash
VITE_API_URL=http://localhost:3100/api
```

**Usage:** API base URL for Axios

### Backend `.env` (Create from `.env.example`)

```bash
# Server
PORT=3100
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/quote_calculator"

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_ACCESS_SECRET=your-super-secret-access-token
JWT_REFRESH_SECRET=your-super-secret-refresh-token

# Logging
LOG_LEVEL=info
```

**Important:**
- Create your own `.env` from `.env.example`
- Generate strong secrets for production using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Never commit `.env` files to git

---

## Scripts

### Frontend

```bash
npm run dev       # Start Vite dev server (port 5173)
npm run build     # Build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

### Backend

```bash
npm run dev              # Start dev server with nodemon
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

---

## Getting Started

1. **Install dependencies:**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Set up backend environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials and JWT secrets
   ```

3. **Set up database:**
   ```bash
   npm run prisma:migrate
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3100
   - API Health: http://localhost:3100/api/health

---

## Next Steps

- See `VERIFICATION_GUIDE.md` to verify your setup
- See `AI_CODING_RULES.md` for development best practices
- See `ADD_FEATURE_GUIDE.md` to add new features

---

**Documentation Version:** 1.0
**Last Updated:** 2025-11-19
