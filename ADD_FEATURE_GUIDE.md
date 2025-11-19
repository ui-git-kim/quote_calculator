# Adding Features Guide

This guide walks you through adding new features to the Quote Calculator project. Follow these patterns to maintain consistency and quality.

## Table of Contents

1. [Feature Planning](#feature-planning)
2. [Backend Feature Implementation](#backend-feature-implementation)
3. [Frontend Feature Implementation](#frontend-feature-implementation)
4. [Database Schema Updates](#database-schema-updates)
5. [Example: Adding Quotes Feature](#example-adding-quotes-feature)
6. [Example: Adding User Profile](#example-adding-user-profile)
7. [Testing Your Feature](#testing-your-feature)
8. [Deployment Checklist](#deployment-checklist)

---

## Feature Planning

Before writing code, plan your feature:

### 1. Define Requirements

**Questions to answer:**
- What problem does this solve?
- What data needs to be stored?
- What API endpoints are needed?
- What UI components are required?
- Who can access this feature? (auth requirements)
- What validations are needed?

### 2. Design Database Schema

**Consider:**
- What new models are needed?
- What relationships exist?
- What fields are required vs optional?
- What indexes are needed for performance?

### 3. Plan API Endpoints

**Document:**
- Endpoint paths
- HTTP methods
- Request body schemas
- Response formats
- Authentication requirements

### 4. Design UI Flow

**Sketch:**
- What pages/views are needed?
- What forms are required?
- What navigation changes are needed?
- What feedback mechanisms (toasts, loading states)?

---

## Backend Feature Implementation

### Step 1: Create Feature Directory

```bash
cd backend/src/features
mkdir [feature-name]
cd [feature-name]
```

### Step 2: Create Feature Files

Create these files in your feature directory:

```bash
touch [feature].types.ts
touch [feature].validation.ts
touch [feature].service.ts
touch [feature].controller.ts
touch [feature].routes.ts
touch index.ts
```

### Step 3: Define TypeScript Types

**File:** `[feature].types.ts`

```typescript
// Example: quotes.types.ts

export interface Quote {
  id: string
  clientName: string
  clientEmail?: string
  subtotal: number
  tax?: number
  total: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  quoteId: string
}

export interface CreateQuoteInput {
  clientName: string
  clientEmail?: string
  items: CreateQuoteItemInput[]
}

export interface CreateQuoteItemInput {
  description: string
  quantity: number
  rate: number
}
```

### Step 4: Create Validation Schemas

**File:** `[feature].validation.ts`

```typescript
// Example: quotes.validation.ts

import { z } from 'zod'

export const createQuoteItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
})

export const createQuoteSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Invalid email').optional(),
  items: z.array(createQuoteItemSchema).min(1, 'At least one item required'),
})

export const updateQuoteSchema = createQuoteSchema.partial()

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>
```

### Step 5: Implement Service (Business Logic)

**File:** `[feature].service.ts`

```typescript
// Example: quotes.service.ts

import { PrismaClient } from '@prisma/client'
import type { CreateQuoteInput, UpdateQuoteInput } from './quotes.validation'

const prisma = new PrismaClient()

export class QuotesService {
  /**
   * Create a new quote with items
   */
  async createQuote(userId: string, data: CreateQuoteInput) {
    // Calculate totals
    const items = data.items.map(item => ({
      ...item,
      amount: item.quantity * item.rate,
    }))

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    // Create quote with items in transaction
    return await prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          subtotal,
          tax,
          total,
          userId,
          items: {
            create: items,
          },
        },
        include: {
          items: true,
        },
      })

      return quote
    })
  }

  /**
   * Get all quotes for a user
   */
  async getQuotesByUser(userId: string) {
    return await prisma.quote.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Get single quote by ID
   */
  async getQuoteById(id: string, userId: string) {
    const quote = await prisma.quote.findFirst({
      where: {
        id,
        userId, // Ensure user owns this quote
      },
      include: {
        items: true,
      },
    })

    if (!quote) {
      throw new Error('Quote not found')
    }

    return quote
  }

  /**
   * Update quote
   */
  async updateQuote(id: string, userId: string, data: UpdateQuoteInput) {
    // Verify ownership
    await this.getQuoteById(id, userId)

    // Recalculate if items changed
    let updateData: any = {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
    }

    if (data.items) {
      const items = data.items.map(item => ({
        ...item,
        amount: item.quantity * item.rate,
      }))

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
      const tax = subtotal * 0.1
      const total = subtotal + tax

      updateData = {
        ...updateData,
        subtotal,
        tax,
        total,
      }
    }

    return await prisma.$transaction(async (tx) => {
      // Delete old items
      if (data.items) {
        await tx.quoteItem.deleteMany({
          where: { quoteId: id },
        })
      }

      // Update quote and create new items
      return await tx.quote.update({
        where: { id },
        data: {
          ...updateData,
          ...(data.items && {
            items: {
              create: data.items.map(item => ({
                ...item,
                amount: item.quantity * item.rate,
              })),
            },
          }),
        },
        include: {
          items: true,
        },
      })
    })
  }

  /**
   * Delete quote
   */
  async deleteQuote(id: string, userId: string) {
    // Verify ownership
    await this.getQuoteById(id, userId)

    await prisma.quote.delete({
      where: { id },
    })
  }
}

export const quotesService = new QuotesService()
```

### Step 6: Implement Controller (HTTP Handlers)

**File:** `[feature].controller.ts`

```typescript
// Example: quotes.controller.ts

import type { Request, Response } from 'express'
import { quotesService } from './quotes.service'
import { createQuoteSchema, updateQuoteSchema } from './quotes.validation'

export class QuotesController {
  async createQuote(req: Request, res: Response): Promise<void> {
    try {
      const validated = createQuoteSchema.parse(req.body)
      const userId = req.user!.userId

      const quote = await quotesService.createQuote(userId, validated)

      res.status(201).json({
        success: true,
        data: quote,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create quote',
      })
    }
  }

  async getQuotes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId
      const quotes = await quotesService.getQuotesByUser(userId)

      res.json({
        success: true,
        data: quotes,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotes',
      })
    }
  }

  async getQuote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.userId

      const quote = await quotesService.getQuoteById(id, userId)

      res.json({
        success: true,
        data: quote,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Quote not found',
      })
    }
  }

  async updateQuote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.userId
      const validated = updateQuoteSchema.parse(req.body)

      const quote = await quotesService.updateQuote(id, userId, validated)

      res.json({
        success: true,
        data: quote,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update quote',
      })
    }
  }

  async deleteQuote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.userId

      await quotesService.deleteQuote(id, userId)

      res.json({
        success: true,
        message: 'Quote deleted successfully',
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete quote',
      })
    }
  }
}

export const quotesController = new QuotesController()
```

### Step 7: Define Routes

**File:** `[feature].routes.ts`

```typescript
// Example: quotes.routes.ts

import { Router } from 'express'
import { quotesController } from './quotes.controller'
import { authMiddleware } from '@/features/auth'

const router = Router()

/**
 * All routes require authentication
 */
router.use(authMiddleware)

/**
 * @route   GET /api/quotes
 * @desc    Get all quotes for current user
 * @access  Private
 */
router.get('/', (req, res) => quotesController.getQuotes(req, res))

/**
 * @route   GET /api/quotes/:id
 * @desc    Get single quote by ID
 * @access  Private
 */
router.get('/:id', (req, res) => quotesController.getQuote(req, res))

/**
 * @route   POST /api/quotes
 * @desc    Create new quote
 * @access  Private
 */
router.post('/', (req, res) => quotesController.createQuote(req, res))

/**
 * @route   PUT /api/quotes/:id
 * @desc    Update quote
 * @access  Private
 */
router.put('/:id', (req, res) => quotesController.updateQuote(req, res))

/**
 * @route   DELETE /api/quotes/:id
 * @desc    Delete quote
 * @access  Private
 */
router.delete('/:id', (req, res) => quotesController.deleteQuote(req, res))

export default router
```

### Step 8: Create Barrel Export

**File:** `index.ts`

```typescript
// Example: index.ts

export { default as quotesRoutes } from './quotes.routes'
export { quotesService } from './quotes.service'
export { quotesController } from './quotes.controller'
export * from './quotes.validation'
export * from './quotes.types'
```

### Step 9: Register Routes in Server

**File:** `backend/src/server.ts`

```typescript
// Add import
import { quotesRoutes } from './features/quotes'

// Register routes
app.use('/api/quotes', quotesRoutes)
```

---

## Frontend Feature Implementation

### Step 1: Create Feature Directory

```bash
cd frontend/src/features
mkdir [feature-name]
cd [feature-name]
mkdir components
```

### Step 2: Create Feature Files

```bash
touch [feature].types.ts
touch index.ts
cd components
touch [Component1].tsx
touch [Component2].tsx
```

### Step 3: Define TypeScript Types

**File:** `[feature].types.ts`

```typescript
// Example: quotes/quotes.types.ts

export interface Quote {
  id: string
  clientName: string
  clientEmail?: string
  subtotal: number
  tax?: number
  total: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  items: QuoteItem[]
  createdAt: string
  updatedAt: string
}

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface CreateQuoteData {
  clientName: string
  clientEmail?: string
  items: CreateQuoteItemData[]
}

export interface CreateQuoteItemData {
  description: string
  quantity: number
  rate: number
}
```

### Step 4: Create Components

**Example: Quote List Component**

**File:** `components/QuotesList.tsx`

```typescript
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Quote } from '../quotes.types'
import { toast } from 'sonner'
import { Plus, FileText } from '@phosphor-icons/react'

export default function QuotesList() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await api.get<{ data: Quote[] }>('/quotes')
      setQuotes(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch quotes')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="loading loading-spinner loading-lg"></div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <button className="btn btn-primary">
          <Plus size={20} />
          New Quote
        </button>
      </div>

      <div className="grid gap-4">
        {quotes.map(quote => (
          <div key={quote.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="card-title">
                    <FileText size={24} weight="duotone" />
                    {quote.clientName}
                  </h2>
                  {quote.clientEmail && (
                    <p className="text-sm text-base-content/70">{quote.clientEmail}</p>
                  )}
                </div>
                <div className="badge badge-primary">{quote.status}</div>
              </div>

              <div className="stats stats-horizontal shadow mt-4">
                <div className="stat">
                  <div className="stat-title">Subtotal</div>
                  <div className="stat-value text-lg">${quote.subtotal.toFixed(2)}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Tax</div>
                  <div className="stat-value text-lg">${(quote.tax || 0).toFixed(2)}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Total</div>
                  <div className="stat-value text-primary">${quote.total.toFixed(2)}</div>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm">View</button>
                <button className="btn btn-sm btn-ghost">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Step 5: Create Barrel Export

**File:** `index.ts`

```typescript
// Example: quotes/index.ts

export { default as QuotesList } from './components/QuotesList'
export { default as CreateQuote } from './components/CreateQuote'
export { default as QuoteDetail } from './components/QuoteDetail'
export * from './quotes.types'
```

### Step 6: Add Routes

**File:** `frontend/src/App.tsx`

```typescript
import { QuotesList, QuoteDetail, CreateQuote } from '@/features/quotes'

// Inside <Routes>
<Route
  path="/quotes"
  element={
    <ProtectedRoute>
      <QuotesList />
    </ProtectedRoute>
  }
/>
<Route
  path="/quotes/new"
  element={
    <ProtectedRoute>
      <CreateQuote />
    </ProtectedRoute>
  }
/>
<Route
  path="/quotes/:id"
  element={
    <ProtectedRoute>
      <QuoteDetail />
    </ProtectedRoute>
  }
/>
```

---

## Database Schema Updates

### Step 1: Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

Add new models or modify existing ones:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  quotes    Quote[]
  // Add new relations here
}

// Add new models
model NewFeature {
  id        String   @id @default(uuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Step 2: Create Migration

```bash
cd backend
npx prisma migrate dev --name add_new_feature
```

### Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

---

## Example: Adding Quotes Feature

See the complete example above in the Backend and Frontend implementation sections.

---

## Example: Adding User Profile

### Backend

**1. Update Prisma Schema:**

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  bio       String?  // New field
  avatar    String?  // New field
  phone     String?  // New field
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  quotes    Quote[]
}
```

**2. Create migration:**

```bash
npx prisma migrate dev --name add_user_profile_fields
```

**3. Add to auth service:**

```typescript
// backend/src/features/auth/auth.service.ts

async updateProfile(userId: string, data: UpdateProfileInput) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      bio: data.bio,
      phone: data.phone,
    },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      phone: true,
    },
  })
}
```

**4. Add controller method:**

```typescript
// backend/src/features/auth/auth.controller.ts

async updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId
    const user = await authService.updateProfile(userId, req.body)

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
    })
  }
}
```

**5. Add route:**

```typescript
// backend/src/features/auth/auth.routes.ts

router.put('/profile', authMiddleware, (req, res) =>
  authController.updateProfile(req, res)
)
```

### Frontend

**1. Create Profile component:**

```typescript
// frontend/src/features/auth/components/Profile.tsx

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.put('/auth/profile', { name, bio, phone })
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Bio</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Phone</span>
            </label>
            <input
              type="tel"
              className="input input-bordered"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
```

**2. Add to exports:**

```typescript
// frontend/src/features/auth/index.ts

export { default as Profile } from './components/Profile'
```

**3. Add route:**

```typescript
// frontend/src/App.tsx

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
```

---

## Testing Your Feature

### Manual Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend builds without TypeScript errors
- [ ] Can create new records
- [ ] Can read/fetch records
- [ ] Can update records
- [ ] Can delete records
- [ ] Validation works (try invalid data)
- [ ] Error messages are user-friendly
- [ ] Loading states show correctly
- [ ] Success messages appear
- [ ] Data persists after refresh
- [ ] Only authenticated users can access (if protected)
- [ ] Users can only access their own data

### API Testing with curl

```bash
# Create
curl -X POST http://localhost:3100/api/quotes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Test Client","items":[{"description":"Service","quantity":1,"rate":100}]}'

# Read all
curl http://localhost:3100/api/quotes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Read one
curl http://localhost:3100/api/quotes/QUOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update
curl -X PUT http://localhost:3100/api/quotes/QUOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Updated Client"}'

# Delete
curl -X DELETE http://localhost:3100/api/quotes/QUOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Deployment Checklist

Before deploying your feature:

- [ ] All TypeScript compiles without errors
- [ ] No console.log statements (use proper logging)
- [ ] Environment variables documented in .env.example
- [ ] Database migrations tested
- [ ] Error handling is comprehensive
- [ ] Input validation is thorough
- [ ] Security considerations addressed
- [ ] API documented (in code comments)
- [ ] Git commits are clear and conventional
- [ ] No sensitive data in code or commits
- [ ] Feature tested in production-like environment

---

## Tips for Success

1. **Start Small:** Implement one endpoint at a time
2. **Test Frequently:** Test each piece as you build it
3. **Follow Patterns:** Copy existing features as templates
4. **Use TypeScript:** Let types guide your implementation
5. **Handle Errors:** Think about what can go wrong
6. **User Feedback:** Always show loading, success, and error states
7. **Review Code:** Check against AI_CODING_RULES.md
8. **Ask for Help:** Reference documentation and examples

---

## Next Steps

After adding your feature:

1. Document any new environment variables
2. Update API documentation if needed
3. Consider adding automated tests
4. Get code review from team
5. Deploy to staging for testing
6. Monitor for errors after deployment

---

**Last Updated:** 2025-11-19
**Version:** 1.0
