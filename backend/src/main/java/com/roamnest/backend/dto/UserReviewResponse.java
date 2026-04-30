package com.roamnest.backend.dto;

import java.time.OffsetDateTime;

public class UserReviewResponse {
    private final Long id;
    private final Long bookingId;
    private final Long propertyId;
    private final String propertyTitle;
    private final String propertyLocation;
    private final Integer rating;
    private final String comment;
    private final OffsetDateTime createdAt;

    public UserReviewResponse(Long id,
                              Long bookingId,
                              Long propertyId,
                              String propertyTitle,
                              String propertyLocation,
                              Integer rating,
                              String comment,
                              OffsetDateTime createdAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.propertyLocation = propertyLocation;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
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

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public String getPropertyLocation() {
        return propertyLocation;
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
}
