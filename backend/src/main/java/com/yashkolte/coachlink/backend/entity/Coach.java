package com.yashkolte.coachlink.backend.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coaches")
public class Coach {
    
    @Id
    private String id;
    
    private String email;
    private String name;
    private String stripeAccountId;
    private Boolean onboardingComplete;
    private Boolean payoutsEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Coach(String email, String name) {
        this.email = email;
        this.name = name;
        this.onboardingComplete = false;
        this.payoutsEnabled = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
