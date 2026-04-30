package com.roamnest.backend.controller;

import com.roamnest.backend.dto.BookingDecisionRequest;
import com.roamnest.backend.dto.BookingMessageResponse;
import com.roamnest.backend.dto.BookingResponse;
import com.roamnest.backend.dto.CreateBookingRequest;
import com.roamnest.backend.dto.CreateMessageRequest;
import com.roamnest.backend.dto.CreateReviewRequest;
import com.roamnest.backend.dto.PropertyReviewResponse;
import com.roamnest.backend.service.BookingMessageService;
import com.roamnest.backend.service.BookingService;
import com.roamnest.backend.service.PropertyReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingMessageService bookingMessageService;
    private final PropertyReviewService propertyReviewService;

    public BookingController(BookingService bookingService,
                             BookingMessageService bookingMessageService,
                             PropertyReviewService propertyReviewService) {
        this.bookingService = bookingService;
        this.bookingMessageService = bookingMessageService;
        this.propertyReviewService = propertyReviewService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(Authentication authentication,
                                                         @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(Authentication authentication,
                                                          @PathVariable Long bookingId,
                                                          @RequestBody(required = false) BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.approveBooking(authentication.getName(), bookingId, request));
    }

    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(Authentication authentication,
                                                         @PathVariable Long bookingId,
                                                         @RequestBody(required = false) BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.rejectBooking(authentication.getName(), bookingId, request));
    }

    @PostMapping("/{bookingId}/messages")
    public ResponseEntity<BookingMessageResponse> sendMessage(Authentication authentication,
                                                              @PathVariable Long bookingId,
                                                              @Valid @RequestBody CreateMessageRequest request) {
        BookingMessageResponse response = bookingMessageService.sendMessage(
            authentication.getName(), bookingId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{bookingId}/messages")
    public ResponseEntity<List<BookingMessageResponse>> listMessages(Authentication authentication,
                                                                     @PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingMessageService.listMessages(authentication.getName(), bookingId));
    }

    @PostMapping("/{bookingId}/review")
    public ResponseEntity<PropertyReviewResponse> createReview(Authentication authentication,
                                                               @PathVariable Long bookingId,
                                                               @Valid @RequestBody CreateReviewRequest request) {
        PropertyReviewResponse response = propertyReviewService.createReview(
            authentication.getName(), bookingId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
