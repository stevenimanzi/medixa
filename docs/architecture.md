# Medixa Architecture

## System Overview

Medixa is a multi-branch pharmacy management platform designed with an API-first approach to support multiple client interfaces.

### Core Architecture Components

1. **Backend (Laravel)**
   - API endpoints for business logic.
   - Authentication (Sanctum).
   - PostgreSQL as the primary transactional database.
   - Redis for queues, caching, and background jobs.

2. **Frontend (React)**
   - SPA built with Vite and TypeScript.
   - UI built with Tailwind CSS and shadcn/ui.
   - Deployed as a Web application and embedded in a Desktop shell.

3. **Desktop (Electron)**
   - Wraps the React frontend.
   - Prepared for future local SQLite integration for offline synchronization.

4. **Cloud Services (Firebase)**
   - Optional Firebase Authentication for external providers.
   - Firebase Storage for document/image uploads.
   - Firebase Cloud Messaging for push notifications.

## Multi-Tenant / Branch Model
- All records (sales, inventory) must be tied to a `company_id` and `branch_id`.
- The system supports Role-Based Access Control (RBAC).

## Accounting Architecture
- Double-entry bookkeeping system supporting debits, credits, assets, liabilities, equity, revenue, and expenses.
