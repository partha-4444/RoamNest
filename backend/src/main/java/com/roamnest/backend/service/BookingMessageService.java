package com.roamnest.backend.service;

import com.roamnest.backend.dao.BookingDao;
import com.roamnest.backend.dao.BookingMessageDao;
import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.BookingMessageResponse;
import com.roamnest.backend.dto.CreateMessageRequest;
import com.roamnest.backend.model.BookingMessageRecord;
import com.roamnest.backend.model.BookingRecord;
import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookingMessageService {

    private static final String ROLE_OWNER = "OWNER";
    private static final String ROLE_USER = "USER";
    private static final String STATUS_APPROVED = "APPROVED";

    private final BookingMessageDao messageDao;
    private final BookingDao bookingDao;
    private final PropertyDao propertyDao;
    private final UserDao userDao;

    public BookingMessageService(BookingMessageDao messageDao,
                                 BookingDao bookingDao,
                                 PropertyDao propertyDao,
                                 UserDao userDao) {
        this.messageDao = messageDao;
        this.bookingDao = bookingDao;
        this.propertyDao = propertyDao;
        this.userDao = userDao;
    }

    @Transactional
    public BookingMessageResponse sendMessage(String username, Long bookingId, CreateMessageRequest request) {
        UserAccount sender = getCurrentUser(username);
        BookingRecord booking = getApprovedBooking(bookingId);
        requireParticipant(sender, booking);

        BookingMessageRecord record = new BookingMessageRecord();
        record.setBookingId(bookingId);
        record.setSenderId(sender.getId());
        record.setMessage(request.getMessage().trim());

        Long messageId = messageDao.create(record);
        if (messageId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send message");
        }

        return messageDao.findById(messageId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Sent message not found"));
    }

    public List<BookingMessageResponse> listMessages(String username, Long bookingId) {
        UserAccount caller = getCurrentUser(username);
        BookingRecord booking = getApprovedBooking(bookingId);
        requireParticipant(caller, booking);

        return messageDao.findByBookingId(bookingId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    private BookingRecord getApprovedBooking(Long bookingId) {
        BookingRecord booking = bookingDao.findById(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!STATUS_APPROVED.equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Messaging is only allowed for approved bookings");
        }
        return booking;
    }

    /**
     * Caller must be either the booking's guest (USER) or the owner of the property (OWNER).
     * Owners cannot message arbitrary bookings — only those on properties they own.
     */
    private void requireParticipant(UserAccount caller, BookingRecord booking) {
        if (ROLE_USER.equals(caller.getRole())) {
            if (!booking.getUserId().equals(caller.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not the guest for this booking");
            }
        } else if (ROLE_OWNER.equals(caller.getRole())) {
            PropertyRecord property = propertyDao.findById(booking.getPropertyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
            if (!property.getOwnerId().equals(caller.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not own the property for this booking");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private UserAccount getCurrentUser(String username) {
        return userDao.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private BookingMessageResponse toResponse(BookingMessageRecord record) {
        return new BookingMessageResponse(
            record.getId(),
            record.getBookingId(),
            record.getSenderId(),
            record.getMessage(),
            record.getCreatedAt());
    }
}
