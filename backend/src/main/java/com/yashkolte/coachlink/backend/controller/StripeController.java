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

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed.origins}")
public class StripeController {

    private final StripeService stripeService;

    @PostMapping("/create-account")
    public ResponseEntity<ApiResponse<CoachResponse>> createAccount(@RequestBody CoachRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is required"));
            }

            // Check if email already exists
            Coach existingCoach = stripeService.getCoachByEmail(request.getEmail());
            
            if (existingCoach != null && existingCoach.getStripeAccountId() != null) {
                // Check current account status from Stripe
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
                    return ResponseEntity.ok(ApiResponse.success("Account already exists and is complete", response));
                } else {
                    return ResponseEntity.ok(ApiResponse.success("Account exists, please complete onboarding", response));
                }
            }

            // Create new account
            stripeService.createStripeAccount(request.getEmail(), request.getName());
            Coach coach = stripeService.getCoachByEmail(request.getEmail());

            CoachResponse response = new CoachResponse(
                coach.getId(),
                coach.getEmail(),
                coach.getName(),
                coach.getStripeAccountId(),
                "incomplete",
                true
            );

            return ResponseEntity.ok(ApiResponse.success("Account created successfully", response));

        } catch (StripeException e) {
            log.error("Failed to create Stripe account: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to create Stripe account: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    @PostMapping("/generate-onboarding-link")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateOnboardingLink(@RequestBody Map<String, String> request) {
        try {
            String accountId = request.get("accountId");
            if (accountId == null || accountId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Account ID is required"));
            }

            String onboardingUrl = stripeService.generateOnboardingLink(accountId);
            return ResponseEntity.ok(ApiResponse.success(Map.of("onboardingUrl", onboardingUrl)));

        } catch (StripeException e) {
            log.error("Failed to generate onboarding link: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to generate onboarding link"));
        }
    }

    @GetMapping("/check-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkStatus(@RequestParam String accountId) {
        try {
            Account account = stripeService.getAccountStatus(accountId);
            Map<String, Object> status = Map.of(
                "accountId", accountId,
                "detailsSubmitted", account.getDetailsSubmitted(),
                "payoutsEnabled", account.getPayoutsEnabled(),
                "onboardingComplete", account.getDetailsSubmitted()
            );
            
            return ResponseEntity.ok(ApiResponse.success(status));

        } catch (StripeException e) {
            log.error("Failed to check account status: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to check account status"));
        }
    }

    @GetMapping("/dashboard-link")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDashboardLink(@RequestParam String accountId) {
        try {
            String dashboardUrl = stripeService.generateDashboardLink(accountId);
            return ResponseEntity.ok(ApiResponse.success(Map.of("dashboardUrl", dashboardUrl)));

        } catch (StripeException e) {
            log.error("Failed to generate dashboard link: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to generate dashboard link"));
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<CoachResponse>> checkEmail(@RequestParam String email) {
        try {
            Coach coach = stripeService.getCoachByEmail(email);
            
            if (coach == null) {
                CoachResponse response = new CoachResponse(null, email, null, null, "not_registered", false);
                return ResponseEntity.ok(ApiResponse.success(response));
            }

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
            log.error("Failed to check email: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to check email"));
        }
    }
}
