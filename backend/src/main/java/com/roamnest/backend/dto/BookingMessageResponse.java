package com.roamnest.backend.dto;

import java.time.OffsetDateTime;

public class BookingMessageResponse {
    private final Long id;
    private final Long bookingId;
    private final Long senderId;
    private final String message;
    private final OffsetDateTime createdAt;

    public BookingMessageResponse(Long id,
                                  Long bookingId,
                                  Long senderId,
                                  String message,
                                  OffsetDateTime createdAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.senderId = senderId;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getMessage() {
        return message;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
