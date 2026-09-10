# DocTalk Web Frontend

The modern, responsive web application for the **DocTalk Healthcare & Telemedicine Platform**. Built with React, TypeScript, Vite, Tailwind CSS, and TanStack React Query.

## Overview

DocTalk is a full-featured clinical consultation, digital prescription, and medicine fulfillment platform connecting patients, verified doctors, pharmacies, and administrative compliance teams.

This frontend communicates exclusively with the backend via RESTful HTTP APIs (`http://localhost:5000/api`) and adheres strictly to client-side security standards:
- **Zero Database / Prisma Access**: No direct connections to PostgreSQL; all queries and mutations traverse validated backend endpoints.
- **No Stored Secrets**: Zero AWS, Stripe, or JWT signing secrets bundled in client assets.
- **Role-Based Routing**: Strict route-level guards (`RoleProtectedRoute`) enforcing `PATIENT`, `DOCTOR`, `PHARMACY`, and `ADMIN` access.
- **Stateless Bearer Authentication**: Stored securely in `localStorage` and injected via Axios request interceptors.

---

## Tech Stack

- **Core**: React 19, TypeScript (strict mode), Vite 8
- **Styling**: Tailwind CSS with custom healthcare palette (Medical Teal `brand` + Deep Navy `navy`), Lucide React icons
- **State & Server Cache**: TanStack React Query v5
- **Routing**: React Router v7
- **Form Management**: React Hook Form + Zod validation resolvers
- **Networking**: Axios instance with automatic Bearer token injection and 401 broadcast handling

---

## Workspace Structure

```
doctalk-frontend/
├── src/
│   ├── app/
│   │   ├── providers/          # AuthProvider, QueryProvider
│   │   └── router/             # AppRouter with public & role-guarded routes
│   ├── components/
│   │   ├── common/             # ProtectedRoute, RoleProtectedRoute
│   │   ├── feedback/           # EmptyState, LoadingScreen, Toast
│   │   ├── layout/             # AppShell, Header, Sidebar, MobileNav, PageContainer
│   │   └── ui/                 # Button, Input, Card, Badge, Alert, Spinner, Skeleton, Table
│   ├── lib/
│   │   ├── api/                # client.ts, authApi.ts, doctorApi.ts, appointmentApi.ts
│   │   ├── auth/               # tokenStorage.ts
│   │   ├── utils/              # cn.ts, formatters.ts
│   │   └── validation/         # authSchemas.ts (Zod)
│   ├── pages/
│   │   ├── admin/              # AdminDashboard, AdminDoctorsPage, AdminUsersPage, AdminAuditsPage
│   │   ├── auth/               # LoginPage, RegisterPage
│   │   ├── common/             # LandingPage, UnauthorizedPage, NotFoundPage
│   │   ├── doctor/             # DoctorDashboard, DoctorAppointmentsPage, DoctorPrescriptionsPage, DoctorProfilePage
│   │   ├── patient/            # PatientDashboard, PatientDoctorsPage, PatientAppointmentsPage, PatientPrescriptionsPage, etc.
│   │   └── pharmacy/           # PharmacyDashboard, PharmacyOrdersPage, PharmacyInventoryPage
│   ├── types/                  # auth.ts, doctor.ts, appointment.ts, api.ts
│   ├── App.tsx                 # Root application wrapper
│   ├── main.tsx                # React DOM render entry
│   └── index.css               # Tailwind directives & base styles
├── .env.example                # Environment variable blueprint
├── package.json                # Dependencies & scripts
├── tailwind.config.js          # Design tokens & color system
├── tsconfig.app.json           # Path mappings (@/*) & TypeScript config
└── vite.config.ts              # Vite bundle configuration
```

---

## Role Portals & Routes

| Role | Default Dashboard | Key Features |
| :--- | :--- | :--- |
| **Public** | `/` (Landing) | Platform hero, features, role portal cards, sign in (`/login`), sign up (`/register`) |
| **Patient** | `/patient/dashboard` | Doctor directory & search (`/patient/doctors`), appointment history (`/patient/appointments`), digital prescriptions (`/patient/prescriptions`), pharmacy orders (`/patient/orders`), encrypted records vault (`/patient/records`) |
| **Doctor** | `/doctor/dashboard` | Telehealth queue, daily appointments roster (`/doctor/appointments`), digital prescription generator (`/doctor/prescriptions`), professional credentials (`/doctor/profile`) |
| **Pharmacy** | `/pharmacy/dashboard` | Incoming order dispatch queue (`/pharmacy/orders`), medicine catalog & inventory stocks (`/pharmacy/inventory`) |
| **Admin** | `/admin/dashboard` | Doctor license approvals queue (`/admin/doctors`), user directory governance (`/admin/users`), security audit trails (`/admin/audits`) |

---

## Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- DocTalk backend running locally on `http://localhost:5000`

### 2. Environment Configuration
Create a `.env` file in the root of `doctalk-frontend` (copy from `.env.example`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory.

---

## Security Guarantees
- `.env*` files are strictly excluded via `.gitignore`
- Tokens are stored using client-side `TokenStorage` abstractions
- Automatic logout dispatched on HTTP `401 Unauthorized` responses
- Non-permitted route access triggers redirection to `/unauthorized` (HTTP 403 screen)
