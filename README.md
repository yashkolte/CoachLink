# CoachLink - Coaching Platform with Stripe Integration

## Project Overview

CoachLink is a modern coaching platform that connects coaches with clients through a seamless web application. The platform integrates with Stripe Express to enable coaches to receive payments directly, while providing a smooth onboarding experience for both coaches and clients.

## 🏗️ Architecture

### Technology Stack

**Backend (Spring Boot)**

- **Framework**: Spring Boot 3.5.4
- **Language**: Java 21
- **Database**: MongoDB Atlas
- **Payment Processing**: Stripe Express API
- **Build Tool**: Maven
- **Documentation**: Lombok for code generation

**Frontend (Next.js)**

- **Framework**: Next.js 15.4.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with modern design

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Spring Boot   │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Atlas         │
│   (Port 3000)   │    │   (Port 8080)   │    │   (Cloud)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │   Stripe        │
                       │   Express API   │
                       └─────────────────┘
```

## 🚀 Features

### Core Functionality

- **Coach Registration**: Seamless onboarding with Stripe Express integration
- **Payment Processing**: Direct payment capabilities through Stripe
- **Account Management**: Dashboard access for coaches to manage their accounts
- **Status Tracking**: Real-time onboarding and account status monitoring

### API Endpoints

- `POST /api/coaches/create-account` - Create new coach account
- `POST /api/coaches/generate-onboarding-link` - Generate Stripe onboarding link
- `GET /api/coaches/check-status` - Check account onboarding status
- `GET /api/coaches/dashboard-link` - Generate dashboard access link
- `GET /api/coaches/check-email` - Verify email registration status

## 📦 Project Structure

```
CoachLink/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/yashkolte/coachlink/backend/
│   │   ├── BackendApplication.java           # Main application entry point
│   │   ├── controller/
│   │   │   └── StripeController.java         # REST API endpoints
│   │   ├── service/
│   │   │   └── StripeService.java           # Business logic layer
│   │   ├── repository/
│   │   │   └── CoachRepository.java         # Data access layer
│   │   ├── model/
│   │   │   ├── Coach.java                   # Coach entity
│   │   │   ├── CoachRequest.java            # Request DTO
│   │   │   ├── CoachResponse.java           # Response DTO
│   │   │   └── ApiResponse.java             # Unified API response
│   │   └── config/
│   │       ├── MongoConfig.java             # MongoDB configuration
│   │       └── CorsConfig.java              # CORS configuration
│   ├── src/main/resources/
│   │   └── application.properties           # Application configuration
│   └── pom.xml                             # Maven dependencies
├── frontend/                   # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx                      # Root layout component
│   │   ├── page.tsx                        # Home page
│   │   └── globals.css                     # Global styles
│   ├── package.json                        # NPM dependencies
│   └── next.config.ts                      # Next.js configuration
└── README.md                              # Project documentation
```

## 🛠️ Setup and Installation

### Prerequisites

- **Java 21** or higher
- **Node.js 18** or higher
- **MongoDB Atlas** account
- **Stripe** account with Express platform access
- **Maven** (or use included wrapper)

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CoachLink/backend
   ```

2. **Configure application properties**

   ```properties
   # Server Configuration
   server.port=8080

   # MongoDB Configuration (Replace with your Atlas URI)
   spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/coachlink

   # Stripe Configuration (Replace with your keys)
   stripe.api.key=sk_test_your_stripe_secret_key
   stripe.webhook.secret=whsec_your_webhook_secret

   # CORS Configuration
   cors.allowed.origins=http://localhost:3000

   # Application URLs
   app.frontend.url=http://localhost:3000
   app.onboarding.refresh.url=${app.frontend.url}/onboarding/refresh
   app.onboarding.complete.url=${app.frontend.url}/onboarding/complete
   ```

3. **Build and run the backend**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

**Backend (application.properties)**
| Variable | Description | Example |
|----------|-------------|---------|
| `spring.data.mongodb.uri` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `stripe.api.key` | Stripe secret key | `sk_test_...` |
| `stripe.webhook.secret` | Stripe webhook secret | `whsec_...` |
| `cors.allowed.origins` | Allowed CORS origins | `http://localhost:3000` |

**Frontend (.env.local)**
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` |

### Database Configuration

The application uses MongoDB Atlas with the following collections:

- **coaches**: Stores coach information and Stripe account details

Indexes:

- `email`: Unique index for fast email lookups and duplicate prevention

### Stripe Configuration

The application uses Stripe Express accounts which allow coaches to:

- Receive payments directly to their bank accounts
- Access a dedicated dashboard for payment management
- Handle KYC (Know Your Customer) requirements automatically

## 🔄 API Documentation

### Coach Management API

#### Create Coach Account

```http
POST /api/coaches/create-account
Content-Type: application/json

{
  "email": "coach@example.com",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": "coach_id",
    "email": "coach@example.com",
    "name": "John Doe",
    "stripeAccountId": "acct_...",
    "onboardingStatus": "incomplete",
    "isRegistered": true
  }
}
```

#### Generate Onboarding Link

```http
POST /api/coaches/generate-onboarding-link
Content-Type: application/json

{
  "accountId": "acct_stripe_account_id"
}
```

#### Check Account Status

```http
GET /api/coaches/check-status?accountId=acct_stripe_account_id
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
./mvnw test
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment

1. Build the JAR file: `./mvnw clean package`
2. Deploy to your preferred platform (AWS, Heroku, etc.)
3. Update environment variables for production

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update API URL environment variable

## 🔐 Security Considerations

### Backend Security

- **CORS**: Configured to allow specific origins only
- **SSL/TLS**: MongoDB connections use encrypted SSL
- **Input Validation**: All API endpoints validate input parameters
- **Error Handling**: Sensitive information is not exposed in error messages

### Stripe Security

- **Webhook Signatures**: All webhook events are verified
- **API Keys**: Secret keys are stored securely in environment variables
- **Express Accounts**: Coaches' financial data is isolated in their own Stripe accounts

## 📊 Monitoring and Logging

### Application Logging

- **SLF4J with Logback**: Structured logging throughout the application
- **Log Levels**: Appropriate log levels for different environments
- **Error Tracking**: Comprehensive error logging for debugging

### Database Monitoring

- **MongoDB Atlas**: Built-in monitoring and alerting
- **Connection Pooling**: Optimized connection management
- **Performance Metrics**: Database query performance tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 Code Style and Standards

### Backend (Java)

- **Lombok**: Used for reducing boilerplate code
- **JavaDoc**: Comprehensive documentation for all public methods
- **Spring Boot Best Practices**: Following Spring Boot conventions
- **Error Handling**: Consistent error response format

### Frontend (TypeScript)

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting for consistency
- **Component Structure**: Modular and reusable components

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**

- Check MongoDB Atlas connection string
- Verify Stripe API keys are valid
- Ensure Java 21 is installed

**CORS Errors**

- Verify `cors.allowed.origins` in application.properties
- Check frontend is running on the correct port

**Stripe Integration Issues**

- Verify Stripe account has Express platform enabled
- Check webhook endpoints are properly configured
- Ensure API keys match the correct Stripe account

## 📞 Support

For questions or issues:

1. Check the troubleshooting section above
2. Review the code documentation
3. Create an issue in the repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Author**: Yash Kolte  
**Version**: 1.0  
**Last Updated**: 2024
