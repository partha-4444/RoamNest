package com.roamnest.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class MyBookingResponse {
    private final Long id;
    private final Long propertyId;
    private final String propertyTitle;
    private final String propertyLocation;
    private final LocalDate checkInDate;
    private final LocalDate checkOutDate;
    private final Integer guests;
    private final String status;
    private final String ownerDecisionNote;
    private final OffsetDateTime decidedAt;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;

    public MyBookingResponse(Long id,
                             Long propertyId,
                             String propertyTitle,
                             String propertyLocation,
                             LocalDate checkInDate,
                             LocalDate checkOutDate,
                             Integer guests,
                             String status,
                             String ownerDecisionNote,
                             OffsetDateTime decidedAt,
                             OffsetDateTime createdAt,
                             OffsetDateTime updatedAt) {
        this.id = id;
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.propertyLocation = propertyLocation;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.guests = guests;
        this.status = status;
        this.ownerDecisionNote = ownerDecisionNote;
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

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public String getPropertyLocation() {
        return propertyLocation;
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
