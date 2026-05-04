# PrimeraDental — Gemini AI Skill

> **Scope:** This file governs all AI-assisted code generation within the PrimeraDental monorepo.
> Every directive is derived from the actual codebase patterns and architecture.

---

## 1. Workflow Discipline

### 1.1 Plan Before Execution (Mandatory)

Never write code immediately. For **any** non-trivial request:

1. **Research Phase** — Read the relevant files, schema, and existing patterns before proposing anything.
2. **Architectural Proposal** — Output a structured plan:
   - **The Approach:** High-level summary of the solution.
   - **Files Affected:** List every file that will be created or modified.
   - **Trade-offs:** What we gain vs. what we sacrifice.
   - **The Unhappy Path:** How this fails, and how we handle it.
3. **Wait for explicit approval** before writing any implementation code.
4. If there are multiple valid approaches, present **at least two structured options** with pros/cons.

### 1.2 Use Artifacts

- Use **implementation plans** to propose architectural changes.
- Use **task checklists** to track multi-step work during execution.
- Use **walkthroughs** to summarize completed work with diffs and screenshots.
- Do **not** open the browser unless explicitly asked. Use file reading and search tools to understand the codebase.

### 1.3 Permission Gates

- **New dependencies:** Never install without asking. State what, why, and why a native solution won't work.
- **Schema changes:** Always output a standalone migration in `BLUEPRINT/BACKEND/MIGRATIONS` AND update `FINAL-COMPLETE-SCHEMA.sql`. Both must stay in sync.
- **New files/directories:** Confirm the location and naming convention before creating.
- **Destructive operations:** Never auto-run deletes, drops, or overwrites without explicit approval.

### 1.4 Zero Assumptions

If a request is ambiguous, lacks scope, or requires knowledge you don't have from the open files — **stop**. Ask specific, bulleted clarifying questions. Never hallucinate schemas, endpoints, or component structures.

---

## 2. Architecture & Scalability

### 2.1 Monorepo Structure (Turborepo + pnpm)

```
PrimeraDental/
├── apps/
│   ├── api/          → Express 5 backend (localhost:5000)
│   ├── admin/        → Admin portal — React 19 + Vite (localhost:5174)
│   ├── user/         → Patient-facing app — React 19 + Vite (localhost:5173)
│   ├── secretary/    → Reception/booking — React 19 + Vite (localhost:5175)
│   ├── doctor/       → Clinician interface — React 19 + Vite (localhost:5176)
│   ├── common/       → Shared components (cross-app reuse)
│   └── DESIGN THEME/ → Design tokens and theme references
├── turbo.json        → Task pipeline configuration
└── pnpm-workspace.yaml
```

- **Package Manager:** Always use `pnpm` (v10.29.3). Never use `npm` or `yarn`.
- **Dev command:** `pnpm run dev` from root (runs `turbo dev`).
- **Build command:** `pnpm run build` from root.
- Cross-app changes must be grouped by feature inside `apps/`.

### 2.2 Backend Layered Architecture (apps/api)

Enforce strict separation across four layers. **Never skip a layer.**

```
Route → Middleware → Controller → Service → Database (Supabase)
```

| Layer | Responsibility | Location |
|---|---|---|
| **Routes** | HTTP verb + path mapping, middleware chaining, rate limiter attachment | `src/routes/*.routes.js` |
| **Middleware** | Auth verification, role gating, request validation | `src/middleware/*.middleware.js` |
| **Controllers** | Request parsing, response formatting. **No business logic.** | `src/controllers/*.controller.js` |
| **Services** | All business logic, database queries, transactions | `src/services/*.service.js` |
| **Schemas** | Zod validation schemas for request shape | `src/schemas/*.schema.js` |
| **Utils** | Cross-cutting helpers (errors, constants, time, logging) | `src/utils/*.js` |
| **Config** | Database client, environment config | `src/config/*.js` |

**Rules:**
- Controllers must be thin — extract body, call service, return response.
- Services own the Supabase queries. Controllers never touch `supabaseAdmin` directly.
- New domain = new `{domain}.routes.js` + `{domain}.controller.js` + `{domain}.service.js`.
- Inline route handlers (like the `displaced-handle` pattern) are **technical debt**. All new routes must use the controller/service pattern.

### 2.3 Frontend Architecture (apps/admin, user, secretary, doctor)

```
src/
├── components/    → Feature-grouped UI components
│   ├── admin/     → Admin-specific components (AdminSidebar, AdminHeader)
│   │   ├── doctors/
│   │   ├── patients/
│   │   ├── dashboard/
│   │   └── ...
│   ├── common/    → Shared UI primitives
│   └── ui/        → Generic design system components
├── context/       → React Context providers (Auth, Theme, Sidebar, Toast, Services)
├── hooks/         → Custom hooks per feature (useAppointments, useDoctors, etc.)
├── layouts/       → Shell layouts (AdminPortalLayout, AuthLayout, PublicLayout)
├── lib/           → Low-level utilities (formatting, class merging)
├── pages/         → Route-level page components (thin — render components only)
├── routes/        → Route definitions, ProtectedRoute, ScrollToTop
└── utils/         → API client, audit helpers
```

**Rules:**
- **Pages are thin shells.** They handle routing params and top-level data fetching. All UI must be extracted into `components/{feature}/`.
- **Never** write modals, forms, cards, or tables directly inside a `pages/` file.
- One Context per concern: Auth, Theme, Sidebar, Toast, Services. Do not create god-contexts.
- Custom hooks encapsulate all data-fetching + state logic for a feature. Components consume hooks, not raw `fetch`/`api` calls.
- The `utils/api.js` centralized fetch wrapper is the **single entry point** for all HTTP calls. Never use raw `fetch` in components or hooks.

### 2.4 API Versioning

All routes are mounted under `/api/v1/`. When introducing breaking changes:
1. Create a new `v2Router` in `app.js`.
2. Mount under `/api/v2`.
3. Keep v1 operational until all clients migrate.

### 2.5 Shared Code (apps/common)

Reusable components and utilities that span multiple frontends belong in `apps/common/src/components/`. Import via the workspace package name. Do not duplicate code across apps.

---

## 3. Clean Code Standards

### 3.1 Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files (backend) | `kebab-case.layer.js` | `admin.controller.js`, `slot-hold.service.js` |
| Files (frontend components) | `PascalCase.jsx` | `AdminSidebar.jsx`, `DoctorModal.jsx` |
| Files (frontend hooks) | `camelCase.js` | `useAppointments.js`, `useDoctors.js` |
| Files (frontend context) | `PascalCase.jsx` | `AuthContext.jsx`, `ThemeContext.jsx` |
| Files (CSS modules) | `PascalCase.module.css` | `AuthLayout.module.css` |
| Constants | `UPPER_SNAKE_CASE` | `APPOINTMENT_STATUS`, `CLINIC_CONFIG` |
| Functions/variables | `camelCase` | `getAllAppointments`, `handleSubmit` |
| React components | `PascalCase` | `AdminHeader`, `ProtectedRoute` |
| Route paths | `kebab-case` | `/appointments/:id/no-show` |
| Database columns | `snake_case` | `full_name`, `date_of_birth`, `avatar_url` |

### 3.2 File Organization Rules

- **One export per file** for components, hooks, and contexts.
- **Group by feature**, not by type. `components/doctors/DoctorCard.jsx` — not `components/cards/DoctorCard.jsx`.
- **Index files** are optional. Do not create barrel exports that obscure import paths.
- **Max file length:** If a service file exceeds ~500 lines, decompose into sub-services (e.g., `appointment.service.js` → `appointment-booking.service.js` + `appointment-status.service.js`).

### 3.3 Code Quality Rules

- **No magic strings.** Use constants from `utils/constants.js` for statuses, roles, tiers, config values.
- **No magic numbers.** Clinic hours, thresholds, and timeouts belong in the `clinic_settings` table (database). Use the Settings Service to fetch these dynamically; avoid hardcoding in `CLINIC_CONFIG`.
- **No `console.log` in production code.** Use the `logger` (Pino) instance from `utils/logger.js` on the backend. On the frontend, `console.error` for caught errors only.
- **No `any` types or `.passthrough()` on new schemas.** Existing schemas use `.passthrough()` for backward compatibility — new schemas must be strict.
- **No dead code.** Remove commented-out blocks, unused imports, and orphaned files.
- **DRY:** Extract repeated patterns into helpers. The `requireAuth` + `requireAdminOrSecretary` middleware chain is an example of correct reuse.
- **SOLID:** Single responsibility per function. If a service method does validation + query + email + logging, split it.

### 3.4 Comment & Documentation Standards

- **No fluff.** Comments explain *why*, not *what*. The code explains what.
- **JSDoc** on all service methods and exported utilities:
  ```js
  /**
   * Marks an appointment as no-show and increments the patient's
   * no-show counter. Triggers restriction check at threshold.
   * @param {string} appointmentId - UUID of the appointment
   * @param {string} adminId - UUID of the acting admin
   * @returns {Promise<{appointment: object, restricted: boolean}>}
   */
  ```
- **Section headers** in large files using the existing pattern:
  ```js
  // ── Appointments ──
  // ── Walk-In & Patients ──
  ```

---

## 4. Performance

### 4.1 Database Query Performance

- **No `SELECT *`.** Always use `.select('col1, col2, col3')` specifying exactly the columns the caller needs.
- **No N+1 queries.** If fetching a list of appointments with their patients, use a single joined query — not a loop.
- **Pagination on all collection endpoints.** Use cursor-based or offset pagination. Default: 20 items, max: 100.
- **Indexing:** When adding new query patterns (filters, sorts), verify that the relevant columns are indexed in the schema.
- **Batch operations:** For bulk updates (e.g., `bulkUpdateSchedule`), use a single transaction with batch upserts — not individual queries in a loop.

### 4.2 Frontend Performance

- **Lazy load routes.** Use `React.lazy()` + `Suspense` for page-level code splitting. The current setup loads all pages eagerly — new pages should be lazy.
- **Memoize expensive computations.** Use `useMemo` for filtered/sorted lists and `useCallback` for handlers passed to child components.
- **Avoid unnecessary re-renders.** Context consumers re-render on every context value change. Keep context values stable with `useMemo`.
- **Debounce search inputs.** Any search/filter input that triggers an API call must be debounced (300ms minimum).
- **Image optimization.** Use WebP format, lazy loading (`loading="lazy"`), and appropriate `srcset` for responsive images.
- **Bundle size.** Import only what you need: `import { Search } from 'lucide-react'` — never `import * as Icons`.

### 4.3 API Performance

- **Request timeouts** are set at 30s (req) / 30s (res). Long-running operations must be processed asynchronously (queue/job pattern).
- **Rate limiting** is already configured per tier (API general, auth, slot holds). New sensitive endpoints must define their own limiter.
- **JSON body limit** is 1MB. File uploads should use a dedicated upload route with multipart handling.
- **Caching strategy:** For read-heavy, rarely-changing data (services list, clinic settings, dentist roster), implement HTTP cache headers (`Cache-Control`, `ETag`) or in-memory caching with TTL.

---

## 5. Security

### 5.1 Authentication & Authorization

- **Auth flow:** Supabase Auth → JWT in `sb-access-token` cookie or `Authorization: Bearer` header → `requireAuth` middleware verifies via `supabaseAdmin.auth.getUser()`.
- **Role-Based Access Control (RBAC):**
  - `requireAuth` — Any authenticated user.
  - `requireAdminOrSecretary` — Staff-level access (admin + secretary roles).
  - `requireAdmin` — Admin-only operations (user management, audit logs, system health).
- **New endpoints must specify their access tier** in the route file using the middleware chain pattern:
  ```js
  router.use(requireAuth, requireAdminOrSecretary); // All routes below are staff-only
  router.get('/sensitive', requireAdmin, handler);   // This specific route is admin-only
  ```
- **Never trust the client.** Always re-verify `req.user.role` in the service layer for destructive operations, even if middleware already checked.
- **Token storage:** Frontend stores JWT in `localStorage` (current pattern). For improved security on future iterations, migrate to `httpOnly` cookies with `SameSite=Strict`.

### 5.2 Input Validation

- **All inputs are validated with Zod** before reaching the controller. The `validate()` middleware in `utils/validate.js` parses `req.body`, `req.query`, and `req.params` against a schema.
- **Every new endpoint must have a corresponding Zod schema** in `src/schemas/`. No endpoint should accept unvalidated input.
- Schema rules for new code:
  ```js
  // ✅ CORRECT — Strict schema
  export const createDoctorSchema = z.object({
      body: z.object({
          email: z.string().email(),
          first_name: z.string().min(1).max(100),
          specialization: z.enum(['general', 'specialized']),
      }),
      query: z.object({}),
      params: z.object({}),
  });

  // ❌ WRONG — Leaky schema
  export const createDoctorSchema = z.object({
      body: z.any(), // Never do this
  });
  ```
- **Sanitize all string inputs** that will be rendered in HTML or stored in the database. Strip HTML tags, trim whitespace, enforce max lengths.

### 5.3 Data Protection

- **Never log sensitive data** (passwords, tokens, PII like full emails or phone numbers). The Pino logger serializers in `app.js` already strip request headers — maintain this.
- **Error masking in production:** The `errorHandler` middleware already masks non-operational errors in production. Never return raw stack traces or internal error messages to the client.
- **CORS whitelist:** Only the four frontend origins + legacy port are allowed. Do not add wildcard (`*`) origins.
- **Helmet CSP:** Content Security Policy is configured. When adding new external resources (fonts, CDNs, image hosts), update the CSP directives in `app.js`.
- **Rate limiting thresholds:**
  - Auth endpoints: 10 req/15min in production.
  - General API: 500 req/15min in production.
  - Slot holds: 10 req/15min in production.
  - New sensitive endpoints must define appropriate limits.

### 5.4 Database Security

- **All mutations in transactions.** Use Supabase's `.rpc()` for multi-table operations or wrap in a service-level transaction pattern to prevent partial updates.
- **Parameterized queries only.** Supabase client handles this natively — never construct raw SQL strings with user input.
- **Row-Level Security (RLS):** Supabase RLS policies are the final guard. Even if application-level checks fail, RLS must prevent unauthorized data access. Verify RLS policies exist for new tables.

---

## 6. Frontend-Specific Standards

### 6.1 Styling (Tailwind CSS 4)

- Use **Tailwind CSS 4** with the Vite plugin (`@tailwindcss/vite`).
- Follow the existing dark mode pattern: `dark:` prefix classes alongside light defaults.
- Responsive breakpoints follow mobile-first: base → `sm:` → `md:` → `lg:` → `xl:`.
- Do not use inline `style` attributes. If Tailwind can't express it, use CSS modules (`*.module.css`).
- **Design references:** Consult `ui-ux-pro-max-skill/` for color palettes, typography pairings, and UX guidelines. Consult `Uncodixfy/Uncodixfy.md` for component design rules.

### 6.2 State Management

| Scope | Solution | Example |
|---|---|---|
| Server state (API data) | Custom hooks with `useState` + `useEffect` | `useAppointments.js` |
| Global UI state | React Context | `SidebarContext`, `ThemeContext` |
| Auth state | `AuthContext` (single source of truth) | `useAuth()` hook |
| Ephemeral UI state | Local `useState` | Modal open/close, form inputs |
| Notifications | `ToastContext` | `useToast()` hook |

- **Never duplicate state.** If the API is the source of truth, derive UI state from the API response — don't copy it into local state and mutate independently.
- **Optimistic updates** are acceptable for non-critical UI toggles but must include rollback on failure.

### 6.3 Routing Patterns

- Tab-based pages use URL params: `/doctors/:tab/:id?`, `/patients/:tab/:id?`.
- Default tabs redirect: `<Route index element={<Navigate to="profile" replace />} />`.
- All authenticated routes wrap with `<ProtectedRoute allowedRoles={['admin']}>`.
- Catch-all redirects to `/` for unknown paths.

### 6.4 Component Design Rules

- Props should be **descriptive and typed** (use JSDoc or PropTypes for complex components).
- Avoid prop drilling beyond 2 levels — use Context or composition.
- Modals, drawers, and overlays use the `useModal()` hook pattern.
- Click-outside dismissal uses the `useClickOutside()` hook.
- All interactive elements must have unique, descriptive `id` attributes for testing.

### 6.5 UX Laws (Enforced)

- **Jakob's Law:** Use familiar patterns (sidebar nav, top-right profile menu, standard table layouts).
- **Fitts's Law:** Touch targets minimum 44x44px on mobile. Primary actions are large and accessible.
- **Hick's Law:** Break complex workflows into steps. No more than 7±2 choices per screen.
- **Miller's Law:** Group related data into cards/sections. Use visual hierarchy.
- **No AI-default aesthetics.** No oversized rounded corners, floating panels, or soft gradients unless the design system calls for it. Follow `Uncodixfy/Uncodixfy.md` strictly.

---

## 7. Backend-Specific Standards

### 7.1 Error Handling

Use the `AppError` class for all operational errors:

```js
import { AppError } from '../utils/errors.js';

// ✅ Correct — Operational error with HTTP status
throw new AppError('Patient not found', 404);
throw new AppError('Appointment slot is no longer available', 409);

// ❌ Wrong — Generic Error leaks internals in production
throw new Error('PGRST116: ...');
```

The `humanizeError()` mapper in `utils/errorMapper.js` translates technical Supabase/Postgres errors into user-friendly messages. Add new mappings there for any new error patterns.

### 7.2 Controller Pattern

Controllers follow this strict template:

```js
export const getResource = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await resourceService.getById(id, req.user);
        res.json(result);
    } catch (err) {
        next(err); // Always delegate to error middleware
    }
};
```

- **Always wrap in try/catch** and call `next(err)`.
- **Never send responses in catch blocks** — let the centralized `errorHandler` do it.
- **Parse and destructure** request data at the top.
- **One service call** per controller method. Orchestration belongs in the service layer.

### 7.3 Service Pattern

```js
export async function createAppointment(data, actingUser) {
    // 1. Validate business rules
    if (conflict) throw new AppError('Time slot conflict', 409);

    // 2. Execute in transaction where possible
    const { data: result, error } = await supabaseAdmin
        .from('appointments')
        .insert({ ...data, created_by: actingUser.id })
        .select('id, status, date, time')
        .single();

    if (error) throw new AppError('Failed to create appointment', 500);

    // 3. Side effects (notifications, audit logs)
    await notificationService.sendBookingConfirmation(result);

    return result;
}
```

### 7.4 Scheduled Tasks

Scheduled tasks (cron jobs) are centralized in `utils/scheduled-tasks.js`. New recurring jobs:
1. Add to the existing file with clear section headers.
2. Use `node-cron` with timezone-aware scheduling.
3. Wrap in try/catch — a failing cron must never crash the process.

### 7.5 Email & Notifications

- Email dispatch uses `Resend` (`resend` package). Templates are in `EmailTemplates/`.
- SMS templates are in `utils/sms-templates.js`.
- All notification sends must be **fire-and-forget** (don't block the response) unless the notification is the primary action (e.g., email confirmation).

---

## 8. Database Standards

### 8.1 Schema Authority

`FINAL-COMPLETE-SCHEMA.sql` is the **single source of truth**. For any schema change:
1. Write a standalone migration script in `BLUEPRINT/BACKEND/MIGRATIONS/`.
2. Update `FINAL-COMPLETE-SCHEMA.sql` to reflect the final state.
3. Both files must stay in sync. Never modify one without the other.

### 8.2 Query Rules

```js
// ✅ CORRECT — Explicit columns, single query
const { data } = await supabaseAdmin
    .from('appointments')
    .select('id, status, date, time, patient:profiles!patient_id(full_name)')
    .eq('status', APPOINTMENT_STATUS.CONFIRMED)
    .order('date', { ascending: true })
    .range(offset, offset + limit - 1);

// ❌ WRONG — SELECT *, no pagination
const { data } = await supabaseAdmin
    .from('appointments')
    .select('*');
```

### 8.3 Constants Usage

Always reference `utils/constants.js` for enum-like values:

```js
import { APPOINTMENT_STATUS, CLINIC_CONFIG, USER_ROLES } from '../utils/constants.js';

// ✅
.eq('status', APPOINTMENT_STATUS.CONFIRMED)

// ❌
.eq('status', 'CONFIRMED')
```

---

## 9. Testability

### 9.1 Backend Testing

- Test files go in `apps/api/tests/` mirroring the service structure.
- **Unit test services** by mocking `supabaseAdmin`. Services contain all business logic — test them in isolation.
- **Integration test routes** with supertest against the Express app.
- Every new service method should include a brief mention of how it should be tested:
  ```js
  // Test: Mock supabaseAdmin.from('appointments').update() to return error,
  // verify AppError(500) is thrown.
  ```

### 9.2 Frontend Testing

- Test components with React Testing Library.
- Test hooks with `@testing-library/react-hooks` (renderHook).
- Mock `utils/api.js` for all hook tests — never hit the real API.
- Page-level tests verify routing and layout rendering, not business logic.

---

## 10. Git & Collaboration

- **Branch naming:** `feat/`, `fix/`, `refactor/`, `chore/` prefixes.
- **Commit messages:** Imperative tense, scoped: `feat(admin): add patient merge workflow`.
- **Never push directly to `main`.** Always branch → commit → PR.
- **Keep PRs focused.** One feature/fix per PR. Do not bundle unrelated changes.

---

## Quick Reference: Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Monorepo | Turborepo | ^2.4.4 |
| Package Manager | pnpm | 10.29.3 |
| Backend Runtime | Node.js (ESM) | — |
| Backend Framework | Express | ^5.2.1 |
| Database | Supabase (PostgreSQL) | ^2.103.3 |
| Validation | Zod | ^4.3.6 |
| Logging | Pino + pino-http | ^10.3.1 |
| Email | Resend | ^6.9.2 |
| Security | Helmet + CORS + express-rate-limit | Latest |
| Frontend Framework | React | ^19.2.0 |
| Build Tool | Vite | ^7.3.1 |
| CSS Framework | Tailwind CSS | ^4.2.0 |
| Routing | React Router DOM | ^7.0.0 |
| Icons | Lucide React | ^0.575.0 |
| Animation | GSAP + Lenis | ^3.14.2 / ^1.3.18 |
| Scheduler | node-cron | ^4.2.1 |
 