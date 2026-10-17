package com.backend.service;

import com.backend.config.AppProperties;
import com.backend.document.PaymentTransaction;
import com.backend.document.UserDocument;
import com.backend.dto.PaymentDtos.CheckoutResponse;
import com.backend.dto.PaymentDtos.PlanDto;
import com.backend.dto.PaymentDtos.TransactionDto;
import com.backend.dto.PaymentDtos.VerifyPaymentResponse;
import com.backend.exception.ApiException;
import com.backend.repository.PaymentTransactionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Credit packs are bought through Stripe Checkout. When no Stripe key is configured the service runs in
 * demo mode: checkout returns straight to the success page and verification adds the credits.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String DEMO_PREFIX = "demo_";

    private final AppProperties props;
    private final PaymentTransactionRepository transactionRepository;
    private final UserService userService;
    private final MongoTemplate mongoTemplate;

    public List<PlanDto> plans() {
        String currency = props.stripe().currency();
        return List.of(
                new PlanDto("basic", "Basic", 50, 500, currency,
                        List.of("50 file uploads", "Public share links", "Credits never expire"), false),
                new PlanDto("premium", "Premium", 200, 1500, currency,
                        List.of("200 file uploads", "Public share links", "Credits never expire", "Best value"), true),
                new PlanDto("ultimate", "Ultimate", 600, 3500, currency,
                        List.of("600 file uploads", "Public share links", "Credits never expire", "For teams"), false));
    }

    public CheckoutResponse createCheckout(String userId, String planId) {
        PlanDto plan = plans().stream().filter(p -> p.id().equals(planId)).findFirst()
                .orElseThrow(() -> ApiException.badRequest("Unknown plan: " + planId));
        UserDocument user = userService.getById(userId);

        String sessionId;
        String checkoutUrl;
        boolean demo = !props.stripe().enabled();
        if (demo) {
            sessionId = DEMO_PREFIX + UUID.randomUUID();
            checkoutUrl = props.frontendUrl() + "/payment/success?session_id=" + sessionId;
        } else {
            Session session = createStripeSession(user, plan);
            sessionId = session.getId();
            checkoutUrl = session.getUrl();
        }

        transactionRepository.save(PaymentTransaction.builder()
                .userId(userId)
                .planId(plan.id())
                .planName(plan.name())
                .amountCents(plan.priceCents())
                .currency(plan.currency())
                .credits(plan.credits())
                .status(PaymentTransaction.Status.PENDING)
                .providerSessionId(sessionId)
                .createdAt(Instant.now())
                .build());

        return new CheckoutResponse(checkoutUrl, sessionId, demo);
    }

    /** Called by the success page. Safe to call more than once: credits are only added on the first success. */
    public VerifyPaymentResponse verify(String userId, String sessionId) {
        PaymentTransaction tx = transactionRepository.findByProviderSessionId(sessionId)
                .filter(t -> t.getUserId().equals(userId))
                .orElseThrow(() -> ApiException.notFound("Payment not found"));

        if (tx.getStatus() == PaymentTransaction.Status.SUCCESS) {
            return new VerifyPaymentResponse(true, userService.getById(userId).getCredits(), "Payment already applied");
        }

        if (!isPaid(sessionId)) {
            return new VerifyPaymentResponse(false, userService.getById(userId).getCredits(), "Payment is not completed");
        }

        // Move PENDING -> SUCCESS atomically so a double call cannot add credits twice
        Query query = Query.query(Criteria.where("_id").is(tx.getId()).and("status").is(PaymentTransaction.Status.PENDING));
        PaymentTransaction updated = mongoTemplate.findAndModify(query,
                new Update().set("status", PaymentTransaction.Status.SUCCESS),
                FindAndModifyOptions.options().returnNew(true), PaymentTransaction.class);
        if (updated == null) {
            return new VerifyPaymentResponse(true, userService.getById(userId).getCredits(), "Payment already applied");
        }

        UserDocument user = userService.addCredits(userId, tx.getCredits());
        return new VerifyPaymentResponse(true, user.getCredits(), tx.getCredits() + " credits added");
    }

    public List<TransactionDto> transactions(String userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(TransactionDto::from).toList();
    }

    private boolean isPaid(String sessionId) {
        if (sessionId.startsWith(DEMO_PREFIX)) {
            if (props.stripe().enabled()) {
                throw ApiException.badRequest("Demo payments are disabled");
            }
            return true;
        }
        try {
            Session session = Session.retrieve(sessionId, stripeOptions());
            return "paid".equals(session.getPaymentStatus());
        } catch (StripeException e) {
            log.error("Stripe verification failed for {}", sessionId, e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Could not verify payment with Stripe");
        }
    }

    private Session createStripeSession(UserDocument user, PlanDto plan) {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(user.getEmail())
                .setClientReferenceId(user.getId())
                .setSuccessUrl(props.frontendUrl() + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(props.frontendUrl() + "/subscriptions?canceled=true")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(plan.currency())
                                .setUnitAmount(plan.priceCents())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("CloudShare " + plan.name() + " - " + plan.credits() + " credits")
                                        .build())
                                .build())
                        .build())
                .build();
        try {
            return Session.create(params, stripeOptions());
        } catch (StripeException e) {
            log.error("Stripe checkout creation failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Could not start payment with Stripe");
        }
    }

    private RequestOptions stripeOptions() {
        return RequestOptions.builder().setApiKey(props.stripe().secretKey()).build();
    }
}
