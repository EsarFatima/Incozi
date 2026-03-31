# Incozi

**Incozi** is a full-stack business services web platform built for a chartered accountant client. It enables clients to browse, book, and pay for professional services — including US company incorporation, tax compliance, bookkeeping, and consultations — while giving the firm an admin dashboard to manage everything.
<img width="1895" height="875" alt="image" src="https://github.com/user-attachments/assets/de4c03b2-ff8f-4b36-9d92-526aaef84eec" />

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Payment Gateway](#payment-gateway)
- [Deployment](#deployment)

---

## Features

### Client-Facing
- **Service Catalog** — Browse and learn about Incorporation, Tax Compliance, Bookkeeping, and Consultation services with pricing
- **Booking / Consultations** — Schedule consultations with date and time selection
- **Cart & Checkout** — Add services to a cart and pay via AsaanPay payment gateway
- **Subscription Management** — View and manage active service plans
- **Real-time Chat** — Direct messaging between clients and the firm
- **Document Upload** — Securely upload and retrieve client documents stored in Supabase Storage
- **User Dashboard** — Overview of bookings, subscriptions, and documents
- **User Profile** — Account settings and booking history
- **Blog & FAQ** — Informational articles and frequently asked questions
- **Newsletter Subscription** — Email sign-up form
- **Contact Form** — Sends notification to admin and acknowledgement to client via email

### Admin
- **Admin Dashboard** — Stats overview: clients, bookings, subscriptions, payments
- **Client Management** — View and manage user accounts
- **Consultation Management** — Review, update, and close booking requests
- **Order / Subscription Tracking** — Monitor active and completed subscriptions
- **Payment Oversight** — Transaction logs and revenue tracking
- **Document Management** — Upload and review client documents
- **Admin Chat** — Respond to client messages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via [Supabase](https://supabase.com) |
| File Storage | Supabase Storage |
| Authentication | JWT (`jsonwebtoken`) + password hashing (`bcryptjs`) |
| Email | Nodemailer (SMTP) |
| Payment | AsaanPay payment gateway |
| Deployment | [Vercel](https://vercel.com) |

---

## Project Structure

```
Incozi/
├── index.html              # Homepage
├── style.css               # Global stylesheet
├── script.js               # Global frontend JavaScript
├── server.js               # Express application entry point
├── vercel.json             # Vercel deployment config
├── package.json
├── .env                    # Environment variables (not committed)
│
├── pages/                  # All HTML pages
│   ├── incorporation.html
│   ├── tax-compliance.html
│   ├── bookkeeping.html
│   ├── consultation.html
│   ├── dashboard.html
│   ├── my-services.html
│   ├── checkout.html
│   ├── cart.html
│   ├── profile.html
│   ├── account.html
│   ├── blog.html
│   ├── faq.html
│   ├── admin.html
│   ├── admin-bookings.html
│   ├── admin-clients.html
│   ├── admin-payments.html
│   ├── admin-documents.html
│   ├── admin-chat.html
│   └── ...
│
├── backend/                # Server-side modules
│   ├── auth.js             # Registration, login, password reset
│   ├── admin.js            # Admin-only routes (stats, client management)
│   ├── consultations.js    # Booking/consultation CRUD
│   ├── dashboard.js        # Dashboard data aggregation
│   ├── documents.js        # Document metadata routes
│   ├── payments.js         # Checkout and payment verification
│   ├── services.js         # Service catalog routes
│   ├── chat.js             # Chat messaging routes
│   ├── emailService.js     # Nodemailer email templates
│   ├── paymentService.js   # AsaanPay gateway adapter
│   ├── supabaseClient.js   # Supabase client initialisation
│   ├── middleware.js        # JWT auth middleware + admin guard
│   └── migrations/         # SQL migration scripts
│
└── assets/                 # Images, icons, uploads
    └── images/
        └── services/       # Service-specific images
```

---

## Pages

| URL | Description |
|---|---|
| `/index.html` | Homepage |
| `/pages/incorporation.html` | US Company Incorporation service |
| `/pages/tax-compliance.html` | Tax & Compliance service |
| `/pages/bookkeeping.html` | Bookkeeping service |
| `/pages/consultation.html` | Book a consultation |
| `/pages/cart.html` | Shopping cart |
| `/pages/checkout.html` | Checkout / payment |
| `/pages/dashboard.html` | Client dashboard |
| `/pages/my-services.html` | Active subscriptions and services |
| `/pages/profile.html` | User profile settings |
| `/pages/account.html` | Login / Register |
| `/pages/blog.html` | Blog listing |
| `/pages/faq.html` | Frequently Asked Questions |
| `/pages/admin.html` | Admin dashboard |
| `/pages/admin-bookings.html` | Manage bookings |
| `/pages/admin-clients.html` | Manage clients |
| `/pages/admin-payments.html` | Payment logs |
| `/pages/admin-documents.html` | Document management |
| `/pages/admin-chat.html` | Admin chat interface |

---

## API Endpoints

All API routes are served under `/api/`.

### Auth — `/api/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive a JWT |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password with token |

### Services — `/api/services`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all services |
| GET | `/:id` | Get a single service |

### Consultations — `/api/consultations` *(auth required)*

| Method | Path | Description |
|---|---|---|
| GET | `/` | List user's consultations |
| POST | `/` | Book a new consultation |
| PUT | `/:id` | Update consultation status |

### Payments — `/api/payments`

| Method | Path | Description |
|---|---|---|
| POST | `/checkout` | Initiate payment via AsaanPay |
| POST | `/verify-status` | Verify and activate a payment |

### Dashboard — `/api/dashboard` *(auth required)*

| Method | Path | Description |
|---|---|---|
| GET | `/` | Aggregated dashboard data for the logged-in user |

### Documents — `/api/documents` *(auth required)*

| Method | Path | Description |
|---|---|---|
| POST | `/upload` | Upload documents (up to 10 files, 5 MB each) |
| GET | `/my-documents` | List user's uploaded documents with signed URLs |

### Chat — `/api/chat` *(auth required)*

| Method | Path | Description |
|---|---|---|
| GET | `/` | Get chat messages |
| POST | `/` | Send a message |

### Admin — `/api/admin` *(auth + admin role required)*

| Method | Path | Description |
|---|---|---|
| GET | `/stats` | Platform statistics |
| GET | `/subscribers` | Newsletter subscriber list |

### Misc

| Method | Path | Description |
|---|---|---|
| POST | `/api/subscribe` | Newsletter sign-up |
| POST | `/api/contact` | Contact form submission |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A [Supabase](https://supabase.com) project with the schema applied (see [Database](#database))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/EsarFatima/Incozi.git
cd Incozi

# 2. Install dependencies
npm install

# 3. Create .env and fill in your values (see Environment Variables below)

# 4. Start the development server (auto-reload)
npm run dev

# 5. Open in browser
# http://localhost:3000/index.html
```

For production:

```bash
npm start
```

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# Server
PORT=3000
BASE_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key

# JSON Web Token
JWT_SECRET=your-strong-jwt-secret

# SMTP / Email (e.g. Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Incozi
ADMIN_EMAIL=admin@yourdomain.com

# AsaanPay Payment Gateway
ASAAN_MERCHANT_ID=your-merchant-id
```

> **Gmail tip:** Enable 2-factor authentication on your Google account, then generate an [App Password](https://support.google.com/accounts/answer/185833) to use as `SMTP_PASS`.

---

## Database

Incozi uses **Supabase** (hosted PostgreSQL) as its database and file storage backend.

### Setup

1. Create a new project on [supabase.com](https://supabase.com).
2. Run the main schema file in the Supabase SQL editor:
   ```
   setup_supabase.sql
   ```
3. Apply any incremental migrations found in `backend/migrations/` in filename date order.

### Key Tables

| Table | Description |
|---|---|
| `users` | Client and admin accounts |
| `services` | Available service offerings |
| `plans` | Pricing plans linked to services |
| `subscriptions` | Client subscriptions / orders |
| `payments` | Payment transaction log |
| `consultations` | Booked consultation requests |
| `documents` | Metadata for uploaded files |
| `messages` | Chat messages |
| `subscribers` | Newsletter email list |
| `contacts` | Contact form submissions |

### File Storage

Uploaded documents are stored in a Supabase Storage bucket named **`documents`**, organised as `user_uploads/{userId}/{filename}`. Signed URLs (valid for 1 hour) are generated on each retrieval request.

---

## Payment Gateway

Payments are processed through **AsaanPay** (aggregator redirect model):

1. The backend calls AsaanPay with the order amount and ID and receives a hosted payment link.
2. The user is redirected to complete payment on AsaanPay's page.
3. After returning, the frontend polls `/api/payments/verify-status` to confirm and activate the subscription.

> **Development / simulation mode:** If `ASAAN_MERCHANT_ID` is not set, the gateway is simulated — payments are auto-approved and users are redirected to the success page without hitting the real API.

To go live, obtain your Merchant ID from [AsaanPay](https://assanpay.com) and set it in `.env`.

---

## Deployment

The project is pre-configured for **Vercel** via `vercel.json`. All `/api/*` requests are rewritten to the serverless entry point.

```bash
# Deploy with the Vercel CLI
vercel --prod
```

Make sure all environment variables from the [Environment Variables](#environment-variables) section are also added in your Vercel project settings under **Settings → Environment Variables**.
