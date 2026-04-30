package com.roamnest.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class BookingResponse {
    private final Long id;
    private final Long propertyId;
    private final Long userId;
    private final LocalDate checkInDate;
    private final LocalDate checkOutDate;
    private final Integer guests;
    private final String status;
    private final String ownerDecisionNote;
    private final Long decidedBy;
    private final OffsetDateTime decidedAt;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;

    public BookingResponse(Long id,
                           Long propertyId,
                           Long userId,
                           LocalDate checkInDate,
                           LocalDate checkOutDate,
                           Integer guests,
                           String status,
                           String ownerDecisionNote,
                           Long decidedBy,
                           OffsetDateTime decidedAt,
                           OffsetDateTime createdAt,
                           OffsetDateTime updatedAt) {
        this.id = id;
        this.propertyId = propertyId;
        this.userId = userId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.guests = guests;
        this.status = status;
        this.ownerDecisionNote = ownerDecisionNote;
        this.decidedBy = decidedBy;
        this.decidedAt = decidedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public Integer getGuests() {
        return guests;
    }

    public String getStatus() {
        return status;
    }

    public String getOwnerDecisionNote() {
        return ownerDecisionNote;
    }

    public Long getDecidedBy() {
        return decidedBy;
    }

    public OffsetDateTime getDecidedAt() {
        return decidedAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
