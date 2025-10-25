# PayItForward 🤠

> Digital tanda/ROSCA platform with collaborative credit building - A RowdyHacks 2025 Project

## Overview

PayItForward is a digital version of informal lending circles (tandas/ROSCAs) common in immigrant communities. Groups of 10-20 people contribute monthly; each month, one member receives the full pot. Our platform handles automated scheduling, payment tracking, and builds credit history for unbanked users.

**Theme:** "Pioneer Credit Union" - Building financial trust on the frontier

## Problem Statement

Immigrant and underbanked communities often rely on informal lending circles (known as tandas in Latin America, ROSCAs in other cultures) to access credit and build financial security. These systems work on trust but lack:
- Transparency and automated tracking
- Credit history building
- Fraud protection
- Easy onboarding for new members

## Solution

A secure, collaborative platform that:
- ✅ Digitizes the tanda/ROSCA process with automated tracking
- ✅ Implements collaborative vouching (group members vouch for newcomers)
- ✅ Builds credit scores based on contribution history
- ✅ Uses AI to detect fraud patterns and assess risk
- ✅ Provides SMS-based authentication for low-tech users

## Track Alignment

### Swivel Challenge ✅
- **Underserved Communities:** Serves underbanked immigrants and unbanked populations
- **Money Management:** Facilitates safe group savings and lending
- **Collaboration Feature:** Group members vouch for new members, co-sign for accountability

### Auth0 ✅
- Passwordless SMS authentication for low-tech users
- Identity verification with document scanning
- Role-based access control (admin, member, pending)

### Cloudflare ✅
- Cloudflare Pages for frontend hosting
- Cloudflare Workers for automated payment scheduling
- DDoS protection for financial application
- Edge caching for performance

### Vultr ✅
- VM hosting for Node.js backend
- PostgreSQL database with encryption
- Secure infrastructure for financial data

### Space Cowboy Theme 🚀
- "Pioneer Credit Union" narrative - settlers building trust on the financial frontier
- Western-themed UI with frontier aesthetics
- "Wagon Circle" terminology for lending groups

## Tech Stack

### Frontend
- **Framework:** Vue.js 3 with Vite
- **Styling:** Tailwind CSS (custom space western theme)
- **Charts:** Chart.js for credit score visualization
- **Deployment:** Cloudflare Pages

### Backend
- **Runtime:** Node.js with Express
- **Database:** PostgreSQL (Vultr-hosted)
- **API:** RESTful architecture
- **Authentication:** Auth0 JWT validation

### Infrastructure
- **IaC:** Terraform for Vultr provisioning
- **Automation:** Cloudflare Workers for scheduled tasks
- **CI/CD:** GitHub Actions (optional)

### AI & Services
- **AI:** Google Gemini API for fraud detection and risk scoring
- **Auth:** Auth0 with SMS passwordless
- **Payments:** Mock payment gateway (demo purposes)

## Core Features

### 1. User Authentication
- SMS passwordless login via Auth0
- Multi-language support for immigrant communities
- Profile management with optional government ID verification

### 2. Circle Management
- Create lending circles with custom rules
- Invite members via unique codes
- Set contribution amounts and payout schedules
- Circle admin controls

### 3. Collaborative Vouching
- Existing members vouch for new applicants
- AI-powered risk assessment of new members
- Minimum vouch threshold for approval
- Reputation system based on vouching accuracy

### 4. Payment Tracking
- Automated contribution reminders
- Mock payment integration for demo
- Payment history and upcoming schedule
- Automated payout distribution

### 5. Credit Building
- Credit score calculation based on payment history
- Visualization of trust building over time
- Exportable credit reports
- Milestone achievements

### 6. AI Fraud Detection
- Gemini API analyzes payment patterns
- Flags suspicious behavior (missed payments, duplicate accounts)
- Risk scoring for new member applications
- Predictive analytics for circle health

## Project Structure

```
rowdyhacks_25/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Database models
│   │   ├── middleware/  # Auth, validation
│   │   └── services/    # External APIs (Auth0, Gemini)
│   ├── db/              # Database migrations
│   └── package.json
│
├── frontend/            # Vue.js application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── views/       # Page views
│   │   ├── router/      # Vue Router config
│   │   ├── stores/      # Pinia state management
│   │   └── assets/      # Images, styles
│   └── package.json
│
├── terraform/           # Infrastructure as Code
│   ├── main.tf         # Vultr VM + PostgreSQL
│   ├── variables.tf
│   └── outputs.tf
│
├── cloudflare-worker/   # Automated scheduling
│   └── payment-scheduler.js
│
└── docs/               # Additional documentation
```

## Database Schema

### Users
- id, auth0_id, phone_number, name, created_at
- credit_score, profile_verified, language_preference

### Circles
- id, name, admin_id, monthly_amount, total_members
- current_cycle, next_payout_date, status

### Circle_Members
- id, circle_id, user_id, join_date, status (active/pending)
- position_in_cycle, has_received_payout

### Payments
- id, circle_id, user_id, amount, payment_date
- cycle_number, status (pending/completed/failed)

### Vouches
- id, circle_id, voucher_id, vouchee_id
- timestamp, status (approved/rejected)

### Credit_History
- id, user_id, event_type, impact, timestamp
- description

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Terraform
- Auth0 account
- Vultr account
- Cloudflare account
- Google Cloud account (for Gemini API)

### Environment Variables

Create `.env` files in both `backend/` and `frontend/`:

**Backend `.env`:**
```env
PORT=3000
DATABASE_URL=postgresql://user:pass@vultr-host:5432/payitforward
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
GEMINI_API_KEY=your-gemini-key
CLOUDFLARE_WORKER_URL=https://worker.yourname.workers.dev
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
```

### Installation

1. **Clone and install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Provision infrastructure:**
```bash
cd terraform
terraform init
terraform apply
```

3. **Run database migrations:**
```bash
cd backend
npm run migrate
```

4. **Start development servers:**
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

## Demo Scenarios

### 1. New User Onboarding
- User receives SMS with verification code
- Creates profile with basic info
- Requests to join an existing circle
- Existing members vouch for user
- AI analyzes risk and approves

### 2. Monthly Contribution Cycle
- All members receive SMS reminder
- Members make contributions via mock payment
- System tracks payments in real-time
- Designated member receives full payout
- Credit scores update automatically

### 3. AI Fraud Detection
- User attempts to join multiple circles with same identity
- AI flags suspicious pattern
- Circle admins receive alert
- System prevents duplicate membership

### 4. Credit Score Visualization
- Dashboard shows credit score growth
- Timeline of positive actions (on-time payments, vouching)
- Comparison to circle average
- Exportable credit report PDF

## Team & Timeline

**Development Time:** 36 hours (RowdyHacks hackathon)

**Implementation Phases:**
1. Infrastructure Setup (4 hours)
2. Authentication & User Management (6 hours)
3. Circle Management (8 hours)
4. Payment System (6 hours)
5. AI & Credit Building (4 hours)
6. Cloudflare Workers (2 hours)
7. Theming & Polish (3 hours)
8. Testing & Demo Prep (3 hours)

## Future Enhancements

- Real payment integration (Stripe, Plaid)
- Mobile app (React Native)
- Multi-currency support
- Integration with credit bureaus
- Loan products built on circle history
- Insurance products for circle defaults

## License

MIT License - Built for RowdyHacks 2025

## Acknowledgments

- Swivel for the challenge inspiring financial inclusion
- Auth0, Cloudflare, and Vultr for platform sponsorship
- Immigrant communities using tandas/ROSCAs worldwide

---

**Built with ❤️ for the underserved and underbanked**
