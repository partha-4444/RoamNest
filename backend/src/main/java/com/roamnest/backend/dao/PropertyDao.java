package com.roamnest.backend.dao;

import com.roamnest.backend.model.PropertyRecord;

import java.util.List;
import java.util.Optional;

public interface PropertyDao {
    Long create(PropertyRecord property);

    Optional<PropertyRecord> findById(Long id);

    List<PropertyRecord> findAvailable();

    List<PropertyRecord> searchAvailableByLocation(String location);
}
