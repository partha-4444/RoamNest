package com.roamnest.backend.dao;

import com.roamnest.backend.dto.PropertySearchCriteria;
import com.roamnest.backend.model.PropertyRecord;

import java.util.List;
import java.util.Optional;

public interface PropertyDao {
    Long create(PropertyRecord property);

    Optional<PropertyRecord> findById(Long id);

    List<PropertyRecord> findAvailable();

    /** Filtered search with optional location, price, guest capacity, and date filters. */
    List<PropertyRecord> search(PropertySearchCriteria criteria);

    /** Returns all properties regardless of availability — admin use only. */
    List<PropertyRecord> findAll();

    @Deprecated
    List<PropertyRecord> searchAvailableByLocation(String location);
}
