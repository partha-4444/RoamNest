package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.WishlistDao;
import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.WishlistRecord;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcWishlistDao implements WishlistDao {

    private static final RowMapper<WishlistRecord> WISHLIST_ROW_MAPPER = (rs, rowNum) -> {
        WishlistRecord wishlist = new WishlistRecord();
        wishlist.setId(rs.getLong("id"));
        wishlist.setUserId(rs.getLong("user_id"));
        wishlist.setName(rs.getString("name"));
        wishlist.setPropertyCount(rs.getInt("property_count"));
        wishlist.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
        wishlist.setUpdatedAt(rs.getObject("updated_at", OffsetDateTime.class));
        return wishlist;
    };

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

    public JdbcWishlistDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Long create(Long userId, String name) {
        String sql = """
            insert into rn_wishlists (user_id, name)
            values (:userId, :name)
            """;
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("userId", userId)
            .addValue("name", name);

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        Number key = keyHolder.getKey();
        return key == null ? null : key.longValue();
    }

    @Override
    public List<WishlistRecord> findByUserId(Long userId) {
        String sql = """
            select w.id, w.user_id, w.name, w.created_at, w.updated_at,
                   count(wp.property_id)::int as property_count
            from rn_wishlists w
            left join rn_wishlist_properties wp on wp.wishlist_id = w.id
            where w.user_id = :userId
            group by w.id, w.user_id, w.name, w.created_at, w.updated_at
            order by w.updated_at desc, w.id desc
            """;
        return jdbcTemplate.query(sql, new MapSqlParameterSource("userId", userId), WISHLIST_ROW_MAPPER);
    }

    @Override
    public Optional<WishlistRecord> findByIdAndUserId(Long wishlistId, Long userId) {
        String sql = """
            select w.id, w.user_id, w.name, w.created_at, w.updated_at,
                   count(wp.property_id)::int as property_count
            from rn_wishlists w
            left join rn_wishlist_properties wp on wp.wishlist_id = w.id
            where w.id = :wishlistId and w.user_id = :userId
            group by w.id, w.user_id, w.name, w.created_at, w.updated_at
            """;
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("wishlistId", wishlistId)
            .addValue("userId", userId);
        return jdbcTemplate.query(sql, params, WISHLIST_ROW_MAPPER).stream().findFirst();
    }

    @Override
    public void addProperty(Long wishlistId, Long propertyId) {
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("wishlistId", wishlistId)
            .addValue("propertyId", propertyId);

        jdbcTemplate.update("""
            insert into rn_wishlist_properties (wishlist_id, property_id)
            values (:wishlistId, :propertyId)
            on conflict (wishlist_id, property_id) do nothing
            """, params);
        jdbcTemplate.update("""
            update rn_wishlists
            set updated_at = now()
            where id = :wishlistId
            """, params);
    }

    @Override
    public void removeProperty(Long wishlistId, Long propertyId) {
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("wishlistId", wishlistId)
            .addValue("propertyId", propertyId);

        int deleted = jdbcTemplate.update("""
            delete from rn_wishlist_properties
            where wishlist_id = :wishlistId and property_id = :propertyId
            """, params);
        if (deleted > 0) {
            jdbcTemplate.update("""
                update rn_wishlists
                set updated_at = now()
                where id = :wishlistId
                """, params);
        }
    }

    @Override
    public List<PropertyRecord> findProperties(Long wishlistId, Long userId) {
        String sql = """
            select p.id, p.owner_id, p.title, p.description, p.location, p.address,
                   p.price_per_night, p.max_guests, p.available, p.created_at, p.updated_at
            from rn_wishlist_properties wp
            join rn_wishlists w on w.id = wp.wishlist_id
            join rn_properties p on p.id = wp.property_id
            where wp.wishlist_id = :wishlistId and w.user_id = :userId
            order by wp.created_at desc
            """;
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("wishlistId", wishlistId)
            .addValue("userId", userId);
        return jdbcTemplate.query(sql, params, PROPERTY_ROW_MAPPER);
    }
}
