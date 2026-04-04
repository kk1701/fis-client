# FIS Client

Frontend for the **Faculty Information System (FIS)** — a platform for managing faculty profiles, academic contributions, research output, and institutional analytics.

Built with **React + TypeScript + Vite + Tailwind CSS**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand (with persist middleware) |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| PDF Generation | jsPDF + jsPDF-autotable |
| Fonts | Playfair Display + DM Sans (Google Fonts) |

---

## Prerequisites

- Node.js v18+
- FIS Server running on `http://localhost:3000`

---

## Setup

```bash
# install dependencies
npm install

# create environment file
cp .env.example .env
```

`.env` file:
```env
VITE_API_URL=http://localhost:3000
```

---

## Running the App

```bash
# development
npm run dev

# production build
npm run build
npm run preview
```

Client runs on `http://localhost:5173` by default.

---

## Project Structure

```
src/
├── api/                      # Axios instance + all API call functions
│   ├── axios.ts              # Base Axios config with interceptors
│   ├── auth.api.ts           # Auth endpoints
│   ├── faculty.api.ts        # Faculty profile + address endpoints
│   ├── courses.api.ts        # Faculty course records
│   ├── experiences.api.ts    # Faculty experience entries
│   ├── publications.api.ts   # Faculty publication records
│   ├── education.api.ts      # Faculty degree records
│   ├── thesis.api.ts         # Thesis & dissertation supervisions
│   ├── directory.api.ts      # Public faculty directory
│   ├── admin.api.ts          # Admin endpoints
│   ├── analytics.api.ts      # Analytics report endpoints
│   ├── published-reports.api.ts  # Admin published reports management
│   └── public-reports.api.ts # Public reports endpoints
│
├── components/               # Reusable UI components
│   ├── Navbar.tsx            # Top navbar with dropdown (change password, logout)
│   ├── AdminSidebar.tsx      # Admin dashboard sidebar navigation
│   ├── Tabs.tsx              # Horizontal tabs component
│   ├── SubTabs.tsx           # Pill-style sub-tabs (used in Experiences, Publications)
│   ├── PendingBanner.tsx     # Shown to unapproved faculty
│   ├── ChangePasswordModal.tsx   # Change own password modal
│   └── PublishReportModal.tsx    # Publish analytics report modal
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── VerifyOTPPage.tsx
│   │   └── ResetPasswordPage.tsx
│   │
│   ├── faculty/
│   │   ├── FacultyDashboard.tsx       # Shell with horizontal tabs
│   │   └── tabs/
│   │       ├── PersonalInfoTab.tsx    # Personal info + addresses
│   │       ├── AcademicProfileTab.tsx # Designation, qualification, specialization
│   │       ├── EducationTab.tsx       # Degree records (10th to PhD)
│   │       ├── CoursesTab.tsx         # Courses taught/teaching
│   │       ├── ExperiencesTab.tsx     # Teaching/industrial/research/admin experience
│   │       ├── PublicationsTab.tsx    # Journal/conference/book/book chapter
│   │       └── SupervisionTab.tsx     # Thesis & dissertation supervisions
│   │
│   ├── admin/
│   │   ├── AdminLayout.tsx            # Sidebar + outlet shell
│   │   ├── DashboardPage.tsx          # Stats overview + CSV export
│   │   ├── ApprovalsPage.tsx          # Approve/reject pending faculty
│   │   ├── FacultyListPage.tsx        # Faculty list with filters + reset password
│   │   ├── DepartmentsPage.tsx        # Department CRUD
│   │   ├── CoursesPage.tsx            # Course catalog CRUD
│   │   ├── AnalyticsPage.tsx          # Analytics shell with 8 report tabs
│   │   ├── PublishedReportsPage.tsx   # Manage published reports
│   │   └── reports/
│   │       ├── ResearchDomainsReport.tsx
│   │       ├── PublicationTrendsReport.tsx
│   │       ├── DepartmentHealthReport.tsx
│   │       ├── ResearchMomentumReport.tsx
│   │       ├── QualificationReport.tsx
│   │       ├── ExperienceProfileReport.tsx
│   │       ├── CourseLoadReport.tsx
│   │       └── SupervisionPipelineReport.tsx
│   │
│   ├── directory/
│   │   ├── DirectoryPage.tsx          # Public faculty directory with search + filters
│   │   └── PublicProfilePage.tsx      # Single faculty public profile
│   │
│   ├── reports/
│   │   ├── PublicReportsPage.tsx      # Public reports listing
│   │   └── PublicReportDetailPage.tsx # Single report with charts
│   │
│   └── LandingPage.tsx                # Public landing page
│
├── store/
│   └── auth.store.ts         # Zustand auth store (persisted to localStorage)
│
├── types/
│   └── index.ts              # Shared TypeScript interfaces
│
└── utils/
    ├── jwt.ts                # JWT decode + expiry check
    └── pdf.ts                # jsPDF download utility
```

---

## Routing

| Route | Page | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/forgot-password` | ForgotPasswordPage | Public |
| `/verify-otp` | VerifyOTPPage | Public |
| `/reset-password` | ResetPasswordPage | Public |
| `/directory` | DirectoryPage | Public |
| `/directory/:id` | PublicProfilePage | Public |
| `/reports` | PublicReportsPage | Public |
| `/reports/:id` | PublicReportDetailPage | Public |
| `/faculty/*` | FacultyDashboard | Faculty only |
| `/admin/dashboard` | DashboardPage | Admin only |
| `/admin/approvals` | ApprovalsPage | Admin only |
| `/admin/faculty` | FacultyListPage | Admin only |
| `/admin/departments` | DepartmentsPage | Admin only |
| `/admin/courses` | CoursesPage | Admin only |
| `/admin/analytics` | AnalyticsPage | Admin only |
| `/admin/published-reports` | PublishedReportsPage | Admin only |

---

## Auth Flow

1. Faculty registers → account created with `PENDING` status
2. Admin approves from `/admin/approvals`
3. Faculty logs in → JWT decoded → `status` fetched from `/auth/me`
4. If `PENDING` → dashboard shows pending banner, all tabs disabled
5. If `APPROVED` → full dashboard access

Token stored in `localStorage` via Zustand persist middleware. Axios interceptor automatically attaches it to every request. 401 responses clear token and redirect to `/login`.

---

## Faculty Dashboard Tabs

| Tab | Description |
|---|---|
| Personal Info | Name, DOB, gender, contact, ORCID, photo upload, addresses |
| Academic Profile | Designation, qualification, specialization, joining date |
| Education | Degree records from 10th to PhD with scores |
| Courses Taught | Teaching history linked to course catalog |
| Experience | Teaching / Industrial / Research / Administrative entries |
| Publications | Journal / Conference / Book / Book Chapter with DOI, indexing |
| Thesis & Dissertations | PhD thesis and PG dissertation supervision records |

---

## Admin Analytics Reports

All 8 reports available under `/admin/analytics`. Each report has:
- Interactive charts (Recharts)
- Data tables
- **Download as PDF** button (jsPDF)
- **Publish to Public Page** button (saves snapshot to DB)

| Report | Description |
|---|---|
| Research Domain Profiling | Faculty grouped by research areas |
| Publication Trends | Year-wise publication output by category and indexing |
| Department Health Score | Composite score from 5 weighted metrics |
| Faculty Research Momentum | Per-faculty score based on recency + indexing quality |
| Qualification Distribution | PhD compliance check per department (NAAC standard) |
| Experience Profile | Teaching/industrial/research experience distribution |
| Course Load Analysis | Hours per week and single-faculty course risks |
| Supervision Pipeline | Thesis/dissertation status per department |

---

## Key Design Notes

- **Landing page, directory and public reports** use inline `<style>` blocks with custom CSS (Playfair Display + DM Sans fonts, scroll animations) where Tailwind is insufficient for the design
- **Dashboard pages** use Tailwind CSS exclusively
- **`SubTabs`** component uses pill-style buttons for nested sections (Experience types, Publication types)
- **Zustand persist** stores `{ token, user, status, name }` — the entire state is persisted, no partial filter
- **Axios interceptors** handle token attachment (request) and 401 redirect (response)
- **`valueAsNumber: true`** on number inputs required to prevent Zod type mismatches with RHF

---

## Environment

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (default: `http://localhost:3000`) |
