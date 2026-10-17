package com.backend.service;

import com.backend.document.UserDocument;
import com.backend.exception.ApiException;
import com.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    public UserDocument getById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    /**
     * Atomically takes credits from the user. The query only matches when the balance is large enough,
     * so two parallel uploads can never push the balance below zero.
     */
    public UserDocument consumeCredits(String userId, int amount) {
        Query query = Query.query(Criteria.where("_id").is(userId).and("credits").gte(amount));
        UserDocument updated = mongoTemplate.findAndModify(query, new Update().inc("credits", -amount),
                FindAndModifyOptions.options().returnNew(true), UserDocument.class);
        if (updated == null) {
            throw new ApiException(HttpStatus.PAYMENT_REQUIRED,
                    "Not enough credits. You need " + amount + " credit(s) for this upload.");
        }
        return updated;
    }

    public UserDocument addCredits(String userId, int amount) {
        Query query = Query.query(Criteria.where("_id").is(userId));
        UserDocument updated = mongoTemplate.findAndModify(query, new Update().inc("credits", amount),
                FindAndModifyOptions.options().returnNew(true), UserDocument.class);
        if (updated == null) {
            throw ApiException.notFound("User not found");
        }
        return updated;
    }
}
