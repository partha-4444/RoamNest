package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.TokenDao;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public class JdbcTokenDao implements TokenDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcTokenDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void revokeActiveTokensByUserId(Long userId) {
        String sql = """
            update rn_auth_tokens
            set active = false, updated_at = now()
            where user_id = :userId and active = true
            """;
        jdbcTemplate.update(sql, new MapSqlParameterSource("userId", userId));
    }

    @Override
    public void saveToken(Long userId, String token, Instant expiresAt) {
        String sql = """
            insert into rn_auth_tokens (user_id, token_value, active, expires_at)
            values (:userId, :tokenValue, true, :expiresAt)
            """;
        jdbcTemplate.update(sql, new MapSqlParameterSource()
            .addValue("userId", userId)
            .addValue("tokenValue", token)
            .addValue("expiresAt", expiresAt));
    }

    @Override
    public boolean isTokenActiveForUser(String token, Long userId) {
        String sql = """
            select count(1)
            from rn_auth_tokens
            where token_value = :tokenValue and user_id = :userId and active = true
            """;
        Integer count = jdbcTemplate.queryForObject(sql,
            new MapSqlParameterSource()
                .addValue("tokenValue", token)
                .addValue("userId", userId),
            Integer.class);
        return count != null && count > 0;
    }

    @Override
    public void revokeToken(String token) {
        String sql = """
            update rn_auth_tokens
            set active = false, updated_at = now()
            where token_value = :tokenValue
            """;
        jdbcTemplate.update(sql, new MapSqlParameterSource("tokenValue", token));
    }
}
