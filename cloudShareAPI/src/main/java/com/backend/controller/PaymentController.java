package com.backend.controller;

import com.backend.dto.PaymentDtos.CheckoutRequest;
import com.backend.dto.PaymentDtos.CheckoutResponse;
import com.backend.dto.PaymentDtos.PlanDto;
import com.backend.dto.PaymentDtos.TransactionDto;
import com.backend.dto.PaymentDtos.VerifyPaymentRequest;
import com.backend.dto.PaymentDtos.VerifyPaymentResponse;
import com.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/plans")
    public List<PlanDto> plans() {
        return paymentService.plans();
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@AuthenticationPrincipal String userId, @Valid @RequestBody CheckoutRequest request) {
        return paymentService.createCheckout(userId, request.planId());
    }

    @PostMapping("/verify")
    public VerifyPaymentResponse verify(@AuthenticationPrincipal String userId,
                                        @Valid @RequestBody VerifyPaymentRequest request) {
        return paymentService.verify(userId, request.sessionId());
    }

    @GetMapping("/transactions")
    public List<TransactionDto> transactions(@AuthenticationPrincipal String userId) {
        return paymentService.transactions(userId);
    }
}
