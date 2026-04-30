package com.roamnest.backend.dto;

import java.time.OffsetDateTime;

public class BookingMessageResponse {
    private final Long id;
    private final Long bookingId;
    /**
     * "GUEST" or "OWNER" — never the raw userId, to preserve guest anonymity
     * even in post-approval conversations.
     */
    private final String senderRole;
    private final String message;
    private final OffsetDateTime createdAt;

    public BookingMessageResponse(Long id,
                                  Long bookingId,
                                  String senderRole,
                                  String message,
                                  OffsetDateTime createdAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.senderRole = senderRole;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public String getSenderRole() { return senderRole; }
    public String getMessage() { return message; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
