# PrimeraDental Copilot Instructions

## Global Instructions & AI Directives

- **Plan Before Execution (Architecture & Best Practices):** Never write or output code immediately.
  Always propose a high-level architectural plan first. Rely strictly on the latest industry best
  practices. If there are multiple valid "best practice" approaches for a system or architectural
  design, you must present at least two structured options. Highlight the trade-offs (pros/cons) of
  each and wait for explicit selection before writing any code.
- **Zero Assumptions:** If a request is ambiguous, lacks scope, or you do not have sufficient
  context from the open files, stop. Do not hallucinate or guess. Ask specific, clarifying questions
  to get the required information.
- **Strict Dependency Management:** Do not introduce new npm packages, libraries, or technologies
  unless absolutely necessary and highly useful. If a new dependency is the best solution, you must
  ask for permission first. Suggest the package, explain exactly why it is the best choice over a
  native implementation, and wait for approval.
- **Match Existing Patterns:** Analyze the surrounding codebase. Strictly adapt to and replicate the
  existing coding style, naming conventions, and structural patterns.
- **Long-Term Maintainability:** Prioritize the long run. Code must be clean, modular, and scalable.
  Provide only the complete code for the approved solution. Do not use placeholders, and do not omit
  sections for brevity.

## Database, Security & Backend Guidelines

- **The Single Source of Truth & Migrations:** `FINAL-COMPLETE-SCHEMA.sql` is the absolute authority
  for the database. If we make a new migration, you must update the final schema file also.
    1. Output a standalone SQL migration script in `BLUEPRINT/BACKEND/MIGRATIONS`.
    2. Simultaneously update `FINAL-COMPLETE-SCHEMA.sql` to reflect the final state.
    - You are responsible for keeping both in sync. Do not hallucinate database logic.
- **Atomic & Secure:** All database mutations must be handled using atomic transactions to prevent
  partial updates or orphaned data.
- **Strict Data Access (No Over-fetching):** Never use `SELECT *` or fetch data the client does not
  explicitly need. Always define strict `.select(...)` statements specifying exactly the columns
  required by the interface.
- **Performance & Safety First:** Modern architectures demand speed and security:
    - **Security:** Enforce strict input validation (e.g., Zod), aggressive SQL injection
      prevention, and robust role-based access control (RBAC). Always sanitize user inputs.
    - **Speed:** Implement proper database indexing, strict query optimization, and aggressively
      avoid N+1 query problems. Use pagination/cursors for collection queries.
    - **Caching:** Where appropriate, leverage caching strategies to reduce repetitive database
      loads.

## UI / UX Directives

- **Data-Driven UI:** I do not care about heavy UI scaffolding. Your primary directive for UI
  generation is to ensure that the interface perfectly matches and can be fully supported by the
  current database schema. Do not design frontend inputs for data we do not track in the backend.
- **Laws of UX Abidance:** When generating or suggesting frontend layouts, you must implicitly
  leverage the Laws of UX. Specifically:
    - **Jakob’s Law:** Avoid reinventing the wheel. Use standard, familiar web patterns (like
      standard sidebar navigation or top-right profile menus) so users don't have to learn a new
      interface.
    - **Fitts’s Law:** Ensure actionable elements (buttons, links) are easily accessible and
      appropriately sized, specially on mobile.
    - **Hick’s Law:** Minimize cognitive load. Break complex forms into manageable steps and do not
      overwhelm the user with too many choices on a single screen.
    - **Miller’s Law:** Group related information logically into clusters (cards, sections) to aid
      user memory.
- **Uncodixfy UI Skills:** STRICTLY adhere to the UI rules defined in `Uncodixfy/Uncodixfy.md`.
  Avoid default AI aesthetic patterns (e.g., oversized rounded corners, floating panels, soft
  gradients). Stick to standard, functional components that feel human-designed and honest (e.g.,
  Linear, GitHub). Do not invent new layouts; replicate clean components without unnecessary
  decoration.
- **UI-UX Pro Max Skills:** For advanced design intelligence, color palettes, typography pairings,
  and UX best practices, refer to the local toolkit in `ui-ux-pro-max-skill/`. 
  that directory to find specific guidance for the current stack (React/Tailwind).

## Documentation & Markdown Standards

- **Core Focus:** When writing `.md` files or documentation, strictly focus on the core ideas,
  flows, and essential logic. Do not add fluff.
- **Improvement Proposals:** If you see areas for architectural or logical improvement while
  documenting, list them in a distinct "Proposed Improvements" section at the bottom of the file.
  Suggest, but keep the primary document focused on the current core implementation.

## Architecture Overview

- **Monorepo setup**: Built using Turborepo (`pnpm turbo`).
- **Services**:
    - `apps/api`: Backend service (runs on `http://localhost:5000`)
    - `apps/user`: Patient facing app (`http://localhost:5173`)
    - `apps/admin`: Administrator portal (`http://localhost:5174`)
    - `apps/secretary`: Reception/Booking management (`http://localhost:5175`)
    - `apps/doctor`: Clinician interface (`http://localhost:5176`)

## Development Workflows

- **Package Manager**: Always use `pnpm` (version `10.29.3` specified).
- **Start the environments**: Use `pnpm run dev` from the root, which runs `turbo dev` and spits out
  local links.
- **Build**: Use `pnpm run build` from root.

## Conventions

- **Feature-Based UI Architecture:** Strict separation between Pages and Components is required.
    - `pages/` must ONLY contain routing logic, high-level structural layouts, and top-level
      state/data-fetching.
    - NEVER write UI blocks, form modals, or complex cards directly inside a `pages/` file.
    - All UI elements must be extracted into focused components organized by feature inside the
      `components/` directory (e.g., `components/services/ServiceCard.jsx`,
      `components/doctors/DoctorModal.jsx`). Pages should simply import and render these components.
- Changes spanning frontend and backend should be properly grouped by feature in `apps/`.
- Ensure appropriate usage of turbo when resolving build tasks.
