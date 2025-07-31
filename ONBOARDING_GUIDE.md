# CoachLink - Stripe Express Account Onboarding Flow

## Overview
Simple and streamlined onboarding experience for fitness coaches to set up their Stripe Express accounts and start receiving payments through the CoachLink marketplace.

## 🚀 Quick Start

### Backend (Port 8080)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

### Access the Onboarding Flow
Visit: **http://localhost:3000/coach-onboarding**

## 📋 Onboarding Process

### Step 1: Sign Up / Sign In
- Enter email address (required)
- Enter full name (required for new accounts)
- System checks if email already exists

### Step 2: Account Creation
- If new user: Creates Stripe Express account automatically
- If existing user: Retrieves existing account status

### Step 3: Stripe Onboarding
- Redirects to Stripe's hosted onboarding flow
- Coach completes required business information
- Stripe handles verification and compliance

### Step 4: Return & Verification
- Coach returns to CoachLink automatically
- System verifies onboarding completion
- Generates dashboard access link

### Step 5: Dashboard Access
- Coach can access Stripe Express dashboard
- Dashboard shows payment settings, payouts, reports
- Ready to receive payments from corporate clients

## 🔧 Technical Implementation

### Backend Features
- **Email Validation**: Prevents duplicate account creation
- **Account Status Tracking**: Monitors onboarding progress
- **Stripe Integration**: Full Express account management
- **MongoDB Storage**: Persistent coach data storage
- **Error Handling**: Graceful fallbacks and error recovery

### Frontend Features
- **Progressive UI**: Step-by-step guided experience
- **Real-time Feedback**: Loading states and progress indicators
- **Smart Routing**: Automatic navigation based on account status
- **Mobile Responsive**: Works on all device sizes

### Database Architecture
- **Primary**: MongoDB Atlas (Cloud)
- **Fallback**: In-memory database for reliability
- **Collections**: Coaches with Stripe account relationships

## 🎯 Key Features

### For New Coaches
1. **Quick Setup**: Enter email + name → Ready in minutes
2. **Guided Process**: Clear steps with visual progress
3. **No Technical Knowledge Required**: Stripe handles complexity
4. **Instant Access**: Dashboard available immediately after completion

### For Returning Coaches
1. **Smart Detection**: Automatic account recognition
2. **Status Awareness**: Knows if onboarding is complete
3. **Direct Access**: Skip to dashboard if already set up
4. **Resume Capability**: Continue incomplete onboarding

### For Platform (CoachLink)
1. **No Duplicate Accounts**: Email-based validation
2. **Complete Audit Trail**: All actions logged
3. **Stripe Compliance**: Meets all regulatory requirements
4. **Scalable Architecture**: Ready for production traffic

## 📊 Database Schema

### Coach Entity
```java
@Document(collection = "coaches")
public class Coach {
    @Id
    private String id;                    // Coach ID
    private String name;                  // Coach full name
    private String email;                 // Email address (unique)
    private String stripeAccountId;       // Stripe Express account ID
    private String stripeAccountStatus;   // complete, pending, etc.
    private LocalDateTime createdAt;      // Account creation time
    private LocalDateTime updatedAt;      // Last update time
}
```

## 🔗 API Endpoints

### POST `/api/stripe/create-account`
Creates new Stripe Express account or returns existing

### POST `/api/stripe/generate-onboarding-link`
Generates Stripe onboarding URL with return handling

### GET `/api/stripe/check-status`
Checks current onboarding and account status

### GET `/api/stripe/dashboard-link`
Generates Stripe Express dashboard access URL

### GET `/api/stripe/check-email`
Validates if email is already registered

## 🌟 Success Flow Example

1. **New Coach "Sarah"** visits `/coach-onboarding`
2. Enters email: `sarah@fitnessstudio.com` and name: "Sarah Johnson"
3. System creates Stripe Express account automatically
4. Sarah clicks "Complete Payment Setup" → Redirected to Stripe
5. Sarah completes business information on Stripe's secure form
6. Sarah returns to CoachLink → Account verified as complete
7. Sarah clicks "Open Stripe Dashboard" → Can manage payments
8. **Ready to receive payments from corporate clients!**

## 🔄 Return User Flow Example

1. **Existing Coach "Mike"** visits `/coach-onboarding`
2. Enters email: `mike@personaltrainer.com`
3. System recognizes account and checks status
4. If complete: Direct access to dashboard
5. If incomplete: Resume onboarding where left off

## 🛡️ Error Handling

- **MongoDB Connection Issues**: Automatic fallback to in-memory database
- **Stripe API Errors**: User-friendly error messages with retry options
- **Network Issues**: Graceful degradation and retry mechanisms
- **Invalid Data**: Client-side and server-side validation

## 📱 Mobile Support

The onboarding flow is fully responsive and works seamlessly on:
- Desktop browsers
- Mobile phones (iOS/Android)
- Tablets
- Progressive Web App (PWA) compatible

## 🚀 Production Ready

This implementation includes:
- **Security**: HTTPS, CORS, input validation
- **Performance**: Optimized API calls, caching
- **Monitoring**: Comprehensive logging
- **Scalability**: Database connection pooling, async processing
- **Compliance**: Stripe handles all financial regulations

---

**Ready to onboard coaches and scale your fitness marketplace!** 🎯
