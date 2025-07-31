package com.yashkolte.coachlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoachResponse {
    private String id;
    private String email;
    private String name;
    private String accountId;
    private String status;
    private boolean isRegistered;
}
