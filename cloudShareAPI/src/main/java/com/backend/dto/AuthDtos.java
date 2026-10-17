package com.backend.dto;

import com.backend.document.UserDocument;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, message = "must be at least 6 characters") String password) {
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record AuthResponse(String token, UserDto user) {
    }

    public record UserDto(String id, String email, String firstName, String lastName, int credits, Instant createdAt) {

        public static UserDto from(UserDocument user) {
            return new UserDto(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                    user.getCredits(), user.getCreatedAt());
        }
    }
}
