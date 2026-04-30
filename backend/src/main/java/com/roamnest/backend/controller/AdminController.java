package com.roamnest.backend.controller;

import com.roamnest.backend.dto.AdminBookingResponse;
import com.roamnest.backend.dto.AdminPropertyResponse;
import com.roamnest.backend.dto.AdminSummaryResponse;
import com.roamnest.backend.dto.UserDetailsResponse;
import com.roamnest.backend.service.AdminService;
import com.roamnest.backend.service.UserDetailsApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserDetailsApiService userDetailsApiService;

    public AdminController(AdminService adminService, UserDetailsApiService userDetailsApiService) {
        this.adminService = adminService;
        this.userDetailsApiService = userDetailsApiService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AdminSummaryResponse> getSummary(Authentication authentication) {
        return ResponseEntity.ok(adminService.getSummary(authentication.getName()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDetailsResponse>> getAllUsers(Authentication authentication) {
        // UserDetailsApiService already returns all users when caller is ADMIN
        return ResponseEntity.ok(userDetailsApiService.getUserDetailsByAccessScope(authentication.getName()));
    }

    @GetMapping("/properties")
    public ResponseEntity<List<AdminPropertyResponse>> getAllProperties(Authentication authentication) {
        return ResponseEntity.ok(adminService.getAllProperties(authentication.getName()));
    }

    /**
     * Admin view of all bookings with guest identity visible for bias/fairness monitoring.
     * Accepts an optional status filter: PENDING, APPROVED, REJECTED, CANCELLED.
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<AdminBookingResponse>> getAllBookings(
        Authentication authentication,
        @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllBookings(authentication.getName(), status));
    }
}
