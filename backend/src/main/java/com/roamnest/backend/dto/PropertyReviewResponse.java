package com.roamnest.backend.dto;

import java.time.OffsetDateTime;

public class PropertyReviewResponse {
    private final Long id;
    private final Long bookingId;
    private final Long propertyId;
    private final Long userId;
    private final Integer rating;
    private final String comment;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;

    public PropertyReviewResponse(Long id,
                                  Long bookingId,
                                  Long propertyId,
                                  Long userId,
                                  Integer rating,
                                  String comment,
                                  OffsetDateTime createdAt,
                                  OffsetDateTime updatedAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.propertyId = propertyId;
        this.userId = userId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public Long getUserId() {
        return userId;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
