package com.yashkolte.coachlink.backend.controller;

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
import com.yashkolte.coachlink.backend.dto.ApiResponse;
import com.yashkolte.coachlink.backend.dto.CoachRequest;
import com.yashkolte.coachlink.backend.dto.CoachResponse;
import com.yashkolte.coachlink.backend.entity.Coach;
import com.yashkolte.coachlink.backend.service.StripeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * REST Controller for Stripe Express account operations
 * 
 * This controller handles all Stripe-related operations for coaches:
 * - Account creation and registration
 * - Onboarding link generation
 * - Account status checking
 * - Dashboard link generation
 * - Email verification
 * 
 * All endpoints return responses wrapped in ApiResponse<T> for consistency.
 * CORS is enabled for frontend integration.
 */
@RestController
@RequestMapping("/api/coaches")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class StripeController {

    private final StripeService stripeService;

    /**
     * Create or retrieve a coach's Stripe Express account
     * 
     * This endpoint handles both new account creation and existing account lookup.
     * It returns different responses based on the account's onboarding status:
     * - New accounts: Creates Stripe account and returns incomplete status
     * - Existing complete accounts: Returns complete status for dashboard redirect
     * - Existing incomplete accounts: Returns incomplete status for onboarding continuation
     * 
     * @param request Coach's registration information (email and name)
     * @return ApiResponse containing coach account information and status
     */
    @PostMapping("/create-account")
    public ResponseEntity<ApiResponse<CoachResponse>> createAccount(@RequestBody CoachRequest request) {
        try {
            log.info("Processing account creation request for email: {}", request.getEmail());

            // Check if email already exists in system
            Coach existingCoach = stripeService.getCoachByEmail(request.getEmail());
            
            if (existingCoach != null && existingCoach.getStripeAccountId() != null) {
                // Fetch real-time status from Stripe for existing accounts
                Account account = stripeService.getAccountStatus(existingCoach.getStripeAccountId());
                
                CoachResponse response = new CoachResponse(
                    existingCoach.getId(),
                    existingCoach.getEmail(),
                    existingCoach.getName(),
                    existingCoach.getStripeAccountId(),
                    account.getDetailsSubmitted() ? "complete" : "incomplete",
                    true
                );
                
                if (account.getDetailsSubmitted()) {
                    log.info("Existing coach {} has completed onboarding", request.getEmail());
                    return ResponseEntity.ok(ApiResponse.success("Account already exists and is complete", response));
                } else {
                    log.info("Existing coach {} needs to complete onboarding", request.getEmail());
                    return ResponseEntity.ok(ApiResponse.success("Account exists, please complete onboarding", response));
                }
            }

            // Create new Stripe Express account for new coach
            log.info("Creating new Stripe account for coach: {}", request.getEmail());
            stripeService.createStripeAccount(request.getEmail(), request.getName());
            Coach coach = stripeService.getCoachByEmail(request.getEmail());

            CoachResponse response = new CoachResponse(
                coach.getId(),
                coach.getEmail(),
                coach.getName(),
                coach.getStripeAccountId(),
                "incomplete", // New accounts always start as incomplete
                true
            );

            return ResponseEntity.ok(ApiResponse.success("Account created successfully", response));

        } catch (StripeException e) {
            log.error("Stripe API error during account creation for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to create Stripe account: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during account creation for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * Generate an onboarding link for Stripe account setup
     * 
     * This endpoint creates a temporary link that allows coaches to complete
     * their Stripe Express account onboarding process, including:
     * - Business information
     * - Bank account details
     * - Identity verification
     * 
     * @param request Map containing the Stripe account ID
     * @return ApiResponse containing the onboarding URL
     */
    @PostMapping("/generate-onboarding-link")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateOnboardingLink(@RequestBody Map<String, String> request) {
        try {
            String accountId = request.get("accountId");
            if (accountId == null || accountId.trim().isEmpty()) {
                log.warn("Onboarding link request missing account ID");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Account ID is required"));
            }

            log.info("Generating onboarding link for account: {}", accountId);
            String onboardingUrl = stripeService.generateOnboardingLink(accountId);
            return ResponseEntity.ok(ApiResponse.success(Map.of("onboardingUrl", onboardingUrl)));

        } catch (StripeException e) {
            log.error("Failed to generate onboarding link for account {}: {}", request.get("accountId"), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to generate onboarding link"));
        }
    }

    /**
     * Check the current status of a Stripe Express account
     * 
     * This endpoint retrieves real-time account information from Stripe,
     * including onboarding completion status and payout availability.
     * It also updates the local database with the latest status.
     * 
     * @param accountId Stripe account ID to check
     * @return ApiResponse containing account status information
     */
    @GetMapping("/check-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkStatus(@RequestParam String accountId) {
        try {
            log.info("Checking status for Stripe account: {}", accountId);
            Account account = stripeService.getAccountStatus(accountId);
            
            Map<String, Object> status = Map.of(
                "accountId", accountId,
                "detailsSubmitted", account.getDetailsSubmitted(),
                "payoutsEnabled", account.getPayoutsEnabled(),
                "onboardingComplete", account.getDetailsSubmitted()
            );
            
            return ResponseEntity.ok(ApiResponse.success(status));

        } catch (StripeException e) {
            log.error("Failed to check account status for {}: {}", accountId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to check account status"));
        }
    }

    /**
     * Generate a dashboard link for Stripe Express account management
     * 
     * This endpoint creates a temporary link that allows coaches to access
     * their Stripe Express dashboard where they can:
     * - View payment history
     * - Update account settings
     * - Manage business information
     * - View payout details
     * 
     * @param accountId Stripe account ID
     * @return ApiResponse containing the dashboard URL
     */
    @GetMapping("/dashboard-link")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDashboardLink(@RequestParam String accountId) {
        try {
            log.info("Generating dashboard link for account: {}", accountId);
            String dashboardUrl = stripeService.generateDashboardLink(accountId);
            return ResponseEntity.ok(ApiResponse.success(Map.of("dashboardUrl", dashboardUrl)));

        } catch (StripeException e) {
            log.error("Failed to generate dashboard link for {}: {}", accountId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to generate dashboard link"));
        }
    }

    /**
     * Check if an email address is registered in the system
     * 
     * This endpoint verifies whether a coach with the given email exists
     * in the database and returns their current registration and onboarding status.
     * Used by the frontend to determine the appropriate user flow.
     * 
     * @param email Email address to check
     * @return ApiResponse containing coach information or unregistered status
     */
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<CoachResponse>> checkEmail(@RequestParam String email) {
        try {
            log.info("Checking email registration status: {}", email);
            Coach coach = stripeService.getCoachByEmail(email);
            
            if (coach == null) {
                // Email not registered in system
                CoachResponse response = new CoachResponse(null, email, null, null, "not_registered", false);
                return ResponseEntity.ok(ApiResponse.success(response));
            }

            // Email is registered, return current status
            CoachResponse response = new CoachResponse(
                coach.getId(),
                coach.getEmail(),
                coach.getName(),
                coach.getStripeAccountId(),
                coach.getOnboardingComplete() ? "complete" : "incomplete",
                true
            );
            
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Failed to check email {}: {}", email, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to check email"));
        }
    }
}
