package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.RoleDao;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JdbcRoleDao implements RoleDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcRoleDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<Long> findRoleIdByName(String roleName) {
        String sql = "select id from rn_roles where name = :roleName";
        List<Long> ids = jdbcTemplate.query(sql,
            new MapSqlParameterSource("roleName", roleName),
            (rs, rowNum) -> rs.getLong("id"));
        return ids.stream().findFirst();
    }
}
