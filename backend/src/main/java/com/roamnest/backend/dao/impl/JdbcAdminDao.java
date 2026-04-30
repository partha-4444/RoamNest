package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.AdminDao;
import com.roamnest.backend.dto.AdminBookingResponse;
import com.roamnest.backend.dto.AdminPropertyResponse;
import com.roamnest.backend.dto.AdminSummaryResponse;
import com.roamnest.backend.dto.ReviewSummary;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

@Repository
public class JdbcAdminDao implements AdminDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcAdminDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public AdminSummaryResponse findSummary() {
        String sql = """
            SELECT
                (SELECT COUNT(*) FROM rn_users u JOIN rn_roles r ON u.role_id = r.id WHERE r.name = 'ADMIN')  AS admin_count,
                (SELECT COUNT(*) FROM rn_users u JOIN rn_roles r ON u.role_id = r.id WHERE r.name = 'OWNER')  AS owner_count,
                (SELECT COUNT(*) FROM rn_users u JOIN rn_roles r ON u.role_id = r.id WHERE r.name = 'USER')   AS user_count,
                (SELECT COUNT(*) FROM rn_properties)                                                           AS total_properties,
                (SELECT COUNT(*) FROM rn_properties WHERE available = true)                                    AS available_properties,
                (SELECT COUNT(*) FROM rn_bookings WHERE status = 'PENDING')                                    AS pending_bookings,
                (SELECT COUNT(*) FROM rn_bookings WHERE status = 'APPROVED')                                   AS approved_bookings,
                (SELECT COUNT(*) FROM rn_bookings WHERE status = 'REJECTED')                                   AS rejected_bookings,
                (SELECT COUNT(*) FROM rn_bookings WHERE status = 'CANCELLED')                                  AS cancelled_bookings,
                (SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.0) FROM rn_property_reviews)               AS overall_avg_rating
            """;

        return jdbcTemplate.queryForObject(sql, Collections.emptyMap(), (rs, rowNum) ->
            new AdminSummaryResponse(
                rs.getLong("admin_count"),
                rs.getLong("owner_count"),
                rs.getLong("user_count"),
                rs.getLong("total_properties"),
                rs.getLong("available_properties"),
                rs.getLong("pending_bookings"),
                rs.getLong("approved_bookings"),
                rs.getLong("rejected_bookings"),
                rs.getLong("cancelled_bookings"),
                rs.getDouble("overall_avg_rating")));
    }

    @Override
    public List<AdminPropertyResponse> findAllProperties() {
        String sql = """
            SELECT
                p.id, p.owner_id, u.username AS owner_username, u.full_name AS owner_full_name,
                p.title, p.description, p.location, p.address, p.price_per_night,
                p.max_guests, p.available, p.created_at, p.updated_at,
                COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.0) AS avg_rating,
                COUNT(r.id)                                       AS review_count
            FROM rn_properties p
            JOIN rn_users u ON p.owner_id = u.id
            LEFT JOIN rn_property_reviews r ON r.property_id = p.id
            GROUP BY p.id, u.username, u.full_name
            ORDER BY p.created_at DESC, p.id DESC
            """;

        return jdbcTemplate.query(sql, Collections.emptyMap(), (rs, rowNum) -> {
            ReviewSummary summary = new ReviewSummary(
                rs.getDouble("avg_rating"),
                rs.getInt("review_count"));
            return new AdminPropertyResponse(
                rs.getLong("id"),
                rs.getLong("owner_id"),
                rs.getString("owner_username"),
                rs.getString("owner_full_name"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("location"),
                rs.getString("address"),
                rs.getBigDecimal("price_per_night"),
                rs.getInt("max_guests"),
                rs.getBoolean("available"),
                summary,
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class));
        });
    }

    @Override
    public List<AdminBookingResponse> findAllBookings(String status) {
        StringBuilder sql = new StringBuilder("""
            SELECT
                b.id, b.property_id, p.title AS property_title,
                b.user_id AS guest_user_id, u.username AS guest_username,
                b.check_in_date, b.check_out_date, b.guests, b.status,
                b.owner_decision_note, b.decided_by, b.decided_at, b.created_at, b.updated_at
            FROM rn_bookings b
            JOIN rn_properties p ON b.property_id = p.id
            JOIN rn_users u      ON b.user_id      = u.id
            """);

        MapSqlParameterSource params = new MapSqlParameterSource();
        if (status != null && !status.isBlank()) {
            sql.append(" WHERE b.status = :status");
            params.addValue("status", status.toUpperCase());
        }
        sql.append(" ORDER BY b.created_at DESC");

        return jdbcTemplate.query(sql.toString(), params, (rs, rowNum) ->
            new AdminBookingResponse(
                rs.getLong("id"),
                rs.getLong("property_id"),
                rs.getString("property_title"),
                rs.getLong("guest_user_id"),
                rs.getString("guest_username"),
                rs.getObject("check_in_date", LocalDate.class),
                rs.getObject("check_out_date", LocalDate.class),
                rs.getInt("guests"),
                rs.getString("status"),
                rs.getString("owner_decision_note"),
                getNullableLong(rs.getObject("decided_by")),
                rs.getObject("decided_at", OffsetDateTime.class),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class)));
    }

    private static Long getNullableLong(Object value) {
        return value instanceof Number n ? n.longValue() : null;
    }
}
