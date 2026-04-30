package com.roamnest.backend.dao;

import com.roamnest.backend.model.PropertyReviewRecord;

import java.util.List;
import java.util.Optional;

public interface PropertyReviewDao {
    Long create(PropertyReviewRecord review);

    Optional<PropertyReviewRecord> findById(Long id);

    boolean existsByBookingId(Long bookingId);

    List<PropertyReviewRecord> findByPropertyId(Long propertyId);
}
