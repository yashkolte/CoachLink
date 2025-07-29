package com.yashkolte.coachlink.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountResponse {
    private String accountId;
    private String coachId;
    private String message;
}
