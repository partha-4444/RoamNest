package com.roamnest.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @PostMapping("/login")
    public Map<String, String> login(Authentication authentication) {
        // If they reach here, Spring Security already verified their basic auth credentials
        Map<String, String> response = new HashMap<>();
        if (authentication != null && authentication.isAuthenticated()) {
            response.put("username", authentication.getName());
            // Extract the first role
            String role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_USER");
            // Remove the "ROLE_" prefix for the frontend
            response.put("role", role.replace("ROLE_", ""));
            response.put("status", "success");
        } else {
            response.put("status", "error");
            response.put("message", "Authentication failed");
        }
        return response;
    }
}
