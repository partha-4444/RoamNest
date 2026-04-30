package com.roamnest.backend.controller;

import com.roamnest.backend.dto.UserDetailsResponse;
import com.roamnest.backend.dto.UserReviewResponse;
import com.roamnest.backend.service.PropertyReviewService;
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
    private final PropertyReviewService propertyReviewService;

    public UserDetailsController(UserDetailsApiService userDetailsApiService,
                                 PropertyReviewService propertyReviewService) {
        this.userDetailsApiService = userDetailsApiService;
        this.propertyReviewService = propertyReviewService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDetailsResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userDetailsApiService.getCurrentUserDetails(authentication.getName()));
    }

    @GetMapping("/me/reviews")
    public ResponseEntity<List<UserReviewResponse>> getCurrentUserReviews(Authentication authentication) {
        return ResponseEntity.ok(propertyReviewService.listReviewsWrittenByCurrentUser(authentication.getName()));
    }

    @GetMapping("/details")
    public ResponseEntity<List<UserDetailsResponse>> getUserDetails(Authentication authentication) {
        return ResponseEntity.ok(userDetailsApiService.getUserDetailsByAccessScope(authentication.getName()));
    }
}
