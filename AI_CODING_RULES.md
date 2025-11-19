# AI Coding Rules & Best Practices

This document provides guidelines for AI-assisted development and human developers maintaining this codebase. Following these rules ensures consistency, maintainability, and code quality.

## Table of Contents

1. [Project Architecture Principles](#project-architecture-principles)
2. [File Organization Rules](#file-organization-rules)
3. [TypeScript Guidelines](#typescript-guidelines)
4. [React Best Practices](#react-best-practices)
5. [Backend Development Rules](#backend-development-rules)
6. [Authentication & Security](#authentication--security)
7. [Database Guidelines](#database-guidelines)
8. [API Design Principles](#api-design-principles)
9. [Error Handling](#error-handling)
10. [Testing Guidelines](#testing-guidelines)
11. [Git Workflow](#git-workflow)
12. [AI Assistant Instructions](#ai-assistant-instructions)

---

## Project Architecture Principles

### 1. Feature-Based Organization

**Rule:** Organize code by feature, not by type.

**Good:**
```
src/features/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.routes.ts
│   └── index.ts
└── quotes/
    ├── quotes.controller.ts
    ├── quotes.service.ts
    └── quotes.routes.ts
```

**Bad:**
```
src/
├── controllers/
│   ├── auth.controller.ts
│   └── quotes.controller.ts
├── services/
│   ├── auth.service.ts
│   └── quotes.service.ts
```

### 2. Barrel Exports

**Rule:** Each feature must have an `index.ts` that exports all public APIs.

**Example:**
```typescript
// features/auth/index.ts
export { authRoutes } from './auth.routes'
export { authMiddleware } from './auth.middleware'
export { authService } from './auth.service'
export * from './auth.validation'
```

**Usage:**
```typescript
// Good
import { authRoutes, authMiddleware } from '@/features/auth'

// Bad
import { authRoutes } from '@/features/auth/auth.routes'
import { authMiddleware } from '@/features/auth/auth.middleware'
```

### 3. Single Responsibility

**Rule:** Each file should have one primary responsibility.

- Controllers: Handle HTTP requests/responses
- Services: Contain business logic
- Routes: Define endpoints and middleware
- Validation: Input validation schemas
- Middleware: Cross-cutting concerns

---

## File Organization Rules

### Backend Structure

```
backend/src/
├── features/
│   └── [feature-name]/
│       ├── [feature].controller.ts  # HTTP handlers
│       ├── [feature].service.ts     # Business logic
│       ├── [feature].routes.ts      # Route definitions
│       ├── [feature].middleware.ts  # Feature-specific middleware
│       ├── [feature].validation.ts  # Zod schemas
│       ├── [feature].types.ts       # TypeScript types
│       └── index.ts                 # Barrel exports
├── middleware/                      # Global middleware
├── utils/                           # Shared utilities
├── config/                          # Configuration
└── server.ts                        # App entry point
```

### Frontend Structure

```
frontend/src/
├── features/
│   └── [feature-name]/
│       ├── components/              # Feature-specific components
│       ├── [feature].types.ts       # TypeScript types
│       └── index.ts                 # Barrel exports
├── hooks/                           # Custom React hooks
├── lib/                             # Utilities and configs
├── components/                      # Shared components
└── App.tsx                          # Root component
```

---

## TypeScript Guidelines

### 1. Always Use Strict Mode

**Rule:** Keep `strict: true` in tsconfig.json.

### 2. Explicit Return Types

**Rule:** Always declare return types for functions.

**Good:**
```typescript
async function login(data: LoginInput): Promise<AuthResponse> {
  // ...
}
```

**Bad:**
```typescript
async function login(data: LoginInput) {
  // ...
}
```

### 3. Avoid `any`

**Rule:** Never use `any` type. Use `unknown` if type is truly unknown.

**Good:**
```typescript
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

**Bad:**
```typescript
function handleError(error: any): void {
  console.error(error.message)
}
```

### 4. Interface vs Type

**Rule:**
- Use `interface` for object shapes that might be extended
- Use `type` for unions, intersections, and complex types

**Interface:**
```typescript
interface User {
  id: string
  email: string
  name: string | null
}

interface Admin extends User {
  role: 'admin'
}
```

**Type:**
```typescript
type Status = 'draft' | 'sent' | 'accepted' | 'rejected'
type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: User
}
```

### 5. Path Aliases

**Rule:** Always use `@/` path alias for imports.

**Good:**
```typescript
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
```

**Bad:**
```typescript
import { api } from '../../lib/api'
import { useAuth } from '../hooks/useAuth'
```

---

## React Best Practices

### 1. Functional Components Only

**Rule:** Use function components with hooks, not class components.

**Good:**
```typescript
function Login() {
  const [email, setEmail] = useState('')
  return <form>...</form>
}
```

### 2. Custom Hooks for Logic

**Rule:** Extract complex logic into custom hooks.

**Good:**
```typescript
// hooks/useAuth.tsx
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const login = async (data: LoginData) => { /* ... */ }
  return { user, login }
}

// Component
function Login() {
  const { login } = useAuth()
  // ...
}
```

### 3. Component Props Types

**Rule:** Always define props interfaces.

**Good:**
```typescript
interface LoginProps {
  onSuccess?: () => void
  redirectTo?: string
}

function Login({ onSuccess, redirectTo = '/' }: LoginProps) {
  // ...
}
```

### 4. Context for Global State

**Rule:** Use Context API for auth, theme, etc. Avoid prop drilling.

**Example:**
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // ...
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 5. Error Boundaries

**Rule:** Wrap components in error boundaries for production.

### 6. Lazy Loading

**Rule:** Use React.lazy() for route-based code splitting.

**Example:**
```typescript
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

---

## Backend Development Rules

### 1. Controller Structure

**Rule:** Controllers should only handle HTTP concerns.

**Template:**
```typescript
export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      // 1. Validate input (using middleware or here)
      const validated = registerSchema.parse(req.body)

      // 2. Call service
      const result = await authService.register(validated)

      // 3. Return response
      res.status(201).json({
        success: true,
        data: result,
      })
    } catch (error) {
      // 4. Handle errors
      const message = error instanceof Error ? error.message : 'Registration failed'
      res.status(400).json({
        success: false,
        message,
      })
    }
  }
}
```

### 2. Service Structure

**Rule:** Services contain business logic, no HTTP concerns.

**Template:**
```typescript
export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    // 1. Validate business rules
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    // 2. Process data
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // 3. Database operations
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    })

    // 4. Return result
    const tokens = this.generateTokens({ userId: user.id, email: user.email })
    return { ...tokens, user }
  }
}
```

### 3. Route Structure

**Rule:** Keep routes clean and declarative.

**Template:**
```typescript
import { Router } from 'express'
import { authController } from './auth.controller'
import { authMiddleware } from './auth.middleware'

const router = Router()

// Public routes
router.post('/register', (req, res) => authController.register(req, res))
router.post('/login', (req, res) => authController.login(req, res))

// Protected routes
router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res))
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res))

export default router
```

### 4. Middleware Pattern

**Rule:** Middleware should be composable and single-purpose.

**Example:**
```typescript
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract token
    const token = extractToken(req)

    // 2. Verify token
    const payload = authService.verifyAccessToken(token)

    // 3. Attach to request
    req.user = payload

    // 4. Continue
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
  }
}
```

---

## Authentication & Security

### 1. Password Requirements

**Rule:** Enforce strong passwords.

**Minimum requirements:**
- 8 characters minimum
- 1 uppercase letter
- 1 lowercase letter
- 1 number

**Validation:**
```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
```

### 2. JWT Token Management

**Rule:** Use access + refresh token pattern.

**Configuration:**
- Access Token: 15 minutes expiry
- Refresh Token: 7 days expiry
- Store both in localStorage (for web)
- Use httpOnly cookies for production (recommended)

### 3. Token Storage

**Rule:** Frontend stores tokens in localStorage with these keys:
- `accessToken` - for API requests
- `refreshToken` - for token renewal
- `user` - user data as JSON string

### 4. Protected Routes

**Backend:**
```typescript
router.get('/protected', authMiddleware, controller.handler)
```

**Frontend:**
```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 5. Never Store Sensitive Data

**Rule:** Never log or expose:
- Passwords (even hashed)
- JWT secrets
- Full tokens in logs
- User private data

---

## Database Guidelines

### 1. Prisma Schema Conventions

**Rule:** Follow these naming conventions:
- Models: PascalCase (User, Quote, QuoteItem)
- Fields: camelCase (userId, clientEmail)
- Relations: camelCase, descriptive (user, quotes, items)

### 2. Always Use Transactions

**Rule:** Use transactions for multi-step operations.

**Example:**
```typescript
await prisma.$transaction(async (tx) => {
  const quote = await tx.quote.create({
    data: { /* ... */ },
  })

  await tx.quoteItem.createMany({
    data: items.map(item => ({
      ...item,
      quoteId: quote.id,
    })),
  })
})
```

### 3. Select Only Needed Fields

**Rule:** Don't fetch unnecessary data, especially passwords.

**Good:**
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
  },
})
```

**Bad:**
```typescript
const user = await prisma.user.findUnique({
  where: { id },
})
// This includes password field!
```

### 4. Cascade Deletes

**Rule:** Use Prisma's `onDelete: Cascade` for dependent data.

**Example:**
```prisma
model QuoteItem {
  id      String  @id @default(uuid())
  quoteId String
  quote   Quote   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
}
```

---

## API Design Principles

### 1. RESTful Conventions

**Rule:** Follow REST standards.

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/quotes | List all quotes |
| GET | /api/quotes/:id | Get single quote |
| POST | /api/quotes | Create quote |
| PUT | /api/quotes/:id | Update quote |
| DELETE | /api/quotes/:id | Delete quote |

### 2. Consistent Response Format

**Rule:** All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### 3. HTTP Status Codes

**Rule:** Use appropriate status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

### 4. Input Validation

**Rule:** Always validate input using Zod schemas.

**Example:**
```typescript
const createQuoteSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    rate: z.number().positive(),
  })),
})
```

---

## Error Handling

### 1. Try-Catch Blocks

**Rule:** Always wrap async operations in try-catch.

**Example:**
```typescript
async function handler(req: Request, res: Response) {
  try {
    const result = await service.doSomething()
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
```

### 2. Custom Error Classes

**Rule:** Create custom errors for specific cases.

**Example:**
```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}
```

### 3. Frontend Error Display

**Rule:** Show user-friendly error messages.

**Example:**
```typescript
try {
  await api.post('/endpoint', data)
  toast.success('Success!')
} catch (error) {
  const message = error.response?.data?.message || 'Something went wrong'
  toast.error(message)
}
```

---

## Testing Guidelines

### 1. Test Structure

**Rule:** Organize tests alongside source files or in `__tests__` directory.

### 2. Test Naming

**Rule:** Use descriptive test names.

**Example:**
```typescript
describe('AuthService', () => {
  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      // ...
    })

    it('should throw error if email already exists', async () => {
      // ...
    })

    it('should return access and refresh tokens', async () => {
      // ...
    })
  })
})
```

### 3. Test Coverage

**Rule:** Aim for:
- 80%+ coverage for services
- 100% coverage for authentication
- Integration tests for API endpoints

---

## Git Workflow

### 1. Branch Naming

**Rule:** Use conventional branch names:
- `feature/user-authentication`
- `fix/login-validation`
- `refactor/auth-service`
- `docs/api-documentation`

### 2. Commit Messages

**Rule:** Follow conventional commits:

**Format:** `type(scope): description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Testing
- `chore`: Maintenance

**Examples:**
```
feat(auth): add refresh token functionality
fix(api): correct token storage key from 'token' to 'accessToken'
refactor(quotes): extract calculation logic to service
docs: add verification guide
```

### 3. Never Commit

**Rule:** Never commit these files:
- `.env` (use `.env.example` instead)
- `node_modules/`
- `dist/` or `build/`
- IDE-specific files (`.vscode/`, `.idea/`)
- Log files (`*.log`)
- OS files (`.DS_Store`, `Thumbs.db`)

---

## AI Assistant Instructions

When working with AI coding assistants, provide these instructions:

### Context Prompts

**For new features:**
```
I'm working on a React + TypeScript + Express project with JWT auth.
Follow the feature-based organization in src/features/.
Use Prisma for database, Zod for validation.
Frontend uses React Router, useAuth hook for authentication.
See AI_CODING_RULES.md for project conventions.

I need to add a [feature name] feature...
```

**For bug fixes:**
```
This project uses:
- Backend: Express + TypeScript + Prisma
- Frontend: React + TypeScript + Vite
- Auth: JWT with access/refresh tokens stored in localStorage

Issue: [describe issue]
Expected: [expected behavior]
Actual: [actual behavior]
```

### Best Practices for AI Assistance

1. **Provide Context:** Always mention you're working with this template
2. **Reference Files:** Point to existing patterns (e.g., "follow auth feature structure")
3. **Specify Requirements:** Be explicit about types, validation, error handling
4. **Request Tests:** Ask for tests to be written alongside code
5. **Review Suggestions:** Always review AI-generated code for security issues

### Example Prompts

**Good prompt:**
```
Add a quotes feature following the auth feature pattern:
- backend/src/features/quotes/ with controller, service, routes
- Frontend components in frontend/src/features/quotes/
- Protected routes requiring authentication
- Zod validation for input
- TypeScript types for all data
```

**Bad prompt:**
```
Add quotes to the app
```

---

## Code Review Checklist

Before committing code, verify:

- [ ] TypeScript has no errors (`npm run build`)
- [ ] All functions have explicit return types
- [ ] No `any` types used
- [ ] Imports use `@/` path alias
- [ ] Error handling is present
- [ ] Input validation using Zod
- [ ] No sensitive data in logs
- [ ] Console.logs removed (use proper logging)
- [ ] Comments explain "why", not "what"
- [ ] No unused imports or variables
- [ ] Consistent formatting (use Prettier)
- [ ] Git commit message follows conventions
- [ ] `.env` not committed

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Zod Documentation](https://zod.dev/)

---

**Last Updated:** 2025-11-19
**Version:** 1.0
