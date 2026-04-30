package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.model.PropertyRecord;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcPropertyDao implements PropertyDao {

    private static final RowMapper<PropertyRecord> PROPERTY_ROW_MAPPER = (rs, rowNum) -> {
        PropertyRecord property = new PropertyRecord();
        property.setId(rs.getLong("id"));
        property.setOwnerId(rs.getLong("owner_id"));
        property.setTitle(rs.getString("title"));
        property.setDescription(rs.getString("description"));
        property.setLocation(rs.getString("location"));
        property.setAddress(rs.getString("address"));
        property.setPricePerNight(rs.getBigDecimal("price_per_night"));
        property.setMaxGuests(rs.getInt("max_guests"));
        property.setAvailable(rs.getBoolean("available"));
        property.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
        property.setUpdatedAt(rs.getObject("updated_at", OffsetDateTime.class));
        return property;
    };

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcPropertyDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Long create(PropertyRecord property) {
        String sql = """
            insert into rn_properties
                (owner_id, title, description, location, address, price_per_night, max_guests, available)
            values
                (:ownerId, :title, :description, :location, :address, :pricePerNight, :maxGuests, :available)
            """;
        SqlParameterSource params = new MapSqlParameterSource()
            .addValue("ownerId", property.getOwnerId())
            .addValue("title", property.getTitle())
            .addValue("description", property.getDescription())
            .addValue("location", property.getLocation())
            .addValue("address", property.getAddress())
            .addValue("pricePerNight", property.getPricePerNight())
            .addValue("maxGuests", property.getMaxGuests())
            .addValue("available", property.isAvailable());

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        Number key = keyHolder.getKey();
        return key == null ? null : key.longValue();
    }

    @Override
    public Optional<PropertyRecord> findById(Long id) {
        String sql = """
            select id, owner_id, title, description, location, address, price_per_night,
                   max_guests, available, created_at, updated_at
            from rn_properties
            where id = :id
            """;
        List<PropertyRecord> properties = jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("id", id),
            PROPERTY_ROW_MAPPER);
        return properties.stream().findFirst();
    }

    @Override
    public List<PropertyRecord> findAvailable() {
        String sql = """
            select id, owner_id, title, description, location, address, price_per_night,
                   max_guests, available, created_at, updated_at
            from rn_properties
            where available = true
            order by created_at desc, id desc
            """;
        return jdbcTemplate.query(sql, PROPERTY_ROW_MAPPER);
    }

    @Override
    public List<PropertyRecord> searchAvailableByLocation(String location) {
        String sql = """
            select id, owner_id, title, description, location, address, price_per_night,
                   max_guests, available, created_at, updated_at
            from rn_properties
            where available = true
              and lower(location) like lower('%' || :location || '%')
            order by created_at desc, id desc
            """;
        return jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("location", location),
            PROPERTY_ROW_MAPPER);
    }
}
