package com.roamnest.backend.dao;

import java.time.Instant;

public interface TokenDao {
    void revokeActiveTokensByUserId(Long userId);

    void saveToken(Long userId, String token, Instant expiresAt);

    boolean isTokenActiveForUser(String token, Long userId);

    void revokeToken(String token);
}
