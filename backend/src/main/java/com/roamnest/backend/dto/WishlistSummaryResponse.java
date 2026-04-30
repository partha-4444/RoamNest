package com.roamnest.backend.dto;

import java.time.OffsetDateTime;

public class WishlistSummaryResponse {
    private final Long id;
    private final String name;
    private final int propertyCount;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;

    public WishlistSummaryResponse(Long id,
                                   String name,
                                   int propertyCount,
                                   OffsetDateTime createdAt,
                                   OffsetDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.propertyCount = propertyCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getPropertyCount() {
        return propertyCount;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
