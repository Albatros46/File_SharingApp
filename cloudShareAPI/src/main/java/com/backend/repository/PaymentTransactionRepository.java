package com.backend.repository;

import com.backend.document.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {

    List<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<PaymentTransaction> findByProviderSessionId(String providerSessionId);
}
