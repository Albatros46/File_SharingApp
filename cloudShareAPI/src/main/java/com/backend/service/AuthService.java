package com.backend.service;

import com.backend.config.AppProperties;
import com.backend.document.UserDocument;
import com.backend.dto.AuthDtos.AuthResponse;
import com.backend.dto.AuthDtos.LoginRequest;
import com.backend.dto.AuthDtos.RegisterRequest;
import com.backend.dto.AuthDtos.UserDto;
import com.backend.exception.ApiException;
import com.backend.repository.UserRepository;
import com.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties props;

    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        UserDocument user = userRepository.save(UserDocument.builder()
                .email(email)
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .password(passwordEncoder.encode(request.password()))
                .credits(props.signupCredits())
                .createdAt(Instant.now())
                .build());
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        UserDocument user = userRepository.findByEmail(normalize(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        return toResponse(user);
    }

    private AuthResponse toResponse(UserDocument user) {
        return new AuthResponse(jwtService.generateToken(user.getId(), user.getEmail()), UserDto.from(user));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
