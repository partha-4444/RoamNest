package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.BookingDao;
import com.roamnest.backend.model.BookingRecord;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcBookingDao implements BookingDao {

    private static final RowMapper<BookingRecord> BOOKING_ROW_MAPPER = (rs, rowNum) -> {
        BookingRecord booking = new BookingRecord();
        booking.setId(rs.getLong("id"));
        booking.setPropertyId(rs.getLong("property_id"));
        booking.setUserId(rs.getLong("user_id"));
        booking.setCheckInDate(rs.getObject("check_in_date", LocalDate.class));
        booking.setCheckOutDate(rs.getObject("check_out_date", LocalDate.class));
        booking.setGuests(rs.getInt("guests"));
        booking.setStatus(rs.getString("status"));
        booking.setOwnerDecisionNote(rs.getString("owner_decision_note"));
        booking.setDecidedBy(getNullableLong(rs.getObject("decided_by")));
        booking.setDecidedAt(rs.getObject("decided_at", OffsetDateTime.class));
        booking.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
        booking.setUpdatedAt(rs.getObject("updated_at", OffsetDateTime.class));
        return booking;
    };

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcBookingDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Long create(BookingRecord booking) {
        String sql = """
            insert into rn_bookings
                (property_id, user_id, check_in_date, check_out_date, guests, status)
            values
                (:propertyId, :userId, :checkInDate, :checkOutDate, :guests, :status)
            """;
        SqlParameterSource params = new MapSqlParameterSource()
            .addValue("propertyId", booking.getPropertyId())
            .addValue("userId", booking.getUserId())
            .addValue("checkInDate", booking.getCheckInDate())
            .addValue("checkOutDate", booking.getCheckOutDate())
            .addValue("guests", booking.getGuests())
            .addValue("status", booking.getStatus());

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        Number key = keyHolder.getKey();
        return key == null ? null : key.longValue();
    }

    @Override
    public Optional<BookingRecord> findById(Long id) {
        String sql = """
            select id, property_id, user_id, check_in_date, check_out_date, guests, status,
                   owner_decision_note, decided_by, decided_at, created_at, updated_at
            from rn_bookings
            where id = :id
            """;
        List<BookingRecord> bookings = jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("id", id),
            BOOKING_ROW_MAPPER);
        return bookings.stream().findFirst();
    }

    @Override
    public boolean existsApprovedOverlap(Long propertyId,
                                         LocalDate checkInDate,
                                         LocalDate checkOutDate,
                                         Long excludedBookingId) {
        String excludeCurrentBookingClause = excludedBookingId == null ? "" : " and id <> :excludedBookingId";
        String sql = """
            select count(*)
            from rn_bookings
            where property_id = :propertyId
              and status = 'APPROVED'
              and check_in_date < :checkOutDate
              and check_out_date > :checkInDate
            """ + excludeCurrentBookingClause;
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("propertyId", propertyId)
            .addValue("checkInDate", checkInDate)
            .addValue("checkOutDate", checkOutDate);
        if (excludedBookingId != null) {
            params.addValue("excludedBookingId", excludedBookingId);
        }
        Integer count = jdbcTemplate.queryForObject(sql, params, Integer.class);
        return count != null && count > 0;
    }

    @Override
    public void approve(Long bookingId, Long ownerId, String ownerDecisionNote) {
        updateDecision(bookingId, ownerId, ownerDecisionNote, "APPROVED");
    }

    @Override
    public void reject(Long bookingId, Long ownerId, String ownerDecisionNote) {
        updateDecision(bookingId, ownerId, ownerDecisionNote, "REJECTED");
    }

    private void updateDecision(Long bookingId, Long ownerId, String ownerDecisionNote, String status) {
        String sql = """
            update rn_bookings
            set status = :status,
                owner_decision_note = :ownerDecisionNote,
                decided_by = :ownerId,
                decided_at = now(),
                updated_at = now()
            where id = :bookingId
            """;
        SqlParameterSource params = new MapSqlParameterSource()
            .addValue("status", status)
            .addValue("ownerDecisionNote", ownerDecisionNote)
            .addValue("ownerId", ownerId)
            .addValue("bookingId", bookingId);
        jdbcTemplate.update(sql, params);
    }

    private static Long getNullableLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }
}
