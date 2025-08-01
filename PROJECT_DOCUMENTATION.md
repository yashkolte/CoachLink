# CoachLink Project Documentation

## Table of Contents
1. [Project Vision and Goals](#project-vision-and-goals)
2. [Technical Architecture Deep Dive](#technical-architecture-deep-dive)
3. [Design Decisions and Rationale](#design-decisions-and-rationale)
4. [Database Schema and Design](#database-schema-and-design)
5. [API Design Philosophy](#api-design-philosophy)
6. [Security Implementation](#security-implementation)
7. [Performance Optimizations](#performance-optimizations)
8. [Development Workflow](#development-workflow)
9. [Future Enhancements](#future-enhancements)
10. [Lessons Learned](#lessons-learned)

## Project Vision and Goals

### Primary Objectives
The CoachLink platform was designed with the following core objectives:

1. **Seamless Coach Onboarding**: Create a frictionless experience for coaches to join the platform and start receiving payments
2. **Payment Integration**: Provide direct payment capabilities through Stripe Express, ensuring coaches maintain control over their earnings
3. **Scalable Architecture**: Build a foundation that can support thousands of coaches and their clients
4. **Security First**: Implement robust security measures to protect financial and personal data
5. **Developer Experience**: Create maintainable, well-documented code that facilitates future development

### Target Users
- **Coaches**: Professionals offering coaching services who need payment processing capabilities
- **Clients**: Individuals seeking coaching services with secure payment options
- **Administrators**: Platform managers who need oversight and management capabilities

## Technical Architecture Deep Dive

### Architecture Patterns Used

#### 1. **Model-View-Controller (MVC) Pattern**
- **Model**: Entity classes (`Coach.java`) represent data structure
- **View**: Next.js frontend handles presentation layer
- **Controller**: REST controllers (`StripeController.java`) manage request/response flow

#### 2. **Repository Pattern**
```java
// Clean separation of data access logic
@Repository
public interface CoachRepository extends MongoRepository<Coach, String> {
    Optional<Coach> findByEmail(String email);
    Optional<Coach> findByStripeAccountId(String stripeAccountId);
}
```

#### 3. **Service Layer Pattern**
```java
// Business logic encapsulation
@Service
public class StripeService {
    // All Stripe-related business logic centralized here
}
```

#### 4. **Data Transfer Object (DTO) Pattern**
```java
// Request/Response objects separate from entities
public record CoachRequest(String email, String name) {}
public record CoachResponse(String id, String email, String name, 
                          String stripeAccountId, String onboardingStatus, boolean isRegistered) {}
```

### Microservice Readiness
Although currently a monolith, the architecture is designed for easy microservice extraction:

- **Clear Service Boundaries**: Each service class handles a specific domain
- **Stateless Design**: Controllers don't maintain state between requests
- **External Configuration**: All dependencies configured externally
- **API-First Approach**: Well-defined REST interfaces

## Design Decisions and Rationale

### 1. **Why Spring Boot 3.5.4?**
- **Latest Features**: Access to virtual threads and modern Java features
- **Security Updates**: Regular security patches and improvements
- **Performance**: Improved startup time and memory usage
- **Ecosystem**: Rich ecosystem of starter dependencies

### 2. **Why MongoDB Atlas over SQL?**
- **Schema Flexibility**: Coach profiles may evolve with different fields
- **Horizontal Scaling**: Easier to scale across multiple regions
- **JSON-Native**: Natural fit for REST API JSON responses
- **Cloud-Native**: Managed service reduces operational overhead

### 3. **Why Stripe Express?**
- **Compliance**: Stripe handles PCI compliance automatically
- **Global Reach**: Support for international payments and currencies
- **Direct Payouts**: Coaches receive money directly to their accounts
- **White-label**: Maintains platform branding while providing payment services

### 4. **Why Next.js 15?**
- **Server-Side Rendering**: Better SEO and initial page load performance
- **TypeScript Support**: Built-in TypeScript support for type safety
- **App Router**: Modern routing with nested layouts
- **Performance**: Built-in optimizations for images, fonts, and JavaScript

### 5. **Unified API Response Format**
```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String timestamp;
}
```

**Why this approach?**
- **Consistency**: All API responses follow the same structure
- **Error Handling**: Standardized error response format
- **Frontend Simplification**: Frontend can handle all responses uniformly
- **Debugging**: Timestamps help with debugging and monitoring

## Database Schema and Design

### Coach Entity Design

```java
@Document(collection = "coaches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coach {
    @Id
    private String id;                    // MongoDB ObjectId
    
    @Indexed(unique = true)
    private String email;                 // Unique email for login/identification
    
    private String name;                  // Display name
    private String stripeAccountId;       // Stripe Express account ID
    private Boolean onboardingComplete;   // Onboarding status
    private LocalDateTime createdAt;      // Account creation timestamp
    private LocalDateTime updatedAt;      // Last update timestamp
}
```

### Indexing Strategy

#### 1. **Email Index**
```java
@Indexed(unique = true)
private String email;
```
- **Purpose**: Fast email lookups and duplicate prevention
- **Type**: Unique index
- **Performance**: O(log n) lookup time instead of O(n) table scan

#### 2. **Stripe Account ID Index**
```java
// Implicit index for frequent Stripe API correlations
private String stripeAccountId;
```
- **Purpose**: Quick lookups when processing Stripe webhooks
- **Consideration**: Added programmatically based on query patterns

### Data Consistency Strategy

#### 1. **Eventual Consistency with Stripe**
- **Challenge**: Stripe account status changes aren't immediately reflected
- **Solution**: Periodic synchronization jobs and real-time status checks
- **Implementation**: `getAccountStatus()` method fetches live data from Stripe

#### 2. **Optimistic Concurrency**
- **Approach**: Use MongoDB's atomic operations for updates
- **Example**: Updating onboarding status only if current state matches expected

## API Design Philosophy

### RESTful Principles

#### 1. **Resource-Based URLs**
```
GET    /api/coaches/check-email      # Check resource existence
POST   /api/coaches/create-account   # Create new resource
GET    /api/coaches/check-status     # Read resource state
POST   /api/coaches/generate-onboarding-link  # Action on resource
```

#### 2. **HTTP Method Semantics**
- **GET**: Safe, idempotent operations (status checks)
- **POST**: Non-idempotent operations (account creation, link generation)
- **PUT**: Idempotent updates (future user profile updates)
- **DELETE**: Resource removal (future account deletion)

#### 3. **Status Code Usage**
```java
// Success cases
return ResponseEntity.ok(ApiResponse.success(data));

// Client errors
return ResponseEntity.badRequest()
    .body(ApiResponse.error("Invalid input"));

// Server errors
return ResponseEntity.internalServerError()
    .body(ApiResponse.error("Internal server error"));
```

### API Versioning Strategy

#### Current Approach: URL Versioning
```
/api/v1/coaches/create-account  # Future versioning
/api/coaches/create-account     # Current approach
```

#### Why No Versioning Yet?
- **Early Stage**: API is still evolving rapidly
- **Breaking Changes**: Easier to implement without version constraints
- **Client Control**: Single frontend client simplifies coordination

#### Future Versioning Plan:
1. **URL Versioning**: `/api/v2/coaches` for major changes
2. **Header Versioning**: `Accept: application/vnd.coachlink.v2+json`
3. **Deprecation Strategy**: 6-month deprecation window for old versions

## Security Implementation

### 1. **Input Validation**

#### Controller Level Validation
```java
@PostMapping("/create-account")
public ResponseEntity<ApiResponse<CoachResponse>> createAccount(
    @Valid @RequestBody CoachRequest request) {
    
    // @Valid triggers validation annotations
    if (request.email() == null || request.email().trim().isEmpty()) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Email is required"));
    }
}
```

#### Entity Level Validation
```java
@Email(message = "Invalid email format")
@NotBlank(message = "Email is required")
private String email;

@NotBlank(message = "Name is required")
@Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
private String name;
```

### 2. **CORS Configuration**

#### Development vs Production
```java
// Development: Specific origins
.allowedOrigins("http://localhost:3000")

// Production: Environment-specific origins
.allowedOrigins("${cors.allowed.origins}")
```

#### Security Headers
```java
configuration.setAllowCredentials(true);  // Enable auth cookies
configuration.setAllowedHeaders(List.of("*"));  // Control allowed headers
```

### 3. **Stripe Security**

#### API Key Management
```java
@Value("${stripe.api.key}")
private String stripeApiKey;

// Keys stored in environment variables, never in code
```

#### Webhook Signature Verification
```java
// Future implementation for webhook security
public boolean verifyWebhookSignature(String payload, String signature) {
    return Webhook.constructEvent(payload, signature, webhookSecret) != null;
}
```

### 4. **Data Protection**

#### Sensitive Data Handling
```java
// Never log sensitive information
log.info("Creating account for coach: {}", request.getEmail()); // Email is OK
// log.info("Stripe key: {}", stripeApiKey); // NEVER do this
```

#### Database Security
- **Connection Encryption**: All MongoDB Atlas connections use TLS
- **Authentication**: Database requires username/password authentication
- **Network Security**: IP whitelist restricts database access

## Performance Optimizations

### 1. **Database Performance**

#### Connection Pooling
```java
.applyToConnectionPoolSettings(builder -> {
    builder.maxSize(20)              // Maximum connections
            .minSize(5)               // Minimum connections maintained
            .maxWaitTime(10, TimeUnit.SECONDS)        // Connection wait timeout
            .maxConnectionIdleTime(120, TimeUnit.SECONDS)  // Idle timeout
            .maxConnectionLifeTime(120, TimeUnit.SECONDS); // Connection lifetime
})
```

#### Query Optimization
```java
// Index usage for common queries
Optional<Coach> findByEmail(String email);  // Uses email index
Optional<Coach> findByStripeAccountId(String stripeAccountId);  // Future index
```

### 2. **API Performance**

#### Response Optimization
```java
// Lightweight DTOs instead of full entities
public record CoachResponse(
    String id, 
    String email, 
    String name, 
    String stripeAccountId, 
    String onboardingStatus, 
    boolean isRegistered
) {}
```

#### Caching Strategy (Future)
```java
// Future implementation
@Cacheable(value = "coaches", key = "#email")
public Coach getCoachByEmail(String email) {
    return coachRepository.findByEmail(email).orElse(null);
}
```

### 3. **Stripe API Optimization**

#### Minimize API Calls
```java
// Cache account status temporarily
private final Map<String, CachedAccountStatus> statusCache = new ConcurrentHashMap<>();

public Account getAccountStatus(String accountId) {
    // Check cache first, then call Stripe API
    CachedAccountStatus cached = statusCache.get(accountId);
    if (cached != null && cached.isValid()) {
        return cached.getAccount();
    }
    
    // Fetch from Stripe and cache
    Account account = stripeApiCall(accountId);
    statusCache.put(accountId, new CachedAccountStatus(account));
    return account;
}
```

## Development Workflow

### 1. **Code Organization**

#### Package Structure
```
com.yashkolte.coachlink.backend/
├── controller/          # REST endpoints
├── service/            # Business logic
├── repository/         # Data access
├── model/             # Entities and DTOs
├── config/            # Configuration classes
└── exception/         # Custom exceptions (future)
```

#### Naming Conventions
- **Classes**: PascalCase (`StripeController`, `CoachService`)
- **Methods**: camelCase (`createAccount`, `generateOnboardingLink`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`, `MAX_RETRIES`)
- **Packages**: lowercase (`controller`, `service`, `model`)

### 2. **Documentation Standards**

#### JavaDoc Requirements
```java
/**
 * Brief description of the class or method
 * 
 * Detailed explanation of what this does, including:
 * - Purpose and context
 * - Important behavior notes
 * - Usage examples if complex
 * 
 * @param paramName Description of parameter
 * @return Description of return value
 * @throws ExceptionType When this exception is thrown
 * @since Version when this was added
 * @author Author name
 */
```

#### Code Comments
```java
// Inline comments for complex logic
if (account.getDetailsSubmitted()) {
    // Account is fully onboarded and can receive payments
    log.info("Existing coach {} has completed onboarding", request.getEmail());
    return ResponseEntity.ok(ApiResponse.success("Account already exists and is complete", response));
}
```

### 3. **Testing Strategy**

#### Unit Tests
```java
@Test
void createAccount_WithValidEmail_ShouldCreateCoach() {
    // Given
    CoachRequest request = new CoachRequest("test@example.com", "Test Coach");
    
    // When
    ResponseEntity<ApiResponse<CoachResponse>> response = stripeController.createAccount(request);
    
    // Then
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().isSuccess()).isTrue();
}
```

#### Integration Tests
```java
@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/test",
    "stripe.api.key=sk_test_fake_key"
})
class StripeControllerIntegrationTest {
    // Test with real Spring context but test database
}
```

## Future Enhancements

### 1. **Short-term Improvements (Next 3 months)**

#### Authentication and Authorization
```java
@PreAuthorize("hasRole('COACH')")
@GetMapping("/dashboard-link")
public ResponseEntity<ApiResponse<Map<String, String>>> getDashboardLink() {
    // Only authenticated coaches can access their dashboard
}
```

#### Enhanced Error Handling
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(StripeException.class)
    public ResponseEntity<ApiResponse<Void>> handleStripeException(StripeException e) {
        // Centralized Stripe error handling
    }
}
```

### 2. **Medium-term Features (3-6 months)**

#### Coach Profiles and Services
```java
@Document(collection = "coach_profiles")
public class CoachProfile {
    private String coachId;
    private String bio;
    private List<String> specializations;
    private List<Service> services;
    private BigDecimal hourlyRate;
}
```

#### Client Management
```java
@Document(collection = "clients")
public class Client {
    private String id;
    private String email;
    private String name;
    private List<String> coachIds;
}
```

#### Booking System
```java
@Document(collection = "bookings")
public class Booking {
    private String id;
    private String coachId;
    private String clientId;
    private LocalDateTime scheduledTime;
    private BookingStatus status;
    private BigDecimal amount;
}
```

### 3. **Long-term Vision (6+ months)**

#### Analytics and Reporting
- Coach performance metrics
- Revenue tracking and reporting
- Platform usage analytics

#### Multi-tenant Architecture
- Support for coaching organizations
- White-label platform capabilities
- Custom branding options

#### Mobile Application
- React Native mobile app
- Push notifications for bookings
- Mobile payment processing

## Lessons Learned

### 1. **Technical Decisions**

#### What Worked Well
- **Stripe Integration**: Express accounts provided exactly the functionality needed
- **MongoDB Flexibility**: Schema-less design allowed rapid iteration
- **Spring Boot**: Rapid development with minimal configuration
- **TypeScript**: Caught many potential runtime errors during development

#### What Could Be Improved
- **Error Handling**: More granular error types needed for better user experience
- **Testing**: Earlier implementation of comprehensive test suite
- **Documentation**: Real-time documentation updates during development
- **Monitoring**: Earlier implementation of logging and monitoring

### 2. **Development Process**

#### Effective Practices
- **API-First Design**: Designing API contracts before implementation
- **Incremental Development**: Building and testing one feature at a time
- **Code Reviews**: Thorough review of all changes
- **Documentation**: Comprehensive code documentation from the start

#### Areas for Improvement
- **Test-Driven Development**: Earlier adoption of TDD practices
- **Performance Testing**: Load testing from early stages
- **Security Review**: Regular security audits and penetration testing
- **User Feedback**: Earlier integration of user feedback loops

### 3. **Architectural Insights**

#### Scalability Considerations
- **Database Sharding**: Plan for horizontal scaling of MongoDB
- **Caching Strategy**: Implement Redis for session and data caching
- **Load Balancing**: Design for multiple application instances
- **Microservices**: Plan service boundaries for future decomposition

#### Integration Challenges
- **Stripe Webhooks**: Handle webhook reliability and ordering
- **Data Consistency**: Manage consistency between Stripe and local data
- **Rate Limiting**: Implement rate limiting for Stripe API calls
- **Error Recovery**: Implement retry mechanisms for external service failures

### 4. **Business Logic Evolution**

#### Current Assumptions
- **Single Coach Type**: All coaches follow the same onboarding process
- **Simple Pricing**: Basic Stripe integration without complex pricing models
- **English Only**: Single language support

#### Future Considerations
- **Multiple Coach Types**: Different onboarding flows for different coach categories
- **Complex Pricing**: Subscription models, packages, and dynamic pricing
- **Internationalization**: Multi-language and multi-currency support
- **Compliance**: GDPR, CCPA, and other regulatory requirements

## Conclusion

The CoachLink platform represents a solid foundation for a coaching marketplace with integrated payment processing. The architecture prioritizes maintainability, security, and scalability while providing a seamless user experience for both coaches and clients.

The technical decisions made during development balance current needs with future flexibility, ensuring the platform can evolve as requirements change. The comprehensive documentation and well-structured codebase facilitate future development and maintenance.

Key success factors include the robust Stripe integration, flexible MongoDB schema, and modern Spring Boot architecture. Areas for future improvement include enhanced error handling, comprehensive testing, and advanced monitoring capabilities.

This documentation serves as both a technical reference and a guide for future development, ensuring knowledge preservation and facilitating team collaboration as the project grows.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Authors**: Yash Kolte  
**Review Cycle**: Quarterly updates recommended
