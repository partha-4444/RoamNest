package com.roamnest.backend.dao;

import com.roamnest.backend.dto.ReviewSummary;
import com.roamnest.backend.model.PropertyReviewRecord;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PropertyReviewDao {
    Long create(PropertyReviewRecord review);

    Optional<PropertyReviewRecord> findById(Long id);

    boolean existsByBookingId(Long bookingId);

    List<PropertyReviewRecord> findByPropertyId(Long propertyId);

    /** Single property aggregate — averageRating is 0.0 and reviewCount is 0 when no reviews exist. */
    ReviewSummary findSummaryByPropertyId(Long propertyId);

    /** Batch aggregate for a set of property ids. Missing ids will not appear in the returned map. */
    Map<Long, ReviewSummary> findSummariesForPropertyIds(List<Long> propertyIds);
}
