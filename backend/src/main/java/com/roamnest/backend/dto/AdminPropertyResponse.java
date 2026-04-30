package com.roamnest.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class AdminPropertyResponse {

    private final Long id;
    private final Long ownerId;
    private final String ownerUsername;
    private final String ownerFullName;
    private final String title;
    private final String description;
    private final String location;
    private final String address;
    private final BigDecimal pricePerNight;
    private final Integer maxGuests;
    private final boolean available;
    private final ReviewSummary reviewSummary;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;

    public AdminPropertyResponse(Long id,
                                 Long ownerId,
                                 String ownerUsername,
                                 String ownerFullName,
                                 String title,
                                 String description,
                                 String location,
                                 String address,
                                 BigDecimal pricePerNight,
                                 Integer maxGuests,
                                 boolean available,
                                 ReviewSummary reviewSummary,
                                 OffsetDateTime createdAt,
                                 OffsetDateTime updatedAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.ownerUsername = ownerUsername;
        this.ownerFullName = ownerFullName;
        this.title = title;
        this.description = description;
        this.location = location;
        this.address = address;
        this.pricePerNight = pricePerNight;
        this.maxGuests = maxGuests;
        this.available = available;
        this.reviewSummary = reviewSummary;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getOwnerUsername() { return ownerUsername; }
    public String getOwnerFullName() { return ownerFullName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public String getAddress() { return address; }
    public BigDecimal getPricePerNight() { return pricePerNight; }
    public Integer getMaxGuests() { return maxGuests; }
    public boolean isAvailable() { return available; }
    public ReviewSummary getReviewSummary() { return reviewSummary; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
