package com.roamnest.backend.dao;

import com.roamnest.backend.model.ApiObjectRecord;

import java.util.List;
import java.util.Optional;

public interface ApiObjectDao {
    Long upsertApiObject(String name, String pathPattern, String httpMethod, boolean isPublic);

    Optional<ApiObjectRecord> findByName(String name);

    List<ApiObjectRecord> findByMethod(String httpMethod);
}
