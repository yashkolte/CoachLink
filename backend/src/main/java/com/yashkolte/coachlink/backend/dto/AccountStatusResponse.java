package com.yashkolte.coachlink.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountStatusResponse {
    private String accountId;
    private boolean detailsSubmitted;
    private boolean payoutsEnabled;
    private boolean onboardingComplete;
}
