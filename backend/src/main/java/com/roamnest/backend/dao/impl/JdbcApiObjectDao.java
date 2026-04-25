package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.ApiObjectDao;
import com.roamnest.backend.model.ApiObjectRecord;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JdbcApiObjectDao implements ApiObjectDao {

    private static final RowMapper<ApiObjectRecord> API_OBJECT_ROW_MAPPER = (rs, rowNum) -> {
        ApiObjectRecord record = new ApiObjectRecord();
        record.setId(rs.getLong("id"));
        record.setName(rs.getString("name"));
        record.setPathPattern(rs.getString("path_pattern"));
        record.setHttpMethod(rs.getString("http_method"));
        record.setPublic(rs.getBoolean("is_public"));
        return record;
    };

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcApiObjectDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Long upsertApiObject(String name, String pathPattern, String httpMethod, boolean isPublic) {
        Optional<ApiObjectRecord> existing = findByName(name);
        if (existing.isPresent()) {
            String updateSql = """
                update rn_api_objects
                set path_pattern = :pathPattern,
                    http_method = :httpMethod,
                    is_public = :isPublic,
                    updated_at = now()
                where name = :name
                """;
            jdbcTemplate.update(updateSql,
                new MapSqlParameterSource()
                    .addValue("name", name)
                    .addValue("pathPattern", pathPattern)
                    .addValue("httpMethod", httpMethod.toUpperCase())
                    .addValue("isPublic", isPublic));
            return existing.get().getId();
        }

        String insertSql = """
            insert into rn_api_objects (name, path_pattern, http_method, is_public)
            values (:name, :pathPattern, :httpMethod, :isPublic)
            """;
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(insertSql,
            new MapSqlParameterSource()
                .addValue("name", name)
                .addValue("pathPattern", pathPattern)
                .addValue("httpMethod", httpMethod.toUpperCase())
                .addValue("isPublic", isPublic),
            keyHolder,
            new String[]{"id"});
        Number key = keyHolder.getKey();
        return key == null ? null : key.longValue();
    }

    @Override
    public Optional<ApiObjectRecord> findByName(String name) {
        String sql = "select id, name, path_pattern, http_method, is_public from rn_api_objects where name = :name";
        List<ApiObjectRecord> rows = jdbcTemplate.query(sql,
            new MapSqlParameterSource("name", name),
            API_OBJECT_ROW_MAPPER);
        return rows.stream().findFirst();
    }

    @Override
    public List<ApiObjectRecord> findByMethod(String httpMethod) {
        String sql = """
            select id, name, path_pattern, http_method, is_public
            from rn_api_objects
            where http_method = :httpMethod
            """;
        return jdbcTemplate.query(sql,
            new MapSqlParameterSource("httpMethod", httpMethod.toUpperCase()),
            API_OBJECT_ROW_MAPPER);
    }
}
