package com.yashkolte.coachlink.backend.repository;

import com.yashkolte.coachlink.backend.entity.Coach;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Coach entity operations
 * 
 * This repository provides data access methods for managing coach records
 * in the MongoDB database. It extends MongoRepository to get basic CRUD
 * operations and defines custom query methods for business-specific lookups.
 * 
 * Custom queries:
 * - findByEmail: Lookup coach by email address (unique identifier)
 * - findByStripeAccountId: Lookup coach by their Stripe account ID
 */
@Repository
public interface CoachRepository extends MongoRepository<Coach, String> {
    
    /**
     * Find a coach by their email address
     * 
     * @param email The coach's email address
     * @return Optional containing the coach if found, empty otherwise
     */
    Optional<Coach> findByEmail(String email);
    
    /**
     * Find a coach by their Stripe account ID
     * 
     * @param stripeAccountId The Stripe Express account ID
     * @return Optional containing the coach if found, empty otherwise
     */
    Optional<Coach> findByStripeAccountId(String stripeAccountId);
}
