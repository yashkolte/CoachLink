package com.yashkolte.coachlink.backend.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Account;
import com.stripe.net.Webhook;
import com.yashkolte.coachlink.backend.entity.Coach;
import com.yashkolte.coachlink.backend.repository.CoachRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/stripe")
@Slf4j
public class StripeWebhookController {

    private final CoachRepository coachRepository;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    public StripeWebhookController(CoachRepository coachRepository) {
        this.coachRepository = coachRepository;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            
            log.info("Received Stripe webhook event: {}", event.getType());
            
            // Handle the event
            switch (event.getType()) {
                case "account.updated":
                    handleAccountUpdated(event);
                    break;
                case "account.application.authorized":
                    handleAccountApplicationAuthorized(event);
                    break;
                default:
                    log.info("Unhandled event type: {}", event.getType());
            }
            
            return ResponseEntity.ok("Webhook handled successfully");
            
        } catch (SignatureVerificationException e) {
            log.error("Invalid webhook signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook processing failed");
        }
    }

    private void handleAccountUpdated(Event event) {
        try {
            Account account = (Account) event.getDataObjectDeserializer().getObject().orElse(null);
            if (account == null) {
                log.warn("Account object is null in account.updated event");
                return;
            }

            String accountId = account.getId();
            Optional<Coach> coachOpt = coachRepository.findByStripeAccountId(accountId);
            
            if (coachOpt.isPresent()) {
                Coach coach = coachOpt.get();
                coach.setOnboardingComplete(account.getDetailsSubmitted());
                coach.setPayoutsEnabled(account.getPayoutsEnabled());
                coach.setUpdatedAt(LocalDateTime.now());
                coachRepository.save(coach);
                
                log.info("Updated coach {} - onboarding: {}, payouts: {}", 
                        coach.getEmail(), 
                        account.getDetailsSubmitted(), 
                        account.getPayoutsEnabled());
            } else {
                log.warn("No coach found for Stripe account ID: {}", accountId);
            }
            
        } catch (Exception e) {
            log.error("Error handling account.updated event: {}", e.getMessage());
        }
    }

    private void handleAccountApplicationAuthorized(Event event) {
        try {
            Account account = (Account) event.getDataObjectDeserializer().getObject().orElse(null);
            if (account == null) {
                log.warn("Account object is null in account.application.authorized event");
                return;
            }

            String accountId = account.getId();
            Optional<Coach> coachOpt = coachRepository.findByStripeAccountId(accountId);
            
            if (coachOpt.isPresent()) {
                Coach coach = coachOpt.get();
                coach.setUpdatedAt(LocalDateTime.now());
                coachRepository.save(coach);
                
                log.info("Account application authorized for coach {}", coach.getEmail());
            } else {
                log.warn("No coach found for Stripe account ID: {}", accountId);
            }
            
        } catch (Exception e) {
            log.error("Error handling account.application.authorized event: {}", e.getMessage());
        }
    }
}
