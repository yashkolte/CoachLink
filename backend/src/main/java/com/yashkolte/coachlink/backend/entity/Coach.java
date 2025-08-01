package com.yashkolte.coachlink.backend.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

/**
 * Coach Entity representing a coach in the CoachLink platform
 * 
 * This entity stores information about coaches who use the platform
 * to manage their Stripe Express accounts for payment processing.
 * 
 * The entity tracks:
 * - Basic coach information (email, name)
 * - Stripe account integration details
 * - Onboarding and payout status
 * - Audit timestamps for creation and updates
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coaches")
public class Coach {
    
    /**
     * Unique identifier for the coach (MongoDB ObjectId)
     */
    @Id
    private String id;
    
    /**
     * Coach's email address (used as unique identifier)
     * Indexed for fast lookups during authentication and account verification
     */
    @Indexed(unique = true)
    private String email;
    
    /**
     * Coach's display name
     */
    private String name;
    
    /**
     * Stripe Express account ID
     * Links the coach to their Stripe account for payment processing
     */
    private String stripeAccountId;
    
    /**
     * Whether the coach has completed Stripe onboarding
     * true = can accept payments, false = needs to complete onboarding
     */
    private Boolean onboardingComplete;
    
    /**
     * Whether payouts are enabled on the Stripe account
     * true = can receive payouts, false = payouts disabled
     */
    private Boolean payoutsEnabled;
    
    /**
     * Timestamp when the coach record was created
     */
    private LocalDateTime createdAt;
    
    /**
     * Timestamp when the coach record was last updated
     */
    private LocalDateTime updatedAt;
    
    /**
     * Constructor for creating a new coach with email and name
     * Initializes default values for new coach accounts
     * 
     * @param email Coach's email address
     * @param name Coach's display name
     */
    public Coach(String email, String name) {
        this.email = email;
        this.name = name;
        this.onboardingComplete = false;
        this.payoutsEnabled = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
