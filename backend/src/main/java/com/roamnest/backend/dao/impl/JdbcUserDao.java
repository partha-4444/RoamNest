package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.model.UserAccount;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JdbcUserDao implements UserDao {

    private static final RowMapper<UserAccount> USER_ROW_MAPPER = (rs, rowNum) -> {
        UserAccount user = new UserAccount();
        user.setId(rs.getLong("id"));
        user.setFullName(rs.getString("full_name"));
        user.setUsername(rs.getString("username"));
        user.setPassword(rs.getString("password_hash"));
        user.setRole(rs.getString("role_name"));
        user.setPhoneNo(rs.getString("phone_no"));
        user.setAddress(rs.getString("address"));
        user.setEnabled(rs.getBoolean("enabled"));
        return user;
    };

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcUserDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<UserAccount> findByUsername(String username) {
        String sql = """
            select u.id, u.full_name, u.username, u.password_hash, r.name as role_name, u.phone_no, u.address, u.enabled
            from rn_users u
            join rn_roles r on r.id = u.role_id
            where u.username = :username
            """;
        List<UserAccount> users = jdbcTemplate.query(sql, new MapSqlParameterSource("username", username), USER_ROW_MAPPER);
        return users.stream().findFirst();
    }

    @Override
    public Optional<UserAccount> findById(Long id) {
        String sql = """
            select u.id, u.full_name, u.username, u.password_hash, r.name as role_name, u.phone_no, u.address, u.enabled
            from rn_users u
            join rn_roles r on r.id = u.role_id
            where u.id = :id
            """;
        List<UserAccount> users = jdbcTemplate.query(sql, new MapSqlParameterSource("id", id), USER_ROW_MAPPER);
        return users.stream().findFirst();
    }

    @Override
    public Long createUser(UserAccount user) {
        String sql = """
            insert into rn_users (full_name, username, password_hash, role_id, phone_no, address, enabled)
            values (:fullName, :username, :passwordHash,
                    (select id from rn_roles where name = :roleName),
                    :phoneNo, :address, :enabled)
            """;
        SqlParameterSource params = new MapSqlParameterSource()
            .addValue("fullName", user.getFullName())
            .addValue("username", user.getUsername())
            .addValue("passwordHash", user.getPassword())
            .addValue("roleName", user.getRole())
            .addValue("phoneNo", user.getPhoneNo())
            .addValue("address", user.getAddress())
            .addValue("enabled", user.isEnabled());

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        Number key = keyHolder.getKey();
        return key == null ? null : key.longValue();
    }

    @Override
    public List<UserAccount> findAll() {
        String sql = """
            select u.id, u.full_name, u.username, u.password_hash, r.name as role_name, u.phone_no, u.address, u.enabled
            from rn_users u
            join rn_roles r on r.id = u.role_id
            order by u.id
            """;
        return jdbcTemplate.query(sql, USER_ROW_MAPPER);
    }

    @Override
    public List<UserAccount> findUsersByOwnerId(Long ownerId) {
        String sql = """
            select u.id, u.full_name, u.username, u.password_hash, r.name as role_name, u.phone_no, u.address, u.enabled
            from rn_owner_user_scope s
            join rn_users u on u.id = s.user_id
            join rn_roles r on r.id = u.role_id
            where s.owner_id = :ownerId
            order by u.id
            """;
        return jdbcTemplate.query(sql, new MapSqlParameterSource("ownerId", ownerId), USER_ROW_MAPPER);
    }
}
