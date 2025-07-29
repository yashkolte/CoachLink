package com.yashkolte.coachlink.backend.repository;

import com.yashkolte.coachlink.backend.entity.Coach;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoachRepository extends MongoRepository<Coach, String> {
    
    Optional<Coach> findByEmail(String email);
    Optional<Coach> findByStripeAccountId(String stripeAccountId);
}
