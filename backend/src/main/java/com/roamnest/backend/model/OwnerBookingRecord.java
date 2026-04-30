package com.roamnest.backend.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class OwnerBookingRecord {

    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private String propertyLocation;
    private Long guestUserId;
    private String guestFullName;
    private String guestUsername;
    private String guestPhoneNo;
    private String guestAddress;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guests;
    private String status;
    private String ownerDecisionNote;
    private OffsetDateTime decidedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public String getPropertyTitle() { return propertyTitle; }
    public void setPropertyTitle(String propertyTitle) { this.propertyTitle = propertyTitle; }
    public String getPropertyLocation() { return propertyLocation; }
    public void setPropertyLocation(String propertyLocation) { this.propertyLocation = propertyLocation; }
    public Long getGuestUserId() { return guestUserId; }
    public void setGuestUserId(Long guestUserId) { this.guestUserId = guestUserId; }
    public String getGuestFullName() { return guestFullName; }
    public void setGuestFullName(String guestFullName) { this.guestFullName = guestFullName; }
    public String getGuestUsername() { return guestUsername; }
    public void setGuestUsername(String guestUsername) { this.guestUsername = guestUsername; }
    public String getGuestPhoneNo() { return guestPhoneNo; }
    public void setGuestPhoneNo(String guestPhoneNo) { this.guestPhoneNo = guestPhoneNo; }
    public String getGuestAddress() { return guestAddress; }
    public void setGuestAddress(String guestAddress) { this.guestAddress = guestAddress; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOwnerDecisionNote() { return ownerDecisionNote; }
    public void setOwnerDecisionNote(String ownerDecisionNote) { this.ownerDecisionNote = ownerDecisionNote; }
    public OffsetDateTime getDecidedAt() { return decidedAt; }
    public void setDecidedAt(OffsetDateTime decidedAt) { this.decidedAt = decidedAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
