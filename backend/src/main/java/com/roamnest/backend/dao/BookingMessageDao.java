package com.roamnest.backend.dao;

import com.roamnest.backend.model.BookingMessageRecord;

import java.util.List;
import java.util.Optional;

public interface BookingMessageDao {
    Long create(BookingMessageRecord message);

    Optional<BookingMessageRecord> findById(Long id);

    List<BookingMessageRecord> findByBookingId(Long bookingId);
}
