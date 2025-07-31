package com.yashkolte.coachlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailCheckResponse {

    private boolean isRegistered;
    private String accountId;
    private String status;
    private String name;

    // Constructor for cases without name
    public EmailCheckResponse(boolean isRegistered, String accountId, String status) {
        this.isRegistered = isRegistered;
        this.accountId = accountId;
        this.status = status;
        this.name = null;
    }
}
