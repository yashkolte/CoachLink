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
import java.util.Optional;

@Service
@Slf4j
public class StripeService {

    private final CoachRepository coachRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${app.onboarding.refresh.url}")
    private String refreshUrl;

    @Value("${app.onboarding.complete.url}")
    private String returnUrl;

    public StripeService(CoachRepository coachRepository) {
        this.coachRepository = coachRepository;
    }

    private void initializeStripe() {
        Stripe.apiKey = stripeApiKey;
    }

    public String createStripeAccount(String email, String name) throws StripeException {
        initializeStripe();

        // Check if coach already exists
        Optional<Coach> existingCoach = coachRepository.findByEmail(email);
        if (existingCoach.isPresent() && existingCoach.get().getStripeAccountId() != null) {
            log.info("Coach with email {} already has Stripe account: {}", 
                    email, existingCoach.get().getStripeAccountId());
            return existingCoach.get().getStripeAccountId();
        }

        // Create Stripe Express account
        AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .setEmail(email)
                .setCountry("US")
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
        
        // Save or update coach in database
        Coach coach;
        if (existingCoach.isPresent()) {
            coach = existingCoach.get();
            coach.setStripeAccountId(account.getId());
            coach.setUpdatedAt(LocalDateTime.now());
        } else {
            coach = new Coach(email, name);
            coach.setStripeAccountId(account.getId());
        }
        
        coachRepository.save(coach);
        
        log.info("Created Stripe account {} for coach {}", account.getId(), email);
        return account.getId();
    }

    public String generateOnboardingLink(String accountId) throws StripeException {
        initializeStripe();

        // Include account ID in the return URL
        String returnUrlWithAccountId = returnUrl + "?accountId=" + accountId;

        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(accountId)
                .setRefreshUrl(refreshUrl)
                .setReturnUrl(returnUrlWithAccountId)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();

        AccountLink accountLink = AccountLink.create(params);
        
        log.info("Generated onboarding link for account {}", accountId);
        return accountLink.getUrl();
    }

    public Account getAccountStatus(String accountId) throws StripeException {
        initializeStripe();
        
        Account account = Account.retrieve(accountId);
        
        // Update coach status in database
        Optional<Coach> coachOpt = coachRepository.findByStripeAccountId(accountId);
        if (coachOpt.isPresent()) {
            Coach coach = coachOpt.get();
            coach.setOnboardingComplete(account.getDetailsSubmitted());
            coach.setPayoutsEnabled(account.getPayoutsEnabled());
            coach.setUpdatedAt(LocalDateTime.now());
            coachRepository.save(coach);
        }
        
        return account;
    }

    public String generateDashboardLink(String accountId) throws StripeException {
        initializeStripe();

        LoginLinkCreateOnAccountParams params = LoginLinkCreateOnAccountParams.builder()
                .build();

        LoginLink loginLink = LoginLink.createOnAccount(accountId, params);
        
        log.info("Generated dashboard link for account {}", accountId);
        return loginLink.getUrl();
    }

    public Coach getCoachByAccountId(String accountId) {
        return coachRepository.findByStripeAccountId(accountId).orElse(null);
    }

    public Coach getCoachByEmail(String email) {
        return coachRepository.findByEmail(email).orElse(null);
    }
}
