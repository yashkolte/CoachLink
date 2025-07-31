package com.yashkolte.coachlink.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.yashkolte.coachlink.backend.dto.AccountStatusResponse;
import com.yashkolte.coachlink.backend.dto.CreateAccountRequest;
import com.yashkolte.coachlink.backend.dto.CreateAccountResponse;
import com.yashkolte.coachlink.backend.dto.DashboardLinkResponse;
import com.yashkolte.coachlink.backend.dto.EmailCheckResponse;
import com.yashkolte.coachlink.backend.dto.OnboardingLinkRequest;
import com.yashkolte.coachlink.backend.dto.OnboardingLinkResponse;
import com.yashkolte.coachlink.backend.entity.Coach;
import com.yashkolte.coachlink.backend.service.StripeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed.origins}")
public class StripeController {

    private final StripeService stripeService;

    @PostMapping("/create-account")
    public ResponseEntity<?> createAccount(@RequestBody CreateAccountRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new CreateAccountResponse(null, null, "Email is required"));
            }

            // First, check if email already exists
            Coach existingCoach = stripeService.getCoachByEmail(request.getEmail());
            
            if (existingCoach != null && existingCoach.getStripeAccountId() != null) {
                // Coach already exists with Stripe account
                try {
                    Account account = stripeService.getAccountStatus(existingCoach.getStripeAccountId());
                    boolean isOnboardingComplete = account.getDetailsSubmitted();
                    
                    if (isOnboardingComplete) {
                        // Account exists and onboarding is complete - return existing account info
                        log.info("Email {} already has completed account, returning existing account: {}", 
                                request.getEmail(), existingCoach.getStripeAccountId());
                        return ResponseEntity.ok(new CreateAccountResponse(
                                existingCoach.getStripeAccountId(),
                                existingCoach.getId(),
                                "Account already exists and is complete"
                        ));
                    } else {
                        // Account exists but onboarding incomplete - return existing account for onboarding
                        log.info("Email {} has incomplete account, returning for onboarding: {}", 
                                request.getEmail(), existingCoach.getStripeAccountId());
                        return ResponseEntity.ok(new CreateAccountResponse(
                                existingCoach.getStripeAccountId(),
                                existingCoach.getId(),
                                "Account exists, please complete onboarding"
                        ));
                    }
                } catch (StripeException e) {
                    log.error("Failed to check account status for existing coach: {}", e.getMessage());
                    // If we can't check status, treat as incomplete and allow onboarding
                    return ResponseEntity.ok(new CreateAccountResponse(
                            existingCoach.getStripeAccountId(),
                            existingCoach.getId(),
                            "Account exists, please complete onboarding"
                    ));
                }
            }

            // Email doesn't exist, create new account
            String accountId = stripeService.createStripeAccount(request.getEmail(), request.getName());
            Coach coach = stripeService.getCoachByEmail(request.getEmail());

            return ResponseEntity.ok(new CreateAccountResponse(
                    accountId,
                    coach.getId(),
                    "Stripe account created successfully"
            ));

        } catch (StripeException e) {
            log.error("Failed to create Stripe account for email {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CreateAccountResponse(null, null, "Failed to create Stripe account: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CreateAccountResponse(null, null, "Internal server error"));
        }
    }

    @PostMapping("/generate-onboarding-link")
    public ResponseEntity<?> generateOnboardingLink(@RequestBody OnboardingLinkRequest request) {
        try {
            if (request.getAccountId() == null || request.getAccountId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new OnboardingLinkResponse("Account ID is required"));
            }

            String onboardingUrl = stripeService.generateOnboardingLink(request.getAccountId());
            return ResponseEntity.ok(new OnboardingLinkResponse(onboardingUrl));

        } catch (StripeException e) {
            log.error("Failed to generate onboarding link for account {}: {}", request.getAccountId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new OnboardingLinkResponse("Failed to generate onboarding link: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error generating onboarding link: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new OnboardingLinkResponse("Internal server error"));
        }
    }

    @GetMapping("/check-status")
    public ResponseEntity<?> checkStatus(@RequestParam String accountId) {
        try {
            if (accountId == null || accountId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AccountStatusResponse(null, false, false, false));
            }

            Account account = stripeService.getAccountStatus(accountId);

            return ResponseEntity.ok(new AccountStatusResponse(
                    accountId,
                    account.getDetailsSubmitted(),
                    account.getPayoutsEnabled(),
                    account.getDetailsSubmitted() && account.getPayoutsEnabled()
            ));

        } catch (StripeException e) {
            log.error("Failed to check status for account {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AccountStatusResponse(accountId, false, false, false));
        } catch (Exception e) {
            log.error("Unexpected error checking account status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AccountStatusResponse(accountId, false, false, false));
        }
    }

    @GetMapping("/dashboard-link")
    public ResponseEntity<?> getDashboardLink(@RequestParam String accountId) {
        try {
            if (accountId == null || accountId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new DashboardLinkResponse("Account ID is required"));
            }

            // First check if account is ready for dashboard access
            Account account = stripeService.getAccountStatus(accountId);
            if (!account.getDetailsSubmitted()) {
                return ResponseEntity.badRequest()
                        .body(new DashboardLinkResponse("Account onboarding not complete"));
            }

            String dashboardUrl = stripeService.generateDashboardLink(accountId);
            return ResponseEntity.ok(new DashboardLinkResponse(dashboardUrl));

        } catch (StripeException e) {
            log.error("Failed to generate dashboard link for account {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new DashboardLinkResponse("Failed to generate dashboard link: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error generating dashboard link: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new DashboardLinkResponse("Internal server error"));
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailRegistration(@RequestParam String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new EmailCheckResponse(false, null, "Email is required"));
            }

            Coach existingCoach = stripeService.getCoachByEmail(email);

            if (existingCoach != null && existingCoach.getStripeAccountId() != null) {
                // Check if onboarding is complete
                try {
                    Account account = stripeService.getAccountStatus(existingCoach.getStripeAccountId());
                    boolean isOnboardingComplete = account.getDetailsSubmitted();

                    return ResponseEntity.ok(new EmailCheckResponse(
                            true,
                            existingCoach.getStripeAccountId(),
                            isOnboardingComplete ? "complete" : "incomplete",
                            existingCoach.getName()
                    ));
                } catch (StripeException e) {
                    log.error("Failed to check account status for existing coach: {}", e.getMessage());
                    return ResponseEntity.ok(new EmailCheckResponse(
                            true,
                            existingCoach.getStripeAccountId(),
                            "unknown",
                            existingCoach.getName()
                    ));
                }
            } else {
                return ResponseEntity.ok(new EmailCheckResponse(false, null, "not_registered"));
            }

        } catch (Exception e) {
            log.error("Unexpected error checking email registration: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new EmailCheckResponse(false, null, "Internal server error"));
        }
    }

    @GetMapping("/list-all-coaches")
    public ResponseEntity<?> listAllCoaches() {
        try {
            // Get all coaches from database
            java.util.List<Coach> allCoaches = stripeService.getAllCoaches();
            
            java.util.List<java.util.Map<String, Object>> coachInfo = new java.util.ArrayList<>();
            
            for (Coach coach : allCoaches) {
                java.util.Map<String, Object> info = new java.util.HashMap<>();
                info.put("email", coach.getEmail());
                info.put("name", coach.getName());
                info.put("accountId", coach.getStripeAccountId());
                
                if (coach.getStripeAccountId() != null) {
                    try {
                        Account account = stripeService.getAccountStatus(coach.getStripeAccountId());
                        info.put("onboardingComplete", account.getDetailsSubmitted());
                        info.put("payoutsEnabled", account.getPayoutsEnabled());
                        info.put("status", account.getDetailsSubmitted() ? "complete" : "incomplete");
                    } catch (StripeException e) {
                        info.put("status", "error_checking_stripe");
                        info.put("error", e.getMessage());
                    }
                } else {
                    info.put("status", "no_stripe_account");
                }
                
                coachInfo.add(info);
            }
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("totalCoaches", allCoaches.size());
            response.put("coaches", coachInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error listing all coaches: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to retrieve coaches"));
        }
    }
}
