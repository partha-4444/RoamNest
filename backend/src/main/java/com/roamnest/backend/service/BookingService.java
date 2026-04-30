package com.roamnest.backend.service;

import com.roamnest.backend.dao.BookingDao;
import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.BookingDecisionRequest;
import com.roamnest.backend.dto.BookingResponse;
import com.roamnest.backend.dto.CreateBookingRequest;
import com.roamnest.backend.model.BookingRecord;
import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
public class BookingService {

    private static final String ROLE_OWNER = "OWNER";
    private static final String ROLE_USER = "USER";
    private static final String STATUS_PENDING = "PENDING";

    private final BookingDao bookingDao;
    private final PropertyDao propertyDao;
    private final UserDao userDao;

    public BookingService(BookingDao bookingDao, PropertyDao propertyDao, UserDao userDao) {
        this.bookingDao = bookingDao;
        this.propertyDao = propertyDao;
        this.userDao = userDao;
    }

    @Transactional
    public BookingResponse createBooking(String username, CreateBookingRequest request) {
        UserAccount user = getCurrentUser(username);
        requireRole(user, ROLE_USER, "Only users can book properties");
        validateDateRange(request.getCheckInDate(), request.getCheckOutDate());

        PropertyRecord property = propertyDao.findById(request.getPropertyId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        if (!property.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not available");
        }
        if (property.getOwnerId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Users cannot book their own property");
        }
        if (request.getGuests() > property.getMaxGuests()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest count exceeds property capacity");
        }
        if (bookingDao.existsApprovedOverlap(
            property.getId(),
            request.getCheckInDate(),
            request.getCheckOutDate(),
            null)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Property is already booked for these dates");
        }

        BookingRecord booking = new BookingRecord();
        booking.setPropertyId(property.getId());
        booking.setUserId(user.getId());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setGuests(request.getGuests());
        booking.setStatus(STATUS_PENDING);

        Long bookingId = bookingDao.create(booking);
        if (bookingId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create booking");
        }

        return bookingDao.findById(bookingId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created booking not found"));
    }

    @Transactional
    public BookingResponse approveBooking(String username, Long bookingId, BookingDecisionRequest request) {
        UserAccount owner = getCurrentUser(username);
        requireRole(owner, ROLE_OWNER, "Only owners can approve bookings");

        BookingRecord booking = getBooking(bookingId);
        PropertyRecord property = getOwnedProperty(owner, booking);
        requirePending(booking);
        if (!property.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not available");
        }
        if (bookingDao.existsApprovedOverlap(
            booking.getPropertyId(),
            booking.getCheckInDate(),
            booking.getCheckOutDate(),
            booking.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Property is already booked for these dates");
        }

        bookingDao.approve(bookingId, owner.getId(), getDecisionNote(request));
        return bookingDao.findById(bookingId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    @Transactional
    public BookingResponse rejectBooking(String username, Long bookingId, BookingDecisionRequest request) {
        UserAccount owner = getCurrentUser(username);
        requireRole(owner, ROLE_OWNER, "Only owners can reject bookings");

        BookingRecord booking = getBooking(bookingId);
        getOwnedProperty(owner, booking);
        requirePending(booking);

        bookingDao.reject(bookingId, owner.getId(), getDecisionNote(request));
        return bookingDao.findById(bookingId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private BookingRecord getBooking(Long bookingId) {
        return bookingDao.findById(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private PropertyRecord getOwnedProperty(UserAccount owner, BookingRecord booking) {
        PropertyRecord property = propertyDao.findById(booking.getPropertyId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        if (!property.getOwnerId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the property owner can decide this booking");
        }
        return property;
    }

    private UserAccount getCurrentUser(String username) {
        return userDao.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void requireRole(UserAccount user, String expectedRole, String message) {
        if (!expectedRole.equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
        }
    }

    private void requirePending(BookingRecord booking) {
        if (!STATUS_PENDING.equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending bookings can be decided");
        }
    }

    private void validateDateRange(LocalDate checkInDate, LocalDate checkOutDate) {
        if (!checkOutDate.isAfter(checkInDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out date must be after check-in date");
        }
    }

    private String getDecisionNote(BookingDecisionRequest request) {
        if (request == null || request.getOwnerDecisionNote() == null || request.getOwnerDecisionNote().isBlank()) {
            return null;
        }
        return request.getOwnerDecisionNote().trim();
    }

    private BookingResponse toResponse(BookingRecord booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getPropertyId(),
            booking.getUserId(),
            booking.getCheckInDate(),
            booking.getCheckOutDate(),
            booking.getGuests(),
            booking.getStatus(),
            booking.getOwnerDecisionNote(),
            booking.getDecidedBy(),
            booking.getDecidedAt(),
            booking.getCreatedAt(),
            booking.getUpdatedAt());
    }
}
