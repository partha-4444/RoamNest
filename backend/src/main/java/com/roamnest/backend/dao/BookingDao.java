package com.roamnest.backend.dao;

import com.roamnest.backend.model.BookingRecord;

import java.time.LocalDate;
import java.util.Optional;

public interface BookingDao {
    Long create(BookingRecord booking);

    Optional<BookingRecord> findById(Long id);

    boolean existsApprovedOverlap(Long propertyId, LocalDate checkInDate, LocalDate checkOutDate, Long excludedBookingId);

    void approve(Long bookingId, Long ownerId, String ownerDecisionNote);

    void reject(Long bookingId, Long ownerId, String ownerDecisionNote);
}
