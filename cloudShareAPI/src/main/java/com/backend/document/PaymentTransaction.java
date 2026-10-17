package com.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payment_transactions")
public class PaymentTransaction {

    public enum Status { PENDING, SUCCESS, FAILED }

    @Id
    private String id;

    @Indexed
    private String userId;

    private String planId;
    private String planName;
    private long amountCents;
    private String currency;
    private int credits;
    private Status status;

    @Indexed(unique = true, sparse = true)
    private String providerSessionId;

    private Instant createdAt;
}
