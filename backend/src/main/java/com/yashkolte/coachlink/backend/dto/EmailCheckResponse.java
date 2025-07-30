package com.yashkolte.coachlink.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailCheckResponse {
    private boolean isRegistered;
    private String accountId;
    private String status;
    private String name;

    public EmailCheckResponse(boolean isRegistered, String accountId, String status) {
        this.isRegistered = isRegistered;
        this.accountId = accountId;
        this.status = status;
        this.name = null;
    }
}
