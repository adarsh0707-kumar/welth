# Welth — Personal Finance Manager

> **A full-stack personal finance application built with Next.js, PostgreSQL, Prisma, Clerk, and AI-assisted financial insights.**

**Live demo:** https://welth-c7zv.onrender.com/

> **Status:** Working deployed application  
> **Focus:** Personal finance workflows, financial data modeling, scheduled jobs, and AI-assisted insights  
> **Scope:** Portfolio project; financial information is user-provided and the application is not a regulated financial service.

---

## What it implements

### Finance management
- Income and expense transactions
- Current and savings accounts
- Account balances
- Transaction categories
- Recurring transactions
- Monthly budgets
- Budget usage alerts
- Transaction history and filtering
- Financial charts and dashboard views

### Authentication and protection
- Clerk authentication and session management
- Protected dashboard, account, and transaction routes
- Arcjet Shield protection
- Bot detection
- Zod validation for application forms

### Automation
- Inngest scheduled/background functions
- Recurring-transaction processing
- Budget alert checks
- Monthly financial report generation
- Email delivery through Resend

### AI-assisted insights
Monthly financial statistics can be sent to Google's Gemini model to generate concise spending insights. If generation fails, the application falls back to predefined guidance.

This is **AI-assisted analysis**, not professional financial advice or automated investment management.

---

## Architecture

~~~text
                         User
                          │
                          ▼
                 ┌─────────────────┐
                 │   Next.js App   │
                 │ React 19 / UI   │
                 └────────┬────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Clerk/Auth    Server code   API routes
                          │
                          ▼
                 ┌─────────────────┐
                 │ Prisma Client   │
                 └────────┬────────┘
                          │
                          ▼
                    PostgreSQL
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        Inngest jobs             Financial data
              │
       ┌──────┴─────────┐
       ▼                ▼
   Resend email     Gemini insights
~~~

### Request and automation paths

**Interactive path**

~~~text
Browser
  ↓
Next.js
  ↓
Clerk authentication
  ↓
Application logic
  ↓
Prisma
  ↓
PostgreSQL
~~~

**Background path**

~~~text
Inngest schedule
  ↓
Query financial data
  ↓
Budget / recurring / report processing
  ↓
Optional Gemini analysis
  ↓
Resend email
~~~

---

## Data model

The Prisma schema currently centers on four models:

| Model | Purpose |
|---|---|
| User | Application profile linked to Clerk |
| Account | User's current/savings financial accounts |
| Transaction | Income and expense records |
| Budget | User's budget and alert state |

Transactions support:
- INCOME / EXPENSE
- PENDING / COMPLETED / FAILED
- daily / weekly / monthly / yearly recurrence
- account association
- categories
- optional receipt URLs

The schema includes indexes on user and account relationships for common lookups.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Components | Radix UI |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Authentication | Clerk |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Background jobs | Inngest |
| AI | Google Gemini |
| Email | Resend + React Email |
| Protection | Arcjet |
| Icons | Lucide React |
| Date utilities | date-fns |

---

## AI workflow

The monthly-report job aggregates a user's previous month's:
- total income
- total expenses
- expense categories
- transaction count

Those statistics are passed to Gemini with a prompt requesting three concise, actionable insights.

~~~text
Monthly transactions
        ↓
Aggregate income / expenses
        ↓
Group expenses by category
        ↓
Gemini
        ↓
Three text insights
        ↓
Monthly email report
~~~

If the AI request or JSON parsing fails, the implementation returns predefined fallback insights.

**Important:** generated output should be treated as informational. It is not financial, tax, investment, or legal advice.

---

## Background jobs

The Inngest integration currently defines four workflows:

| Workflow | Schedule / trigger |
|---|---|
| Budget alerts | Every 6 hours |
| Recurring transaction trigger | Daily |
| Individual recurring transaction processing | Event-driven |
| Monthly financial reports | First day of each month |

The recurring-transaction workflow uses a database transaction for creating the new transaction and updating the account/recurrence state.

---

## Run locally

### Prerequisites
- Node.js compatible with the current Next.js release
- npm
- PostgreSQL
- Clerk application
- Optional: Gemini API key
- Optional: Resend account
- Optional: Arcjet and Inngest configuration for those integrations

### Setup

~~~bash
git clone https://github.com/adarsh0707-kumar/welth.git
cd welth
npm install
~~~

Create .env.local with the credentials required by the integrations you intend to use. At minimum, configure the database and Clerk credentials.

~~~env
DATABASE_URL="postgresql://username:password@localhost:5432/welth"
DIRECT_URL="postgresql://username:password@localhost:5432/welth"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

ARCJET_KEY=...
GEMINI_API_KEY=...
RESEND_API_KEY=...
INNGEST_SIGNING_KEY=...
INNGEST_EVENT_KEY=...
~~~

Generate the Prisma client and apply the current schema:

~~~bash
npx prisma generate
npx prisma db push
~~~

Start development:

~~~bash
npm run dev
~~~

Open http://localhost:3000.

For a production-style local run:

~~~bash
npm run build
npm run start
~~~

---

## Project structure

~~~text
welth/
├── app/                  # Next.js routes and application pages
├── components/           # UI and feature components
├── actions/              # Server-side application actions
├── data/                 # Static application data
├── emails/               # React Email templates
├── lib/                  # Prisma, Inngest and shared utilities
├── prisma/
│   └── schema.prisma     # PostgreSQL data model
├── public/               # Static assets
├── middleware.js         # Clerk + Arcjet middleware
└── package.json
~~~

---

## Security and data handling

The repository includes:
- Clerk-based authentication
- Protected application routes
- Arcjet Shield
- Arcjet bot detection
- Zod-based form validation
- Prisma-managed database access
- Environment-based credentials

Security is not equivalent to regulatory compliance. This project does **not** claim PCI, SOC 2, banking, investment-adviser, tax, or other financial-service certification.

For deployment, production secrets should be supplied through the hosting platform's secret-management facilities rather than committed to Git.

---

## Known limitations
- No bank-account aggregation or automatic transaction import is implemented.
- No investment portfolio management is implemented.
- AI output is informational and can be incorrect.
- The application depends on third-party services for authentication, AI, email, and background execution.
- There is no formal performance benchmark suite in the repository.
- Automated test coverage is not documented as a release-quality gate.
- Background workflows require correctly configured Inngest infrastructure.
- Production security depends on deployment configuration in addition to application code.

### Engineering note

The repository currently contains a recurring-transaction balance-update path that should be reviewed carefully before production use. The implementation performs the same account-balance increment operation twice in the transaction handler. This README intentionally does not describe recurring transaction processing as production-safe.

---

## Roadmap

### Reliability
- [ ] Add automated unit/integration tests for financial calculations.
- [ ] Add end-to-end tests for authentication and transaction flows.
- [ ] Add idempotency protection to recurring transaction processing.
- [ ] Fix and regression-test recurring balance updates.
- [ ] Add observability for scheduled jobs and email delivery.

### Financial data
- [ ] Add stronger transaction validation and reconciliation rules.
- [ ] Add import workflows for supported bank/export formats.
- [ ] Improve budget and recurring-transaction history.

### AI / analytics
- [ ] Add offline evaluation of generated insights.
- [ ] Track AI failures and latency.
- [ ] Add safeguards for malformed or low-quality model output.
- [ ] Compare rule-based insights with LLM-generated insights.

### Production hardening
- [ ] Add rate-limit and authorization tests.
- [ ] Add database migration workflow.
- [ ] Establish measured performance targets.
- [ ] Document deployment-specific secret and webhook configuration.

---

## Why this project matters

Welth demonstrates a modern full-stack application with several backend concerns beyond CRUD:

~~~text
Authentication
     ↓
Financial domain model
     ↓
PostgreSQL + Prisma
     ↓
Scheduled/background workflows
     ↓
Email automation
     ↓
AI-assisted analysis
~~~

It is best presented as a **full-stack finance application with backend automation and AI integration**, rather than as a financial-advice product.

---

## License

MIT — see [LICENSE](LICENSE).