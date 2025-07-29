# 📄 REQUIREMENT.md

## 🧠 Objective
Build a **Stripe Express Connected Account Onboarding Flow** for a two-sided marketplace app called **CoachLink**, using **Spring Boot** for the backend and **Next.js** for the frontend.

---

## 🏗️ Project Overview

CoachLink is a marketplace that connects freelance fitness coaches with corporate clients. Coaches should be able to:
- Sign up on the platform
- Be redirected to Stripe’s Express onboarding flow
- Return to the platform after onboarding
- Revisit onboarding if needed (expired session)
- Get a Stripe-hosted dashboard link once setup is complete

---

## 🧱 Tech Stack

- Backend: Spring Boot (Java 17+, Maven/Gradle)
- Frontend: Next.js (React, TypeScript)
- Payment: Stripe Connect (Express accounts)
- Auth (optional): Auth0
- DB: (Optional) MOngoDB for storing `stripe_account_id`

---

## ✅ Required Features (Step-by-Step)

### 1. [BACKEND] Create Stripe Connected Account API
- Endpoint: `POST /api/stripe/create-account`
- Input: coach email (optional if already stored in user session)
- Action: Create a Stripe Express account
- Output: Stripe `account.id` (store in DB)

---

### 2. [BACKEND] Generate Onboarding Link
- Endpoint: `POST /api/stripe/generate-onboarding-link`
- Input: `accountId` from step 1
- Action:
  - Use Stripe’s `accountLinks.create`
  - Set:
    - `refresh_url = https://coachlink.app/onboarding/refresh`
    - `return_url = https://coachlink.app/onboarding/complete`
    - `type = account_onboarding`
- Output: Onboarding URL

---

### 3. [FRONTEND] Coach Sign-Up and Redirect to Stripe
- UI: A sign-up form for coaches
- On success, call:
  1. `create-account` to create Stripe account
  2. `generate-onboarding-link` to get URL
  3. Redirect user to onboarding URL

---

### 4. [FRONTEND] Handle Onboarding Return
- Page: `/onboarding/complete`
- Action:
  - Call backend: `GET /api/stripe/check-status?accountId=...`
  - Backend checks: `account.details_submitted`
  - If complete → proceed to dashboard or show success
  - If not → show error or retry prompt

---

### 5. [FRONTEND] Handle Onboarding Refresh
- Page: `/onboarding/refresh`
- UI message: "Your onboarding session expired. Please retry."
- Option to regenerate onboarding link and redirect again

---

### 6. [BACKEND] Check Onboarding Status API
- Endpoint: `GET /api/stripe/check-status?accountId=...`
- Action:
  - Retrieve Stripe account
  - Return `details_submitted` and `payouts_enabled` flags

---

### 7. [BACKEND] Generate Express Dashboard Link
- Endpoint: `GET /api/stripe/dashboard-link?accountId=...`
- Action: Use `accounts.createLoginLink(accountId)`
- Output: Link to coach's Stripe Express dashboard

---

## 🛡️ Bonus: Webhooks (Optional but Recommended)

### [BACKEND] Stripe Webhook Listener
- Endpoint: `POST /api/stripe/webhook`
- Handle events:
  - `account.updated` → update status in DB
  - `account.application.authorized` (if using OAuth)
- Use webhook secret to verify signature

---

## 🧪 Development Notes

- Use Stripe test mode during development
- Use a test email like `jenny.rosen@example.com`
- Local setup:
  - Backend: `http://localhost:8080`
  - Frontend: `http://localhost:3000`

---

## 📁 Folder Structure Recommendation

```

/coachlink
├── backend/
│   ├── controllers/StripeController.java
│   ├── services/StripeService.java
│   ├── StripeWebhookController.java
│   └── config/CorsConfig.java
└── frontend/
    ├── app/
    │   ├── onboarding/
    │   │   ├── refresh/
    │   │   │   └── page.tsx         # Expired onboarding session
    │   │   ├── complete/
    │   │   │   └── page.tsx         # Returned from Stripe onboarding
    │   ├── dashboard/
    │   │   └── page.tsx             # Coach dashboard
    │   ├── layout.tsx               # (optional) App-wide layout
    │   └── page.tsx                 # Home or landing page
    └── lib/
        └── stripe.ts                # Stripe helper (previously stripeClient.ts)


```

---

## 🔚 Final Deliverables

- [ ] Spring Boot backend with 4 API endpoints
- [ ] Stripe webhook handler (optional)
- [ ] Next.js frontend with onboarding flow UI
- [ ] Status tracking and dashboard integration
- [ ] Codebase ready for deployment

---