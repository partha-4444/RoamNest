package com.roamnest.backend.dao;

import com.roamnest.backend.model.BookingRecord;
import com.roamnest.backend.model.OwnerBookingRecord;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingDao {
    Long create(BookingRecord booking);

    Optional<BookingRecord> findById(Long id);

    boolean existsApprovedOverlap(Long propertyId, LocalDate checkInDate, LocalDate checkOutDate, Long excludedBookingId);

    void approve(Long bookingId, Long ownerId, String ownerDecisionNote);

    void reject(Long bookingId, Long ownerId, String ownerDecisionNote);

    /**
     * Returns the booking enriched with property title/location, without guest user identity.
     * Used to build owner-safe responses after approve/reject.
     */
    Optional<OwnerBookingRecord> findOwnerBookingById(Long bookingId);

    /**
     * Returns all bookings for properties owned by the given owner, optionally filtered by status.
     * Guest identity is not included in the result.
     *
     * @param status nullable; null returns all statuses
     */
    List<OwnerBookingRecord> findByOwnerIdAndStatus(Long ownerId, String status);

    /**
     * Returns all bookings made by the given user, enriched with property title/location.
     *
     * @param status nullable; null returns all statuses
     */
    List<OwnerBookingRecord> findByUserIdAndStatus(Long userId, String status);
}
