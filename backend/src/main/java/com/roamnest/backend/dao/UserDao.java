package com.roamnest.backend.dao;

import com.roamnest.backend.model.UserAccount;

import java.util.List;
import java.util.Optional;

public interface UserDao {
    Optional<UserAccount> findByUsername(String username);

    Optional<UserAccount> findById(Long id);

    Long createUser(UserAccount user);

    List<UserAccount> findAll();

    List<UserAccount> findUsersByOwnerId(Long ownerId);
}
