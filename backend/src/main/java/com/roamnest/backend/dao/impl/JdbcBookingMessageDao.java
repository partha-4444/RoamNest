package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.BookingMessageDao;
import com.roamnest.backend.model.BookingMessageRecord;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcBookingMessageDao implements BookingMessageDao {

    private static final RowMapper<BookingMessageRecord> MESSAGE_ROW_MAPPER = (rs, rowNum) -> {
        BookingMessageRecord msg = new BookingMessageRecord();
        msg.setId(rs.getLong("id"));
        msg.setBookingId(rs.getLong("booking_id"));
        msg.setSenderId(rs.getLong("sender_id"));
        msg.setMessage(rs.getString("message"));
        msg.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
        return msg;
    };

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcBookingMessageDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Long create(BookingMessageRecord message) {
        String sql = """
            insert into rn_booking_messages (booking_id, sender_id, message)
            values (:bookingId, :senderId, :message)
            """;
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("bookingId", message.getBookingId())
            .addValue("senderId", message.getSenderId())
            .addValue("message", message.getMessage());

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        Number key = keyHolder.getKey();
        return key == null ? null : key.longValue();
    }

    @Override
    public Optional<BookingMessageRecord> findById(Long id) {
        String sql = """
            select id, booking_id, sender_id, message, created_at
            from rn_booking_messages
            where id = :id
            """;
        List<BookingMessageRecord> results = jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("id", id),
            MESSAGE_ROW_MAPPER);
        return results.stream().findFirst();
    }

    @Override
    public List<BookingMessageRecord> findByBookingId(Long bookingId) {
        String sql = """
            select id, booking_id, sender_id, message, created_at
            from rn_booking_messages
            where booking_id = :bookingId
            order by created_at asc
            """;
        return jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("bookingId", bookingId),
            MESSAGE_ROW_MAPPER);
    }
}
