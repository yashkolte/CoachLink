package com.yashkolte.coachlink.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CoachLink Backend Application
 *
 * This is the main entry point for the CoachLink backend service. CoachLink is
 * a platform that helps coaches manage their Stripe Express accounts for
 * accepting payments from clients.
 *
 * Key Features: - Stripe Express account creation and management - Coach
 * onboarding flow with real-time status tracking - MongoDB Atlas integration
 * for data persistence - RESTful API with unified response structure
 *
 * @author Yash Kolte
 * @version 1.0.0
 * @since 2025-07-31
 */
@SpringBootApplication
public class BackendApplication {

    /**
     * Main method to start the Spring Boot application
     *
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
