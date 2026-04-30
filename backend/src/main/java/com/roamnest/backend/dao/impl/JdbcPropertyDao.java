package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dto.PropertySearchCriteria;
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
    public List<PropertyRecord> findByOwnerId(Long ownerId) {
        String sql = """
            select id, owner_id, title, description, location, address, price_per_night,
                   max_guests, available, created_at, updated_at
            from rn_properties
            where owner_id = :ownerId
            order by created_at desc, id desc
            """;
        return jdbcTemplate.query(sql, new MapSqlParameterSource("ownerId", ownerId), PROPERTY_ROW_MAPPER);
    }

    @Override
    @Deprecated
    public List<PropertyRecord> searchAvailableByLocation(String location) {
        PropertySearchCriteria criteria = new PropertySearchCriteria(
            location, null, null, null, null, null, null);
        return search(criteria);
    }

    @Override
    public List<PropertyRecord> search(PropertySearchCriteria criteria) {
        StringBuilder sql = new StringBuilder("""
            select id, owner_id, title, description, location, address, price_per_night,
                   max_guests, available, created_at, updated_at
            from rn_properties
            where available = true
            """);
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (criteria.getLocation() != null && !criteria.getLocation().isBlank()) {
            sql.append(" and lower(location) like lower('%' || :location || '%')");
            params.addValue("location", criteria.getLocation().trim());
        }
        if (criteria.getMinPrice() != null) {
            sql.append(" and price_per_night >= :minPrice");
            params.addValue("minPrice", criteria.getMinPrice());
        }
        if (criteria.getMaxPrice() != null) {
            sql.append(" and price_per_night <= :maxPrice");
            params.addValue("maxPrice", criteria.getMaxPrice());
        }
        if (criteria.getMinGuests() != null) {
            sql.append(" and max_guests >= :minGuests");
            params.addValue("minGuests", criteria.getMinGuests());
        }
        if (criteria.hasDateFilter()) {
            sql.append("""
                 and id not in (
                     select property_id from rn_bookings
                     where status = 'APPROVED'
                       and check_in_date < :checkOutDate
                       and check_out_date > :checkInDate
                 )
                """);
            params.addValue("checkInDate", criteria.getCheckInDate());
            params.addValue("checkOutDate", criteria.getCheckOutDate());
        }

        String sort = criteria.getSort();
        if ("price_asc".equalsIgnoreCase(sort)) {
            sql.append(" order by price_per_night asc, created_at desc, id desc");
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            sql.append(" order by price_per_night desc, created_at desc, id desc");
        } else {
            sql.append(" order by created_at desc, id desc");
        }

        return jdbcTemplate.query(sql.toString(), params, PROPERTY_ROW_MAPPER);
    }

    @Override
    public List<PropertyRecord> findAll() {
        String sql = """
            select id, owner_id, title, description, location, address, price_per_night,
                   max_guests, available, created_at, updated_at
            from rn_properties
            order by created_at desc, id desc
            """;
        return jdbcTemplate.query(sql, PROPERTY_ROW_MAPPER);
    }
}
