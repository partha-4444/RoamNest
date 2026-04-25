package com.roamnest.backend.controller;

import com.roamnest.backend.dto.UserDetailsResponse;
import com.roamnest.backend.service.UserDetailsApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserDetailsController {

    private final UserDetailsApiService userDetailsApiService;

    public UserDetailsController(UserDetailsApiService userDetailsApiService) {
        this.userDetailsApiService = userDetailsApiService;
    }

    @GetMapping("/details")
    public ResponseEntity<List<UserDetailsResponse>> getUserDetails(Authentication authentication) {
        return ResponseEntity.ok(userDetailsApiService.getUserDetailsByAccessScope(authentication.getName()));
    }
}
