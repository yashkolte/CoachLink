package com.yashkolte.coachlink.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.model.LoginLink;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.LoginLinkCreateOnAccountParams;
import com.yashkolte.coachlink.backend.entity.Coach;
import com.yashkolte.coachlink.backend.repository.CoachRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for handling Stripe Express account operations
 * 
 * This service manages the integration between CoachLink coaches and Stripe Express accounts.
 * It handles:
 * - Creating Stripe Express accounts for coaches
 * - Generating onboarding links for account setup
 * - Checking account status and onboarding progress
 * - Creating dashboard links for account management
 * - Synchronizing Stripe account data with local database
 * 
 * All operations maintain data consistency between Stripe and MongoDB.
 */
@Service
@Slf4j
public class StripeService {

    private final CoachRepository coachRepository;

    /**
     * Stripe API secret key for authentication
     */
    @Value("${stripe.api.key}")
    private String stripeApiKey;

    /**
     * URL to redirect to if onboarding link expires
     */
    @Value("${app.onboarding.refresh.url}")
    private String refreshUrl;

    /**
     * URL to redirect to after successful onboarding completion
     */
    @Value("${app.onboarding.complete.url}")
    private String returnUrl;

    /**
     * Constructor for dependency injection
     * 
     * @param coachRepository Repository for coach data operations
     */
    public StripeService(CoachRepository coachRepository) {
        this.coachRepository = coachRepository;
    }

    /**
     * Initialize Stripe API with the configured API key
     * Called before each Stripe API operation to ensure authentication
     */
    private void initializeStripe() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Create a new Stripe Express account for a coach
     * 
     * This method:
     * 1. Creates a Stripe Express account with coach's email
     * 2. Configures account for payment transfers
     * 3. Saves or updates coach record in database
     * 4. Links Stripe account ID to coach record
     * 
     * @param email Coach's email address
     * @param name Coach's display name
     * @return Stripe account ID
     * @throws StripeException if Stripe API call fails
     */
    public String createStripeAccount(String email, String name) throws StripeException {
        initializeStripe();

        // Create Stripe Express account with transfer capabilities
        AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .setEmail(email)
                .setCountry("US") // Currently supporting US only
                .setCapabilities(
                        AccountCreateParams.Capabilities.builder()
                                .setTransfers(
                                        AccountCreateParams.Capabilities.Transfers.builder()
                                                .setRequested(true)
                                                .build()
                                )
                                .build()
                )
                .build();

        Account account = Account.create(params);

        // Create or update coach in database
        Optional<Coach> existingCoach = coachRepository.findByEmail(email);
        Coach coach;
        if (existingCoach.isPresent()) {
            // Update existing coach with new Stripe account
            coach = existingCoach.get();
            coach.setStripeAccountId(account.getId());
            coach.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new coach record
            coach = new Coach(email, name);
            coach.setStripeAccountId(account.getId());
        }

        coachRepository.save(coach);

        log.info("Created Stripe account {} for coach {}", account.getId(), email);
        return account.getId();
    }

    /**
     * Generate an onboarding link for a Stripe Express account
     * 
     * This link allows coaches to complete their Stripe account setup
     * including providing business information, bank details, and identity verification.
     * 
     * @param accountId Stripe account ID
     * @return Onboarding URL for the coach to complete setup
     * @throws StripeException if Stripe API call fails
     */
    public String generateOnboardingLink(String accountId) throws StripeException {
        initializeStripe();

        // Include account ID in the return URL for frontend handling
        String returnUrlWithAccountId = returnUrl + "?accountId=" + accountId;

        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(accountId)
                .setRefreshUrl(refreshUrl) // URL to redirect if link expires
                .setReturnUrl(returnUrlWithAccountId) // URL after completion
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();

        AccountLink accountLink = AccountLink.create(params);

        log.info("Generated onboarding link for account {}", accountId);
        return accountLink.getUrl();
    }

    /**
     * Retrieve and update account status from Stripe
     * 
     * This method:
     * 1. Fetches current account status from Stripe
     * 2. Updates local database with latest status
     * 3. Returns complete account information
     * 
     * @param accountId Stripe account ID
     * @return Stripe Account object with current status
     * @throws StripeException if Stripe API call fails
     */
    public Account getAccountStatus(String accountId) throws StripeException {
        initializeStripe();

        Account account = Account.retrieve(accountId);

        // Synchronize local database with Stripe status
        Optional<Coach> coachOpt = coachRepository.findByStripeAccountId(accountId);
        if (coachOpt.isPresent()) {
            Coach coach = coachOpt.get();
            coach.setOnboardingComplete(account.getDetailsSubmitted());
            coach.setPayoutsEnabled(account.getPayoutsEnabled());
            coach.setUpdatedAt(LocalDateTime.now());
            coachRepository.save(coach);
            log.debug("Updated coach {} status: onboarding={}, payouts={}", 
                     coach.getEmail(), account.getDetailsSubmitted(), account.getPayoutsEnabled());
        }

        return account;
    }

    /**
     * Generate a dashboard link for account management
     * 
     * This link allows coaches to access their Stripe Express dashboard
     * where they can view payments, update account details, and manage settings.
     * 
     * @param accountId Stripe account ID
     * @return Dashboard URL for account management
     * @throws StripeException if Stripe API call fails
     */
    public String generateDashboardLink(String accountId) throws StripeException {
        initializeStripe();

        LoginLinkCreateOnAccountParams params = LoginLinkCreateOnAccountParams.builder()
                .build();

        LoginLink loginLink = LoginLink.createOnAccount(accountId, params);

        log.info("Generated dashboard link for account {}", accountId);
        return loginLink.getUrl();
    }

    /**
     * Find a coach by email address
     * 
     * @param email Coach's email address
     * @return Coach entity or null if not found
     */
    public Coach getCoachByEmail(String email) {
        return coachRepository.findByEmail(email).orElse(null);
    }

    /**
     * Retrieve all coaches in the system
     * 
     * @return List of all coach entities
     */
    public List<Coach> getAllCoaches() {
        return coachRepository.findAll();
    }
}
