package com.yashkolte.coachlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for coach account creation requests
 *
 * This DTO is used when a new coach wants to create an account or register on
 * the CoachLink platform.
 *
 * Contains basic validation in the controller layer to ensure data integrity: -
 * Email must be valid format and not blank - Name must be provided and have
 * reasonable length
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoachRequest {

    /**
     * Coach's email address (required, must be valid email format) Used as the
     * primary identifier for the coach account
     */
    private String email;

    /**
     * Coach's display name (required, 2-50 characters) Used for personalization
     * and display purposes
     */
    private String name;
}
