package com.roamnest.backend.dao;

import java.util.Optional;

public interface RoleDao {
    Optional<Long> findRoleIdByName(String roleName);
}
