package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.PropertyReviewDao;
import com.roamnest.backend.model.PropertyReviewRecord;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcPropertyReviewDao implements PropertyReviewDao {

    private static final RowMapper<PropertyReviewRecord> REVIEW_ROW_MAPPER = (rs, rowNum) -> {
        PropertyReviewRecord review = new PropertyReviewRecord();
        review.setId(rs.getLong("id"));
        review.setBookingId(rs.getLong("booking_id"));
        review.setPropertyId(rs.getLong("property_id"));
        review.setUserId(rs.getLong("user_id"));
        review.setRating(rs.getInt("rating"));
        review.setComment(rs.getString("comment"));
        review.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
        review.setUpdatedAt(rs.getObject("updated_at", OffsetDateTime.class));
        return review;
    };

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcPropertyReviewDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Long create(PropertyReviewRecord review) {
        String sql = """
            insert into rn_property_reviews (booking_id, property_id, user_id, rating, comment)
            values (:bookingId, :propertyId, :userId, :rating, :comment)
            """;
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("bookingId", review.getBookingId())
            .addValue("propertyId", review.getPropertyId())
            .addValue("userId", review.getUserId())
            .addValue("rating", review.getRating())
            .addValue("comment", review.getComment());

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        Number key = keyHolder.getKey();
        return key == null ? null : key.longValue();
    }

    @Override
    public Optional<PropertyReviewRecord> findById(Long id) {
        String sql = """
            select id, booking_id, property_id, user_id, rating, comment, created_at, updated_at
            from rn_property_reviews
            where id = :id
            """;
        List<PropertyReviewRecord> results = jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("id", id),
            REVIEW_ROW_MAPPER);
        return results.stream().findFirst();
    }

    @Override
    public boolean existsByBookingId(Long bookingId) {
        String sql = """
            select count(*) from rn_property_reviews where booking_id = :bookingId
            """;
        Integer count = jdbcTemplate.queryForObject(
            sql,
            new MapSqlParameterSource("bookingId", bookingId),
            Integer.class);
        return count != null && count > 0;
    }

    @Override
    public List<PropertyReviewRecord> findByPropertyId(Long propertyId) {
        String sql = """
            select id, booking_id, property_id, user_id, rating, comment, created_at, updated_at
            from rn_property_reviews
            where property_id = :propertyId
            order by created_at desc
            """;
        return jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("propertyId", propertyId),
            REVIEW_ROW_MAPPER);
    }
}
