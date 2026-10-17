package com.backend.dto;

import com.backend.document.PaymentTransaction;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

public final class PaymentDtos {

    private PaymentDtos() {
    }

    public record PlanDto(String id, String name, int credits, long priceCents, String currency,
                          List<String> features, boolean recommended) {
    }

    public record CheckoutRequest(@NotBlank String planId) {
    }

    public record CheckoutResponse(String checkoutUrl, String sessionId, boolean demoMode) {
    }

    public record VerifyPaymentRequest(@NotBlank String sessionId) {
    }

    public record VerifyPaymentResponse(boolean success, int credits, String message) {
    }

    public record TransactionDto(String id, String planName, long amountCents, String currency, int credits,
                                 PaymentTransaction.Status status, Instant createdAt) {

        public static TransactionDto from(PaymentTransaction tx) {
            return new TransactionDto(tx.getId(), tx.getPlanName(), tx.getAmountCents(), tx.getCurrency(),
                    tx.getCredits(), tx.getStatus(), tx.getCreatedAt());
        }
    }
}
