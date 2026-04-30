package com.roamnest.backend.controller;

import com.roamnest.backend.dto.CreatePropertyRequest;
import com.roamnest.backend.dto.PropertyResponse;
import com.roamnest.backend.dto.PropertyReviewResponse;
import com.roamnest.backend.dto.PropertySearchCriteria;
import com.roamnest.backend.service.PropertyReviewService;
import com.roamnest.backend.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final PropertyReviewService propertyReviewService;

    public PropertyController(PropertyService propertyService,
                              PropertyReviewService propertyReviewService) {
        this.propertyService = propertyService;
        this.propertyReviewService = propertyReviewService;
    }

    @PostMapping
    public ResponseEntity<PropertyResponse> createProperty(Authentication authentication,
                                                           @Valid @RequestBody CreatePropertyRequest request) {
        PropertyResponse response = propertyService.createProperty(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> listProperties(Authentication authentication) {
        return ResponseEntity.ok(propertyService.listAvailableProperties(authentication.getName()));
    }

    /**
     * Filtered search — all parameters are optional.
     * Sorting: newest (default), price_asc, price_desc.
     */
    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponse>> searchProperties(
        Authentication authentication,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) Integer guests,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
        @RequestParam(required = false, defaultValue = "newest") String sort) {

        PropertySearchCriteria criteria = new PropertySearchCriteria(
            location, minPrice, maxPrice, guests, checkInDate, checkOutDate, sort);
        return ResponseEntity.ok(propertyService.searchProperties(authentication.getName(), criteria));
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyResponse> getProperty(Authentication authentication,
                                                        @PathVariable Long propertyId) {
        return ResponseEntity.ok(propertyService.getProperty(authentication.getName(), propertyId));
    }

    @GetMapping("/{propertyId}/reviews")
    public ResponseEntity<List<PropertyReviewResponse>> listReviews(Authentication authentication,
                                                                    @PathVariable Long propertyId) {
        return ResponseEntity.ok(propertyReviewService.listReviewsForProperty(
            authentication.getName(), propertyId));
    }
}
