package com.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String uploadDir,
        String frontendUrl,
        int signupCredits,
        int creditsPerUpload,
        Jwt jwt,
        Stripe stripe) {

    public record Jwt(String secret, long expirationMs) {
    }

    public record Stripe(String secretKey, String currency) {

        public boolean enabled() {
            return secretKey != null && !secretKey.isBlank();
        }
    }
}
