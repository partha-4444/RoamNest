package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.BookingDao;
import com.roamnest.backend.model.BookingRecord;
import com.roamnest.backend.model.OwnerBookingRecord;
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

    @Override
    public Optional<OwnerBookingRecord> findOwnerBookingById(Long bookingId) {
        String sql = """
            select b.id, b.property_id, p.title as property_title, p.location as property_location,
                   u.id as guest_user_id, u.full_name as guest_full_name, u.username as guest_username,
                   u.phone_no as guest_phone_no, u.address as guest_address,
                   b.check_in_date, b.check_out_date, b.guests, b.status,
                   b.owner_decision_note, b.decided_at, b.created_at, b.updated_at
            from rn_bookings b
            join rn_properties p on b.property_id = p.id
            join rn_users u on b.user_id = u.id
            where b.id = :bookingId
            """;
        List<OwnerBookingRecord> results = jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("bookingId", bookingId),
            OWNER_BOOKING_ROW_MAPPER);
        return results.stream().findFirst();
    }

    @Override
    public List<OwnerBookingRecord> findByOwnerIdAndStatus(Long ownerId, String status) {
        StringBuilder sql = new StringBuilder("""
            select b.id, b.property_id, p.title as property_title, p.location as property_location,
                   u.id as guest_user_id, u.full_name as guest_full_name, u.username as guest_username,
                   u.phone_no as guest_phone_no, u.address as guest_address,
                   b.check_in_date, b.check_out_date, b.guests, b.status,
                   b.owner_decision_note, b.decided_at, b.created_at, b.updated_at
            from rn_bookings b
            join rn_properties p on b.property_id = p.id
            join rn_users u on b.user_id = u.id
            where p.owner_id = :ownerId
            """);
        MapSqlParameterSource params = new MapSqlParameterSource("ownerId", ownerId);

        if (status != null && !status.isBlank()) {
            sql.append(" and b.status = :status");
            params.addValue("status", status.toUpperCase());
        }
        sql.append(" order by b.created_at desc");

        return jdbcTemplate.query(sql.toString(), params, OWNER_BOOKING_ROW_MAPPER);
    }

    @Override
    public List<OwnerBookingRecord> findByUserIdAndStatus(Long userId, String status) {
        StringBuilder sql = new StringBuilder("""
            select b.id, b.property_id, p.title as property_title, p.location as property_location,
                   null as guest_user_id, null as guest_full_name, null as guest_username,
                   null as guest_phone_no, null as guest_address,
                   b.check_in_date, b.check_out_date, b.guests, b.status,
                   b.owner_decision_note, b.decided_at, b.created_at, b.updated_at
            from rn_bookings b
            join rn_properties p on b.property_id = p.id
            where b.user_id = :userId
            """);
        MapSqlParameterSource params = new MapSqlParameterSource("userId", userId);

        if (status != null && !status.isBlank()) {
            sql.append(" and b.status = :status");
            params.addValue("status", status.toUpperCase());
        }
        sql.append(" order by b.created_at desc");

        return jdbcTemplate.query(sql.toString(), params, OWNER_BOOKING_ROW_MAPPER);
    }

    private static final org.springframework.jdbc.core.RowMapper<OwnerBookingRecord> OWNER_BOOKING_ROW_MAPPER =
        (rs, rowNum) -> {
            OwnerBookingRecord rec = new OwnerBookingRecord();
            rec.setId(rs.getLong("id"));
            rec.setPropertyId(rs.getLong("property_id"));
            rec.setPropertyTitle(rs.getString("property_title"));
            rec.setPropertyLocation(rs.getString("property_location"));
            rec.setGuestUserId(getNullableLong(rs.getObject("guest_user_id")));
            rec.setGuestFullName(rs.getString("guest_full_name"));
            rec.setGuestUsername(rs.getString("guest_username"));
            rec.setGuestPhoneNo(rs.getString("guest_phone_no"));
            rec.setGuestAddress(rs.getString("guest_address"));
            rec.setCheckInDate(rs.getObject("check_in_date", LocalDate.class));
            rec.setCheckOutDate(rs.getObject("check_out_date", LocalDate.class));
            rec.setGuests(rs.getInt("guests"));
            rec.setStatus(rs.getString("status"));
            rec.setOwnerDecisionNote(rs.getString("owner_decision_note"));
            rec.setDecidedAt(rs.getObject("decided_at", OffsetDateTime.class));
            rec.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
            rec.setUpdatedAt(rs.getObject("updated_at", OffsetDateTime.class));
            return rec;
        };

    private static Long getNullableLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }
}
