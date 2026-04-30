package com.roamnest.backend.dao;

import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.WishlistRecord;

import java.util.List;
import java.util.Optional;

public interface WishlistDao {
    Long create(Long userId, String name);

    List<WishlistRecord> findByUserId(Long userId);

    Optional<WishlistRecord> findByIdAndUserId(Long wishlistId, Long userId);

    void addProperty(Long wishlistId, Long propertyId);

    void removeProperty(Long wishlistId, Long propertyId);

    List<PropertyRecord> findProperties(Long wishlistId, Long userId);
}
