package com.roamnest.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class WishlistDetailResponse {
    private final Long id;
    private final String name;
    private final int propertyCount;
    private final List<PropertyResponse> properties;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;

    public WishlistDetailResponse(Long id,
                                  String name,
                                  int propertyCount,
                                  List<PropertyResponse> properties,
                                  OffsetDateTime createdAt,
                                  OffsetDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.propertyCount = propertyCount;
        this.properties = properties;
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

    public List<PropertyResponse> getProperties() {
        return properties;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
