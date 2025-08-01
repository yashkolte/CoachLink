package com.yashkolte.coachlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for coach account information responses
 *
 * This DTO is returned by the API when providing coach account information. It
 * contains all the necessary information for the frontend to determine: - Coach
 * identity and account details - Stripe account integration status - Onboarding
 * completion status - Whether the coach is registered in the system
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoachResponse {

    /**
     * Unique identifier for the coach (MongoDB ObjectId) Can be null for
     * unregistered coaches
     */
    private String id;

    /**
     * Coach's email address
     */
    private String email;

    /**
     * Coach's display name Can be null for unregistered coaches
     */
    private String name;

    /**
     * Stripe Express account ID Can be null if Stripe account hasn't been
     * created yet
     */
    private String accountId;

    /**
     * Current onboarding status Possible values: - "complete": Onboarding
     * finished, can accept payments - "incomplete": Onboarding in progress or
     * not started - "not_registered": Email not found in system
     */
    private String status;

    /**
     * Whether the coach is registered in the CoachLink system true = account
     * exists in database false = email not found, needs registration
     */
    private boolean isRegistered;
}
