package com.roamnest.backend.controller;

import com.roamnest.backend.dto.AuthResponse;
import com.roamnest.backend.dto.LoginRequest;
import com.roamnest.backend.dto.SignupRequest;
import com.roamnest.backend.service.AuthHandler;
import com.roamnest.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthHandler authHandler;

    public AuthController(AuthService authService, AuthHandler authHandler) {
        this.authService = authService;
        this.authHandler = authHandler;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHandler.extractBearerToken(authHeader).orElse("");
        if (!token.isBlank()) {
            authService.logout(token);
        }
        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
